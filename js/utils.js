export const currencyBRL = (value = 0) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value) || 0);

export const COMPOUNDING_PERIOD_LABEL = {
  monthly: 'Mensal',
  weekly: 'Semanal',
  daily: 'Diário',
};

const PERIODS_PER_MONTH = {
  monthly: 1,
  weekly: 4,
  daily: 30,
};

export const calculateCompoundPeriods = (months, compounding = 'monthly') => {
  const safeMonths = Number(months) || 0;
  const multiplier = PERIODS_PER_MONTH[compounding] || 1;
  return Math.max(0, Math.round(safeMonths * multiplier));
};

// Juros compostos: M = C * (1 + i)^n
// i = taxa por período selecionado (mensal/semanal/diário)
// n = quantidade de períodos no prazo informado
export const calculateFinalAmount = (principal, ratePerPeriod, months, compounding = 'monthly') => {
  const p = Number(principal) || 0;
  const i = (Number(ratePerPeriod) || 0) / 100;
  const n = calculateCompoundPeriods(months, compounding);

  return +(p * Math.pow(1 + i, n)).toFixed(2);
};

export const calculateProfit = (principal, finalAmount) => +(finalAmount - principal).toFixed(2);

export const cpfIsValid = (cpf) => {
  const clean = (cpf || '').replace(/\D/g, '');
  if (clean.length !== 11 || /^([0-9])\1+$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(clean[i]) * (10 - i);
  let d1 = 11 - (sum % 11);
  if (d1 > 9) d1 = 0;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(clean[i]) * (11 - i);
  let d2 = 11 - (sum % 11);
  if (d2 > 9) d2 = 0;

  return d1 === Number(clean[9]) && d2 === Number(clean[10]);
};

export const cpfMask = (value = '') =>
  value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

export const phoneMask = (value = '') =>
  value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');

export const debounce = (fn, delay = 300) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

export const formatDateBR = (isoDate) => {
  if (!isoDate) return '-';
  const date = new Date(isoDate);
  return date.toLocaleDateString('pt-BR');
};
