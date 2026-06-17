/* ================================================================
   AUTENTICAÇÃO - Controle de login e sessão
   ================================================================ */

const Auth = {
  isAuthenticated: () => {
    return !!Utils.localStorage.get('authToken');
  },

  getCurrentUser: () => {
    return Utils.localStorage.get('currentUser');
  },

  getToken: () => {
    return Utils.localStorage.get('authToken');
  },

  handleLogin: async () => {
    const form = document.querySelector('form[name="loginForm"]');
    if (!form) return;

    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    // Validação
    if (!email || !password) {
      Utils.showNotification('Por favor, preencha todos os campos', 'error');
      return;
    }

    if (!Utils.isValidEmail(email)) {
      Utils.showNotification('Email inválido', 'error');
      return;
    }

    // Mostrar loading
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>';

    try {
      const result = await ApiMock.login(email, password);

      if (result.success) {
        Utils.showNotification('Login realizado com sucesso!', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      } else {
        Utils.showNotification(result.error, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    } catch (error) {
      Utils.showNotification('Erro ao fazer login', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },

  handleRegister: async () => {
    const form = document.querySelector('form[name="registerForm"]');
    if (!form) return;

    const errors = Utils.validateForm(form);
    if (errors) {
      Utils.showNotification('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    const fullName = form.querySelector('[name="fullName"]').value;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;
    const confirmPassword = form.querySelector('[name="confirmPassword"]').value;
    const phone = form.querySelector('[name="phone"]').value;

    if (password !== confirmPassword) {
      Utils.showNotification('As senhas não conferem', 'error');
      return;
    }

    // Mostrar loading
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>';

    try {
      const result = await ApiMock.register({
        fullName,
        email,
        password,
        phone
      });

      if (result.success) {
        Utils.showNotification('Conta criada com sucesso!', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      } else {
        Utils.showNotification(result.error, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    } catch (error) {
      Utils.showNotification('Erro ao criar conta', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },

  handleLogout: async () => {
    const confirmed = await Utils.confirm('Deseja realmente sair?');

    if (confirmed) {
      const result = await ApiMock.logout();
      if (result.success) {
        Utils.showNotification('Logout realizado', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      }
    }
  },

  checkAuth: () => {
    if (!Auth.isAuthenticated()) {
      window.location.href = 'index.html';
    }
  },

  initializeAuth: () => {
    const user = Auth.getCurrentUser();
    if (user) {
      const profileSection = document.querySelector('[data-profile-name]');
      const profileEmail = document.querySelector('[data-profile-email]');

      if (profileSection) {
        profileSection.textContent = user.fullName || user.email;
      }
      if (profileEmail) {
        profileEmail.textContent = user.email;
      }
    }
  }
};

console.log('✓ Auth carregado');
