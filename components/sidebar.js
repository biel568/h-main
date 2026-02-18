export const renderSidebar = () => `
<aside class="fixed left-0 top-0 h-full w-64 bg-slate-900/95 border-r border-slate-800 p-5 hidden lg:block">
  <div class="text-2xl font-semibold text-white mb-8">LoanFlow</div>
  <nav class="space-y-2 text-slate-300">
    <a href="#dashboard" class="block px-3 py-2 rounded-lg bg-indigo-600 text-white">Dashboard</a>
    <a href="#clientes" class="block px-3 py-2 rounded-lg hover:bg-slate-800">Clientes</a>
    <a href="#relatorios" class="block px-3 py-2 rounded-lg hover:bg-slate-800">Relatórios</a>
    <a href="#logs" class="block px-3 py-2 rounded-lg hover:bg-slate-800">Logs</a>
  </nav>
</aside>`;
