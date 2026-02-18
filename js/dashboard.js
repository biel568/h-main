import {
  auth,
  db,
  storage,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  signOut,
  onAuthStateChanged,
} from './firebase.js';
import {
  currencyBRL,
  calculateFinalAmount,
  calculateProfit,
  COMPOUNDING_PERIOD_LABEL,
  cpfIsValid,
  cpfMask,
  phoneMask,
  debounce,
  formatDateBR,
} from './utils.js';
import { renderCharts } from './charts.js';
import { showToast } from '../components/toast.js';
import { renderSidebar } from '../components/sidebar.js';

const state = {
  clients: [],
  filtered: [],
  page: 1,
  perPage: 8,
  user: null,
  role: 'subadmin',
  editId: null,
};

const el = {
  sidebar: document.getElementById('sidebar'),
  userName: document.getElementById('userName'),
  logoutBtn: document.getElementById('logoutBtn'),
  clientForm: document.getElementById('clientForm'),
  tbody: document.getElementById('clientTableBody'),
  searchInput: document.getElementById('searchInput'),
  statusFilter: document.getElementById('statusFilter'),
  startDate: document.getElementById('startDate'),
  endDate: document.getElementById('endDate'),
  sortValue: document.getElementById('sortValue'),
  pagination: document.getElementById('pagination'),
  totalEmprestado: document.getElementById('totalEmprestado'),
  totalComJuros: document.getElementById('totalComJuros'),
  lucroTotal: document.getElementById('lucroTotal'),
  qntClientes: document.getElementById('qntClientes'),
  clientesAtivos: document.getElementById('clientesAtivos'),
  reportMonthly: document.getElementById('reportMonthly'),
  reportYearly: document.getElementById('reportYearly'),
  reportArrecadado: document.getElementById('reportArrecadado'),
  reportInadimplentes: document.getElementById('reportInadimplentes'),
  ranking: document.getElementById('ranking'),
  notifications: document.getElementById('notifications'),
  exportPdf: document.getElementById('exportPdfBtn'),
  exportExcel: document.getElementById('exportExcelBtn'),
  backupBtn: document.getElementById('backupBtn'),
  loader: document.getElementById('loader'),
  logsList: document.getElementById('logsList'),
};

const toggleLoader = (show) => el.loader.classList.toggle('hidden', !show);
const getClientsRef = () => collection(db, 'clients');
const getLogsRef = () => collection(db, 'logs');

const logActivity = async (action, detail = '') => {
  await addDoc(getLogsRef(), {
    userId: state.user?.uid,
    userName: state.user?.displayName || state.user?.email,
    action,
    detail,
    createdAt: serverTimestamp(),
  });
};

const applyFilters = () => {
  const search = el.searchInput.value.toLowerCase().trim();
  const status = el.statusFilter.value;
  const start = el.startDate.value ? new Date(el.startDate.value) : null;
  const end = el.endDate.value ? new Date(el.endDate.value) : null;

  state.filtered = state.clients
    .filter((c) => {
      const matchSearch =
        !search || c.name.toLowerCase().includes(search) || (c.cpf || '').includes(search);
      const matchStatus = !status || c.status === status;
      const date = c.loanDate ? new Date(c.loanDate) : null;
      const matchStart = !start || (date && date >= start);
      const matchEnd = !end || (date && date <= end);
      return matchSearch && matchStatus && matchStart && matchEnd;
    })
    .sort((a, b) => {
      if (el.sortValue.value === 'asc') return a.loanAmount - b.loanAmount;
      if (el.sortValue.value === 'desc') return b.loanAmount - a.loanAmount;
      return 0;
    });

  renderTable();
  renderKpis();
  renderReports();
};

