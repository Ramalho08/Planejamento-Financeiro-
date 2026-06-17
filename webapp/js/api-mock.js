/* ================================================================
   API MOCK - Simula o backend
   ================================================================ */

const ApiMock = {
  // Base de dados simulada
  db: {
    users: {
      'user123': {
        id: 'user123',
        email: 'joao@example.com',
        fullName: 'João Silva',
        phone: '+5511999999999',
        riskProfile: 'moderate',
        monthlyIncome: 5000,
        profilePicture: '👨‍💼',
        createdAt: new Date().toISOString()
      }
    },
    categories: {
      'cat-1': { id: 'cat-1', name: 'Alimentação', type: 'expense', icon: '🍽️', color: '#FF6B6B' },
      'cat-2': { id: 'cat-2', name: 'Transporte', type: 'expense', icon: '🚕', color: '#0066CC' },
      'cat-3': { id: 'cat-3', name: 'Saúde', type: 'expense', icon: '⚕️', color: '#2ECC71' },
      'cat-4': { id: 'cat-4', name: 'Educação', type: 'expense', icon: '📚', color: '#9B59B6' },
      'cat-5': { id: 'cat-5', name: 'Entretenimento', type: 'expense', icon: '🎬', color: '#E74C3C' },
      'cat-6': { id: 'cat-6', name: 'Assinaturas', type: 'expense', icon: '🔔', color: '#F39C12' },
      'cat-7': { id: 'cat-7', name: 'Salário', type: 'income', icon: '💰', color: '#27AE60' },
      'cat-8': { id: 'cat-8', name: 'Freelance', type: 'income', icon: '💻', color: '#3498DB' }
    },
    transactions: [
      {
        id: 'trans-1',
        userId: 'user123',
        categoryId: 'cat-1',
        amount: 45.90,
        type: 'expense',
        description: 'Pizza Luigi - Delivery',
        date: new Date(2026, 5, 17).toISOString(),
        time: '20:30',
        datetime: new Date(2026, 5, 17, 20, 30).toISOString(),
        tags: ['pizza', 'delivery'],
        status: 'confirmed'
      },
      {
        id: 'trans-2',
        userId: 'user123',
        categoryId: 'cat-2',
        amount: 32.50,
        type: 'expense',
        description: 'Uber para o trabalho',
        date: new Date(2026, 5, 16).toISOString(),
        time: '08:15',
        datetime: new Date(2026, 5, 16, 8, 15).toISOString(),
        tags: ['trabalho', 'transporte'],
        status: 'confirmed'
      },
      {
        id: 'trans-3',
        userId: 'user123',
        categoryId: 'cat-1',
        amount: 128.75,
        type: 'expense',
        description: 'Supermercado Pão de Quó',
        date: new Date(2026, 5, 16).toISOString(),
        time: '18:45',
        datetime: new Date(2026, 5, 16, 18, 45).toISOString(),
        tags: ['compras'],
        status: 'confirmed'
      },
      {
        id: 'trans-4',
        userId: 'user123',
        categoryId: 'cat-7',
        amount: 5000.00,
        type: 'income',
        description: 'Salário Mensal',
        date: new Date(2026, 5, 1).toISOString(),
        time: '08:00',
        datetime: new Date(2026, 5, 1, 8, 0).toISOString(),
        tags: ['salário'],
        status: 'confirmed'
      }
    ],
    budgets: [
      {
        id: 'budget-1',
        userId: 'user123',
        categoryId: 'cat-1',
        limit: 500,
        spent: 328,
        period: 'monthly',
        startDate: new Date(2026, 5, 1).toISOString(),
        endDate: new Date(2026, 5, 30).toISOString()
      },
      {
        id: 'budget-2',
        userId: 'user123',
        categoryId: 'cat-2',
        limit: 300,
        spent: 120,
        period: 'monthly',
        startDate: new Date(2026, 5, 1).toISOString(),
        endDate: new Date(2026, 5, 30).toISOString()
      }
    ],
    insights: [
      {
        id: 'insight-1',
        userId: 'user123',
        type: 'spending_alert',
        title: 'Alerta: Categoria com gastos elevados',
        description: 'Você gastou 35% a mais com "Delivery" em comparação ao mês anterior',
        priority: 'high',
        icon: '⚠️'
      },
      {
        id: 'insight-2',
        userId: 'user123',
        type: 'investment_suggestion',
        title: 'Oportunidade de Investimento',
        description: 'Com seu saldo positivo, considere investir em Tesouro Direto',
        priority: 'medium',
        icon: '💡'
      },
      {
        id: 'insight-3',
        userId: 'user123',
        type: 'savings_tip',
        title: 'Dica de Economia',
        description: 'Você tem 6 assinaturas ativas. Considere cancelar as não utilizadas',
        priority: 'medium',
        icon: '💰'
      }
    ]
  },

  // Simulação de delay
  delay: (ms = 300) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Auth
  login: async (email, password) => {
    await ApiMock.delay();

    if (email === 'joao@example.com' && password === '123456') {
      const user = ApiMock.db.users['user123'];
      const token = Utils.generateId();
      Utils.localStorage.set('authToken', token);
      Utils.localStorage.set('currentUser', user);
      return { success: true, user, token };
    }

    return { success: false, error: 'Email ou senha incorretos' };
  },

  logout: async () => {
    await ApiMock.delay();
    Utils.localStorage.remove('authToken');
    Utils.localStorage.remove('currentUser');
    return { success: true };
  },

  register: async (data) => {
    await ApiMock.delay();

    // Validações
    if (!Utils.isValidEmail(data.email)) {
      return { success: false, error: 'Email inválido' };
    }

    if (data.password.length < 6) {
      return { success: false, error: 'Senha deve ter no mínimo 6 caracteres' };
    }

    const newUser = {
      id: Utils.generateId(),
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      riskProfile: 'moderate',
      monthlyIncome: 0,
      profilePicture: '👤',
      createdAt: new Date().toISOString()
    };

    ApiMock.db.users[newUser.id] = newUser;
    const token = Utils.generateId();
    Utils.localStorage.set('authToken', token);
    Utils.localStorage.set('currentUser', newUser);

    return { success: true, user: newUser, token };
  },

  // Transações
  getTransactions: async (filters = {}) => {
    await ApiMock.delay();

    let transactions = [...ApiMock.db.transactions];

    if (filters.startDate) {
      transactions = transactions.filter(t => new Date(t.date) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      transactions = transactions.filter(t => new Date(t.date) <= new Date(filters.endDate));
    }

    if (filters.categoryId) {
      transactions = transactions.filter(t => t.categoryId === filters.categoryId);
    }

    if (filters.type) {
      transactions = transactions.filter(t => t.type === filters.type);
    }

    return { success: true, data: transactions.sort((a, b) => new Date(b.datetime) - new Date(a.datetime)) };
  },

  createTransaction: async (data) => {
    await ApiMock.delay();

    // Validações
    if (!data.amount || data.amount <= 0) {
      return { success: false, error: 'Valor inválido' };
    }

    if (!data.categoryId) {
      return { success: false, error: 'Categoria obrigatória' };
    }

    if (!data.description || data.description.length < 3) {
      return { success: false, error: 'Descrição deve ter pelo menos 3 caracteres' };
    }

    const newTransaction = {
      id: Utils.generateId(),
      userId: 'user123',
      categoryId: data.categoryId,
      amount: parseFloat(data.amount),
      type: data.type || 'expense',
      description: data.description,
      date: data.date || new Date().toISOString(),
      time: data.time || Utils.formatDate(new Date(), 'HH:MM'),
      datetime: new Date(data.date + 'T' + data.time).toISOString(),
      tags: data.tags || [],
      status: 'confirmed',
      notes: data.notes || ''
    };

    ApiMock.db.transactions.push(newTransaction);

    return { success: true, data: newTransaction };
  },

  updateTransaction: async (id, data) => {
    await ApiMock.delay();

    const transaction = ApiMock.db.transactions.find(t => t.id === id);
    if (!transaction) {
      return { success: false, error: 'Transação não encontrada' };
    }

    Object.assign(transaction, data, {
      datetime: new Date(data.date + 'T' + data.time).toISOString()
    });

    return { success: true, data: transaction };
  },

  deleteTransaction: async (id) => {
    await ApiMock.delay();

    const index = ApiMock.db.transactions.findIndex(t => t.id === id);
    if (index === -1) {
      return { success: false, error: 'Transação não encontrada' };
    }

    ApiMock.db.transactions.splice(index, 1);

    return { success: true };
  },

  // Categorias
  getCategories: async (type = null) => {
    await ApiMock.delay();

    let categories = Object.values(ApiMock.db.categories);

    if (type) {
      categories = categories.filter(c => c.type === type);
    }

    return { success: true, data: categories };
  },

  // Orçamentos
  getBudgets: async () => {
    await ApiMock.delay();

    return { success: true, data: ApiMock.db.budgets };
  },

  updateBudget: async (id, data) => {
    await ApiMock.delay();

    const budget = ApiMock.db.budgets.find(b => b.id === id);
    if (!budget) {
      return { success: false, error: 'Orçamento não encontrado' };
    }

    Object.assign(budget, data);

    return { success: true, data: budget };
  },

  // Insights
  getInsights: async () => {
    await ApiMock.delay();

    return { success: true, data: ApiMock.db.insights };
  },

  dismissInsight: async (id) => {
    await ApiMock.delay();

    const insight = ApiMock.db.insights.find(i => i.id === id);
    if (insight) {
      insight.dismissed = true;
    }

    return { success: true };
  },

  // Relatórios
  generateReport: async (filters) => {
    await ApiMock.delay();

    const transactions = await ApiMock.getTransactions(filters);

    if (!transactions.success) {
      return { success: false, error: 'Erro ao gerar relatório' };
    }

    let totalIncome = 0;
    let totalExpense = 0;
    const byCategory = {};

    transactions.data.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }

      if (!byCategory[t.categoryId]) {
        byCategory[t.categoryId] = { amount: 0, count: 0 };
      }

      byCategory[t.categoryId].amount += t.amount;
      byCategory[t.categoryId].count += 1;
    });

    return {
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: transactions.data.length,
        byCategory,
        transactions: transactions.data
      }
    };
  },

  // Dashboard Summary
  getDashboardSummary: async () => {
    await ApiMock.delay();

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);

    return ApiMock.generateReport({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  }
};

console.log('✓ ApiMock carregado');
