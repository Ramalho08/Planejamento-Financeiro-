/* ================================================================
   DASHBOARD - Página principal
   ================================================================ */

const Dashboard = {
  init: async () => {
    Auth.checkAuth();
    Auth.initializeAuth();
    Dashboard.setupMenuActive();
    await Dashboard.loadSummary();
    Dashboard.setupCharts();
    Dashboard.setupEventListeners();
  },

  setupMenuActive: () => {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const links = document.querySelectorAll('.sidebar-link');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.closest('.sidebar-item').classList.add('active');
      } else {
        link.closest('.sidebar-item').classList.remove('active');
      }
    });
  },

  loadSummary: async () => {
    try {
      const summary = await ApiMock.getDashboardSummary();

      if (summary.success) {
        const data = summary.data;

        // Atualizar métricas
        document.querySelector('[data-metric="balance"]').textContent = Utils.formatCurrency(data.balance);
        document.querySelector('[data-metric="income"]').textContent = Utils.formatCurrency(data.totalIncome);
        document.querySelector('[data-metric="expense"]').textContent = Utils.formatCurrency(data.totalExpense);
        document.querySelector('[data-metric="transactions"]').textContent = data.transactionCount;

        // Atualizar tendências
        const balanceTrend = document.querySelector('[data-trend="balance"]');
        if (data.balance > 0) {
          balanceTrend.textContent = '↑ ' + Utils.calculatePercentageDifference(data.balance, 5000) + '%';
          balanceTrend.classList.remove('negative');
        } else {
          balanceTrend.textContent = '↓ ' + Math.abs(Utils.calculatePercentageDifference(data.balance, 5000)) + '%';
          balanceTrend.classList.add('negative');
        }

        // Salvar para usar em outros componentes
        window.dashboardData = data;

        // Renderizar transações recentes
        Dashboard.renderRecentTransactions(data.transactions.slice(0, 5));

        // Renderizar insights
        await Dashboard.loadInsights();
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
      Utils.showNotification('Erro ao carregar dados do dashboard', 'error');
    }
  },

  renderRecentTransactions: (transactions) => {
    const container = document.querySelector('[data-recent-transactions]');
    if (!container) return;

    if (transactions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <div class="empty-state-title">Sem transações</div>
          <div class="empty-state-text">Comece adicionando sua primeira transação</div>
        </div>
      `;
      return;
    }

    container.innerHTML = transactions.map(transaction => {
      const category = ApiMock.db.categories[transaction.categoryId];
      const isIncome = transaction.type === 'income';
      const sign = isIncome ? '+' : '-';
      const color = isIncome ? 'color: var(--success)' : 'color: var(--danger)';

      return `
        <div class="transaction-item">
          <div class="transaction-icon">${category?.icon || '💳'}</div>
          <div class="transaction-info">
            <div class="transaction-description">${transaction.description}</div>
            <div class="transaction-date">${Utils.formatDate(transaction.date, 'DD/MM')} às ${transaction.time}</div>
          </div>
          <div class="transaction-amount" style="${color}">
            ${sign} ${Utils.formatCurrency(transaction.amount)}
          </div>
        </div>
      `;
    }).join('');
  },

  loadInsights: async () => {
    try {
      const result = await ApiMock.getInsights();

      if (result.success) {
        Dashboard.renderInsights(result.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Erro ao carregar insights:', error);
    }
  },

  renderInsights: (insights) => {
    const container = document.querySelector('[data-insights]');
    if (!container) return;

    container.innerHTML = insights.map(insight => {
      return `
        <div class="insight-card">
          <div class="insight-icon">${insight.icon}</div>
          <div class="insight-content">
            <div class="insight-title">${insight.title}</div>
            <div class="insight-description">${insight.description}</div>
          </div>
          <div class="insight-priority priority-${insight.priority}"></div>
        </div>
      `;
    }).join('');
  },

  setupCharts: () => {
    // Gráfico de Despesas por Categoria
    Dashboard.renderCategoryChart();

    // Gráfico de Evolução de Gastos
    Dashboard.renderTrendChart();
  },

  renderCategoryChart: () => {
    const canvas = document.querySelector('[data-chart="categories"]');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = window.dashboardData;

    if (!data || !data.byCategory) return;

    // Preparar dados
    const categories = [];
    const amounts = [];
    const colors = [];

    Object.entries(data.byCategory).forEach(([categoryId, catData]) => {
      const cat = ApiMock.db.categories[categoryId];
      if (cat && cat.type === 'expense') {
        categories.push(cat.name);
        amounts.push(catData.amount);
        colors.push(cat.color);
      }
    });

    // Simples representação visual (sem library Chart.js)
    Dashboard.drawSimpleChart(canvas, categories, amounts, colors);
  },

  renderTrendChart: () => {
    const canvas = document.querySelector('[data-chart="trend"]');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Dados de exemplo
    const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
    const values = [450, 380, 520, 490];

    Dashboard.drawLineChart(canvas, weeks, values);
  },

  drawSimpleChart: (canvas, labels, data, colors) => {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    const total = data.reduce((a, b) => a + b, 0);
    let currentAngle = -Math.PI / 2;

    // Desenhar fatias
    data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;

      // Fatia
      ctx.fillStyle = colors[index];
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      // Label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round((value / total) * 100) + '%', labelX, labelY);

      currentAngle += sliceAngle;
    });

    // Legenda
    let legendY = 20;
    labels.forEach((label, index) => {
      ctx.fillStyle = colors[index];
      ctx.fillRect(10, legendY, 15, 15);

      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(label + ': ' + Utils.formatCurrency(data[index]), 30, legendY + 12);

      legendY += 25;
    });
  },

  drawLineChart: (canvas, labels, data) => {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Limpar
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Eixos
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding, padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Escala
    const maxValue = Math.max(...data);
    const minValue = 0;
    const range = maxValue - minValue || 1;

    // Desenhar linha
    const pointSpacing = chartWidth / (data.length - 1 || 1);
    ctx.strokeStyle = '#0066CC';
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((value, index) => {
      const x = padding + index * pointSpacing;
      const y = height - padding - ((value - minValue) / range) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Pontos
    data.forEach((value, index) => {
      const x = padding + index * pointSpacing;
      const y = height - padding - ((value - minValue) / range) * chartHeight;

      ctx.fillStyle = '#0066CC';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Labels X
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    labels.forEach((label, index) => {
      const x = padding + index * pointSpacing;
      ctx.fillText(label, x, height - 10);
    });

    // Labels Y
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (range / 5) * i;
      const y = height - padding - ((value - minValue) / range) * chartHeight;
      ctx.fillText(Utils.formatCurrency(value), padding - 10, y);
    }
  },

  setupEventListeners: () => {
    // Botão adicionar transação
    const addTransactionBtn = document.querySelector('[data-action="add-transaction"]');
    if (addTransactionBtn) {
      addTransactionBtn.addEventListener('click', () => {
        window.location.href = 'transactions.html';
      });
    }

    // Botão ver relatórios
    const viewReportsBtn = document.querySelector('[data-action="view-reports"]');
    if (viewReportsBtn) {
      viewReportsBtn.addEventListener('click', () => {
        window.location.href = 'reports.html';
      });
    }

    // Logout
    const logoutBtn = document.querySelector('[data-action="logout"]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', Auth.handleLogout);
    }

    // Menu mobile
    const sidebarToggle = document.querySelector('[data-action="toggle-sidebar"]');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
      });
    }
  }
};

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', Dashboard.init);
