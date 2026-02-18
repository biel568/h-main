let loanChart;
let profitChart;

export const renderCharts = (monthlyData) => {
  const labels = Object.keys(monthlyData);
  const values = Object.values(monthlyData).map((v) => v.total);
  const profits = Object.values(monthlyData).map((v) => v.profit);

  if (loanChart) loanChart.destroy();
  if (profitChart) profitChart.destroy();

  loanChart = new Chart(document.getElementById('loanChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Empréstimos mensais',
        data: values,
        backgroundColor: '#6366f1',
        borderRadius: 8,
      }],
    },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });

  profitChart = new Chart(document.getElementById('profitChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Lucro mensal',
        data: profits,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        fill: true,
        tension: 0.3,
      }],
    },
    options: { responsive: true },
  });
};
