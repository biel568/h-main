export const showToast = (message, type = 'success') => {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `px-4 py-3 rounded-xl shadow-lg text-sm mb-2 transition-all duration-500 ${
    type === 'error'
      ? 'bg-red-600 text-white'
      : type === 'warning'
      ? 'bg-amber-500 text-slate-900'
      : 'bg-emerald-600 text-white'
  }`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 450);
  }, 2500);
};