const renderTable = () => {
  const start = (state.page - 1) * state.perPage;
  const pageRows = state.filtered.slice(start, start + state.perPage);

  el.tbody.innerHTML = pageRows
    .map(
      (c) => `
      <tr class="border-b border-slate-800 hover:bg-slate-800/40">
        <td class="py-2">${c.name}</td>
        <td>${c.cpf}</td>
        <td>${currencyBRL(c.loanAmount)}</td>
        <td>${currencyBRL(c.finalAmount)}</td>
        <td>${COMPOUNDING_PERIOD_LABEL[c.compoundingPeriod || 'monthly']}</td>
        <td><span class="px-2 py-1 text-xs rounded-full ${
          c.status === 'ativo'
            ? 'bg-emerald-500/20 text-emerald-300'
            : c.status === 'pago'
            ? 'bg-blue-500/20 text-blue-300'
            : 'bg-red-500/20 text-red-300'
        }">${c.status}</span></td>
        <td>${formatDateBR(c.loanDate)}</td>
        <td class="space-x-1">
          <button data-view="${c.id}" class="view-btn px-2 py-1 rounded bg-cyan-700 text-xs">Detalhes</button>
          <button data-edit="${c.id}" class="edit-btn px-2 py-1 rounded bg-indigo-700 text-xs">Editar</button>
          <button data-pay="${c.id}" class="pay-btn px-2 py-1 rounded bg-emerald-700 text-xs">Marcar pago</button>
          <button data-del="${c.id}" class="del-btn px-2 py-1 rounded bg-rose-700 text-xs">Excluir</button>
        </td>
      </tr>`
    )
    .join('');

  renderPagination();
};

const renderPagination = () => {
  const pages = Math.ceil(state.filtered.length / state.perPage) || 1;
  el.pagination.innerHTML = Array.from({ length: pages }, (_, i) => i + 1)
    .map(
      (n) =>
        `<button class="px-3 py-1 rounded ${n === state.page ? 'bg-indigo-600' : 'bg-slate-800'}" data-page="${n}">${n}</button>`
    )
    .join('');
};

const renderKpis = () => {
  const totalEmprestado = state.filtered.reduce((a, c) => a + c.loanAmount, 0);
  const totalComJuros = state.filtered.reduce((a, c) => a + c.finalAmount, 0);
  const lucroTotal = state.filtered.reduce((a, c) => a + calculateProfit(c.loanAmount, c.finalAmount), 0);
  const ativos = state.filtered.filter((c) => c.status === 'ativo').length;

  el.totalEmprestado.textContent = currencyBRL(totalEmprestado);
  el.totalComJuros.textContent = currencyBRL(totalComJuros);
  el.lucroTotal.textContent = currencyBRL(lucroTotal);
  el.qntClientes.textContent = state.filtered.length;
  el.clientesAtivos.textContent = ativos;

  const monthly = state.filtered.reduce((acc, c) => {
    const key = c.loanDate?.slice(0, 7) || 'sem-data';
    if (!acc[key]) acc[key] = { total: 0, profit: 0 };
    acc[key].total += c.loanAmount;
    acc[key].profit += calculateProfit(c.loanAmount, c.finalAmount);
    return acc;
  }, {});
  renderCharts(monthly);
};

