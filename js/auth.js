import {
  auth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from './firebase.js';
import { showToast } from '../components/toast.js';

const loginForm = document.getElementById('loginForm');
const forgotButton = document.getElementById('forgotPasswordBtn');
const loader = document.getElementById('loader');

const toggleLoader = (show) => loader.classList.toggle('hidden', !show);

onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = './dashboard.html';
});

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    toggleLoader(true);
    await signInWithEmailAndPassword(auth, email, password);
    showToast('Login realizado com sucesso!');
    window.location.href = './dashboard.html';
  } catch (error) {
    showToast(`Erro no login: ${error.message}`, 'error');
  } finally {
    toggleLoader(false);
  }
});

forgotButton?.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  if (!email) return showToast('Digite o e-mail para recuperar senha.', 'warning');
  try {
    await sendPasswordResetEmail(auth, email);
    showToast('E-mail de recuperação enviado!');
  } catch (error) {
    showToast(`Erro ao enviar recuperação: ${error.message}`, 'error');
  }
});
