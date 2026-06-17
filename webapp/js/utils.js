/* ================================================================
   UTILITÁRIOS - Funções auxiliares globais
   ================================================================ */

const Utils = {
  // Formatação de Moeda
  formatCurrency: (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  },

  // Formatação de Data
  formatDate: (date, format = 'DD/MM/YYYY') => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    const map = {
      'DD/MM/YYYY': `${day}/${month}/${year}`,
      'YYYY-MM-DD': `${year}-${month}-${day}`,
      'DD/MM/YYYY HH:MM': `${day}/${month}/${year} ${hours}:${minutes}`,
      'HH:MM': `${hours}:${minutes}`
    };

    return map[format] || `${day}/${month}/${year}`;
  },

  // Formatação de Data Relativa
  formatRelativeDate: (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return Utils.formatDate(d, 'DD/MM/YYYY');
    }
  },

  // Validação de Email
  isValidEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validação de Telefone
  isValidPhone: (phone) => {
    const re = /^\+?55?[\s-]?(\d{2})[\s-]?(\d{4,5})[\s-]?(\d{4})$/;
    return re.test(phone.replace(/\D/g, ''));
  },

  // Validação de Data
  isValidDate: (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  },

  // Geração de ID Único
  generateId: () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Storage Local
  localStorage: {
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
      }
    },

    get: (key, defaultValue = null) => {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
      } catch (e) {
        console.error('Erro ao ler do localStorage:', e);
        return defaultValue;
      }
    },

    remove: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Erro ao remover do localStorage:', e);
      }
    },

    clear: () => {
      try {
        localStorage.clear();
      } catch (e) {
        console.error('Erro ao limpar localStorage:', e);
      }
    }
  },

  // Notificações
  showNotification: (message, type = 'info', duration = 3000) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
      <span class="alert-icon">
        ${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}
      </span>
      <span>${message}</span>
      <button class="alert-close">×</button>
    `;

    const container = document.querySelector('.main-content') || document.body;
    container.insertBefore(alertDiv, container.firstChild);

    const closeBtn = alertDiv.querySelector('.alert-close');
    closeBtn.addEventListener('click', () => {
      alertDiv.remove();
    });

    if (duration) {
      setTimeout(() => {
        alertDiv.remove();
      }, duration);
    }
  },

  // Confirmação
  confirm: (message) => {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal active';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Confirmação</h2>
            <button class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" data-action="cancel">Cancelar</button>
            <button class="btn btn-primary" data-action="confirm">Confirmar</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const confirmBtn = modal.querySelector('[data-action="confirm"]');
      const cancelBtn = modal.querySelector('[data-action="cancel"]');
      const closeBtn = modal.querySelector('.modal-close');

      const close = () => {
        modal.remove();
      };

      confirmBtn.addEventListener('click', () => {
        resolve(true);
        close();
      });

      cancelBtn.addEventListener('click', () => {
        resolve(false);
        close();
      });

      closeBtn.addEventListener('click', () => {
        resolve(false);
        close();
      });
    });
  },

  // Validação de Formulário
  validateForm: (form) => {
    const errors = {};
    const inputs = form.querySelectorAll('.form-control');

    inputs.forEach((input) => {
      input.classList.remove('error');

      if (input.hasAttribute('required') && !input.value.trim()) {
        errors[input.name] = 'Este campo é obrigatório';
        input.classList.add('error');
      }

      if (input.type === 'email' && input.value && !Utils.isValidEmail(input.value)) {
        errors[input.name] = 'Email inválido';
        input.classList.add('error');
      }

      if (input.dataset.minValue && parseFloat(input.value) < parseFloat(input.dataset.minValue)) {
        errors[input.name] = `Valor mínimo é ${input.dataset.minValue}`;
        input.classList.add('error');
      }

      if (input.dataset.maxLength && input.value.length > input.dataset.maxLength) {
        errors[input.name] = `Máximo de ${input.dataset.maxLength} caracteres`;
        input.classList.add('error');
      }
    });

    return Object.keys(errors).length === 0 ? null : errors;
  },

  // Cálculo de Diferença Percentual
  calculatePercentageDifference: (current, previous) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / Math.abs(previous)) * 100);
  },

  // Classificação de Gasto
  getSpendingCategory: (amount) => {
    if (amount < 50) return 'pequeno';
    if (amount < 200) return 'médio';
    if (amount < 500) return 'grande';
    return 'muito-grande';
  },

  // URL Parameters
  getUrlParam: (param) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  },

  // Redirect
  redirect: (url) => {
    window.location.href = url;
  },

  // CSV Export
  exportToCSV: (data, filename = 'export.csv') => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => 
        Object.values(row).map(val => 
          `"${String(val).replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Debug
console.log('✓ Utils carregado');