const renderReports = () => {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const year = `${now.getFullYear()}`;
  const monthlyTotal = state.clients
    .filter((c) => (c.loanDate || '').startsWith(month))
    .reduce((a, c) => a + c.finalAmount, 0);
  const yearlyTotal = state.clients
    .filter((c) => (c.loanDate || '').startsWith(year))
    .reduce((a, c) => a + c.finalAmount, 0);
  const inadimplentes = state.clients.filter((c) => c.status === 'atrasado').length;

  el.reportMonthly.textContent = currencyBRL(monthlyTotal);
  el.reportYearly.textContent = currencyBRL(yearlyTotal);
  el.reportArrecadado.textContent = currencyBRL(
    state.clients.filter((c) => c.status === 'pago').reduce((a, c) => a + c.finalAmount, 0)
  );
  el.reportInadimplentes.textContent = `${inadimplentes} clientes`;

  const ranking = [...state.clients]
    .sort((a, b) => b.finalAmount - a.finalAmount)
    .slice(0, 5)
    .map((c) => `<li>${c.name} — ${currencyBRL(c.finalAmount)}</li>`)
    .join('');
  el.ranking.innerHTML = ranking || '<li>Sem dados.</li>';

  const dueSoon = state.clients.filter((c) => {
    if (!c.loanDate || c.status !== 'ativo') return false;
    const base = new Date(c.loanDate);
    base.setMonth(base.getMonth() + Number(c.months || 0));
    const diff = (base - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  el.notifications.innerHTML = dueSoon.length
    ? dueSoon.map((c) => `<li>${c.name}: vence em até 7 dias.</li>`).join('')
    : '<li>Nenhum vencimento próximo.</li>';
};

const collectFormData = async () => {
  const name = document.getElementById('name').value.trim();
  const cpf = document.getElementById('cpf').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const loanAmount = Number(document.getElementById('loanAmount').value);
  const interest = Number(document.getElementById('interest').value);
  const months = Number(document.getElementById('months').value);
  const compoundingPeriod = document.getElementById('compoundingPeriod').value;
  const loanDate = document.getElementById('loanDate').value;
  const status = document.getElementById('status').value;
  const installmentCount = Number(document.getElementById('installmentCount').value) || months;
  const photoFile = document.getElementById('photo').files[0];

  if (!cpfIsValid(cpf)) throw new Error('CPF inválido.');

  const finalAmount = calculateFinalAmount(loanAmount, interest, months, compoundingPeriod);
  const installments = Array.from({ length: installmentCount }, (_, idx) => ({
    number: idx + 1,
    amount: +(finalAmount / installmentCount).toFixed(2),
    paid: false,
  }));

  let photoUrl = '';
  if (photoFile) {
    const photoRef = ref(storage, `clients/${Date.now()}-${photoFile.name}`);
    await uploadBytes(photoRef, photoFile);
    photoUrl = await getDownloadURL(photoRef);
  }

  return {
    name,
    cpf,
    phone,
    address,
    loanAmount,
    interest,
    months,
    compoundingPeriod,
    loanDate,
    status,
    finalAmount,
    installmentCount,
    installments,
    photoUrl,
    updatedAt: serverTimestamp(),
  };
};

const exportPdf = () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.text('Relatório de Empréstimos', 14, 12);
  const rows = state.filtered.map((c) => [c.name, c.cpf, c.status, currencyBRL(c.finalAmount)]);
  pdf.autoTable({ head: [['Nome', 'CPF', 'Status', 'Total']], body: rows, startY: 20 });
  pdf.save('relatorio-emprestimos.pdf');
};

const exportExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(state.filtered);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
  XLSX.writeFile(workbook, 'clientes.xlsx');
};

const runBackup = () => {
  const blob = new Blob([JSON.stringify(state.clients, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `backup-clientes-${Date.now()}.json`;
  a.click();
  showToast('Backup exportado com sucesso.');
};

const bindTableActions = () => {
  el.tbody.addEventListener('click', async (e) => {
    const viewId = e.target.dataset.view;
    const editId = e.target.dataset.edit;
    const delId = e.target.dataset.del;
    const payId = e.target.dataset.pay;

    if (viewId) {
      const c = state.clients.find((item) => item.id === viewId);
      alert(`Cliente: ${c.name}\nTelefone: ${c.phone}\nEndereço: ${c.address}\nJuros: ${COMPOUNDING_PERIOD_LABEL[c.compoundingPeriod || 'monthly']}\nParcelas: ${c.installmentCount}`);
    }

    if (editId) {
      const c = state.clients.find((item) => item.id === editId);
      state.editId = editId;
      Object.entries({
        name: c.name,
        cpf: c.cpf,
        phone: c.phone,
        address: c.address,
        loanAmount: c.loanAmount,
        interest: c.interest,
        months: c.months,
        compoundingPeriod: c.compoundingPeriod || 'monthly',
        loanDate: c.loanDate,
        status: c.status,
        installmentCount: c.installmentCount,
      }).forEach(([id, value]) => (document.getElementById(id).value = value));
      showToast('Cliente carregado para edição.', 'warning');
    }

    if (payId) {
      const clientRef = doc(db, 'clients', payId);
      await updateDoc(clientRef, { status: 'pago' });
      await addDoc(collection(db, 'payments'), {
        clientId: payId,
        paidAt: serverTimestamp(),
        paidBy: state.user.uid,
      });
      await logActivity('PAGAMENTO', `Pagamento registrado para cliente ${payId}`);
      showToast('Pagamento marcado com sucesso!');
    }

    if (delId) {
      if (state.role !== 'admin') {
        showToast('Apenas admin pode excluir.', 'error');
        return;
      }
      const ok = confirm('Tem certeza que deseja excluir?');
      if (!ok) return;
      await deleteDoc(doc(db, 'clients', delId));
      await logActivity('EXCLUSAO', `Cliente ${delId} excluído`);
      showToast('Cliente excluído.');
    }
  });

  el.pagination.addEventListener('click', (e) => {
    if (!e.target.dataset.page) return;
    state.page = Number(e.target.dataset.page);
    renderTable();
  });
};

const bindEvents = () => {
  el.sidebar.innerHTML = renderSidebar();

  document.getElementById('cpf').addEventListener('input', (e) => (e.target.value = cpfMask(e.target.value)));
  document.getElementById('phone').addEventListener('input', (e) => (e.target.value = phoneMask(e.target.value)));

  const filteredHandler = debounce(() => {
    state.page = 1;
    applyFilters();
  }, 250);

  [el.searchInput, el.statusFilter, el.startDate, el.endDate, el.sortValue].forEach((node) =>
    node.addEventListener('input', filteredHandler)
  );

  el.clientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      toggleLoader(true);
      const payload = await collectFormData();
      if (!state.editId) {
        payload.createdAt = serverTimestamp();
        payload.createdBy = state.user.uid;
        await addDoc(getClientsRef(), payload);
        await logActivity('CRIACAO', `Cliente ${payload.name} criado`);
        showToast('Cliente salvo com sucesso!');
      } else {
        const refDoc = doc(db, 'clients', state.editId);
        if (!payload.photoUrl) delete payload.photoUrl;
        await updateDoc(refDoc, payload);
        await logActivity('EDICAO', `Cliente ${payload.name} editado`);
        showToast('Cliente atualizado!');
        state.editId = null;
      }
      el.clientForm.reset();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      toggleLoader(false);
    }
  });

  el.logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = './login.html';
  });

  el.exportPdf.addEventListener('click', exportPdf);
  el.exportExcel.addEventListener('click', exportExcel);
  el.backupBtn.addEventListener('click', runBackup);

  bindTableActions();
};

const subscribeData = () => {
  onSnapshot(query(getClientsRef(), orderBy('createdAt', 'desc')), (snapshot) => {
    state.clients = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    applyFilters();
  });

  onSnapshot(query(getLogsRef(), orderBy('createdAt', 'desc')), (snapshot) => {
    el.logsList.innerHTML = snapshot.docs
      .slice(0, 8)
      .map((d) => {
        const log = d.data();
        return `<li>${log.action} — ${log.userName || 'sistema'} (${log.detail || '-'})</li>`;
      })
      .join('');
  });
};

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = './login.html';
    return;
  }

  state.user = user;
  el.userName.textContent = user.displayName || user.email;

  const roleDoc = await getDoc(doc(db, 'users', user.uid));
  if (roleDoc.exists()) state.role = roleDoc.data().role || 'subadmin';
  document.getElementById('roleBadge').textContent = state.role;

  bindEvents();
  subscribeData();
  setInterval(runBackup, 1000 * 60 * 30);
});
