(function () {
  'use strict';

  const PASSWORD_RULES = {
    minLength: 8,
    hasUppercase: /[A-Z]/,
    hasLowercase: /[a-z]/,
    hasNumber: /[0-9]/,
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
  };

  const ROUTES = {
    register: { panel: 'register-panel', tab: 'register' },
    users: { panel: 'users-panel', tab: 'users' },
    terms: { panel: 'terms-panel', tab: 'terms' },
  };

  const form = document.getElementById('registration-form');
  const alertContainer = document.getElementById('alert-container');
  const usersList = document.getElementById('users-list');
  const userCountBadge = document.getElementById('user-count');
  const submitBtn = document.getElementById('submit-btn');
  const submitLoader = document.getElementById('submit-loader');
  const btnText = submitBtn.querySelector('.btn-text');

  const fields = {
    fullName: document.getElementById('fullName'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirmPassword'),
    age: document.getElementById('age'),
  };

  let currentRoute = 'register';

  function init() {
    initRouting();
    initFormValidation();
    initPasswordToggle();
    initRefreshUsers();
    loadUsers();
  }

  function initRouting() {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.route));
    });

    window.addEventListener('hashchange', () => {
      const route = window.location.hash.slice(1) || 'register';
      if (ROUTES[route]) navigateTo(route, false);
    });

    const initialRoute = window.location.hash.slice(1);
    if (initialRoute && ROUTES[initialRoute]) {
      navigateTo(initialRoute, false);
    }
  }

  function navigateTo(route, updateHash = true) {
    if (!ROUTES[route] || currentRoute === route) return;

    currentRoute = route;

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      const isActive = btn.dataset.route === route;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });

    document.querySelectorAll('.panel').forEach((panel) => {
      const isActive = panel.id === ROUTES[route].panel;
      panel.classList.toggle('active', isActive);
      panel.hidden = !isActive;
    });

    if (updateHash) {
      window.location.hash = route;
    }

    if (route === 'users') {
      loadUsers();
    }
  }

  function initFormValidation() {
    fields.fullName.addEventListener('input', () => validateFullName());
    fields.email.addEventListener('input', () => validateEmail());
    fields.password.addEventListener('input', () => {
      updatePasswordStrength();
      validatePassword();
      validateConfirmPassword();
    });
    fields.confirmPassword.addEventListener('input', () => validateConfirmPassword());
    fields.age.addEventListener('input', () => validateAge());

    fields.fullName.addEventListener('blur', () => validateFullName());
    fields.email.addEventListener('blur', () => validateEmail());
    fields.password.addEventListener('blur', () => validatePassword());
    fields.confirmPassword.addEventListener('blur', () => validateConfirmPassword());
    fields.age.addEventListener('blur', () => validateAge());

    form.addEventListener('submit', handleSubmit);
  }

  function initPasswordToggle() {
    document.querySelectorAll('.toggle-password').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.querySelector('.eye-icon').textContent = isPassword ? '🙈' : '👁';
      });
    });
  }

  function initRefreshUsers() {
    document.getElementById('refresh-users').addEventListener('click', loadUsers);
  }

  function validateFullName() {
    const value = fields.fullName.value.trim();
    let error = '';

    if (!value) {
      error = 'Full name is required.';
    } else if (value.length < 2) {
      error = 'Full name must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
      error = 'Full name may only contain letters, spaces, hyphens, and apostrophes.';
    }

    setFieldState('fullName', error);
    return !error;
  }

  function validateEmail() {
    const value = fields.email.value.trim();
    let error = '';

    if (!value) {
      error = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Please enter a valid email address.';
    }

    setFieldState('email', error);
    return !error;
  }

  function getPasswordChecks(password) {
    return {
      length: password.length >= PASSWORD_RULES.minLength,
      uppercase: PASSWORD_RULES.hasUppercase.test(password),
      lowercase: PASSWORD_RULES.hasLowercase.test(password),
      number: PASSWORD_RULES.hasNumber.test(password),
      special: PASSWORD_RULES.hasSpecial.test(password),
    };
  }

  function updatePasswordStrength() {
    const password = fields.password.value;
    const checks = getPasswordChecks(password);
    const passedCount = Object.values(checks).filter(Boolean).length;

    document.querySelectorAll('#password-rules li').forEach((li) => {
      const rule = li.dataset.rule;
      const passed = checks[rule];
      li.classList.toggle('passed', passed);
      li.querySelector('.rule-icon').textContent = passed ? '✓' : '○';
    });

    const fill = document.getElementById('strength-fill');
    const label = document.getElementById('strength-label');

    const levels = [
      { width: '0%', color: '#e2e8f0', text: 'Enter a password' },
      { width: '20%', color: '#dc2626', text: 'Very weak' },
      { width: '40%', color: '#d97706', text: 'Weak' },
      { width: '60%', color: '#ca8a04', text: 'Fair' },
      { width: '80%', color: '#059669', text: 'Strong' },
      { width: '100%', color: '#047857', text: 'Very strong' },
    ];

    const level = password.length === 0 ? levels[0] : levels[passedCount];
    fill.style.width = level.width;
    fill.style.background = level.color;
    label.textContent = level.text;
    label.style.color = level.color;
  }

  function validatePassword() {
    const password = fields.password.value;
    let error = '';

    if (!password) {
      error = 'Password is required.';
    } else {
      const checks = getPasswordChecks(password);
      if (!checks.length) {
        error = `Password must be at least ${PASSWORD_RULES.minLength} characters.`;
      } else if (!checks.uppercase) {
        error = 'Password must contain at least one uppercase letter.';
      } else if (!checks.lowercase) {
        error = 'Password must contain at least one lowercase letter.';
      } else if (!checks.number) {
        error = 'Password must contain at least one number.';
      } else if (!checks.special) {
        error = 'Password must contain at least one special character.';
      }
    }

    setFieldState('password', error);
    return !error;
  }

  function validateConfirmPassword() {
    const password = fields.password.value;
    const confirm = fields.confirmPassword.value;
    const indicator = document.getElementById('match-indicator');
    let error = '';

    if (!confirm) {
      error = 'Please confirm your password.';
      indicator.textContent = '';
      indicator.className = 'match-indicator';
    } else if (password !== confirm) {
      error = 'Passwords do not match.';
      indicator.textContent = '✗ Passwords do not match';
      indicator.className = 'match-indicator no-match';
    } else {
      indicator.textContent = '✓ Passwords match';
      indicator.className = 'match-indicator match';
    }

    setFieldState('confirmPassword', error);
    return !error;
  }

  function validateAge() {
    const value = fields.age.value;
    const parsed = parseInt(value, 10);
    let error = '';

    if (!value) {
      error = 'Age is required.';
    } else if (Number.isNaN(parsed)) {
      error = 'Age must be a valid number.';
    } else if (parsed < 13) {
      error = 'You must be at least 13 years old to register.';
    } else if (parsed > 120) {
      error = 'Please enter a valid age.';
    }

    setFieldState('age', error);
    return !error;
  }

  function setFieldState(fieldName, error) {
    const input = fields[fieldName];
    const errorEl = document.getElementById(`${fieldName}-error`);

    errorEl.textContent = error;
    input.classList.toggle('invalid', !!error);
    input.classList.toggle('valid', !error && input.value.trim() !== '');
  }

  function validateAll() {
    const results = [
      validateFullName(),
      validateEmail(),
      validatePassword(),
      validateConfirmPassword(),
      validateAge(),
    ];
    return results.every(Boolean);
  }

  function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
      <span>${message}</span>
      <button type="button" class="alert-dismiss" aria-label="Dismiss">&times;</button>
    `;

    alert.querySelector('.alert-dismiss').addEventListener('click', () => alert.remove());
    alertContainer.prepend(alert);

    setTimeout(() => {
      if (alert.parentNode) alert.remove();
    }, 5000);
  }

  function showServerErrors(errors) {
    Object.entries(errors).forEach(([field, message]) => {
      if (fields[field]) {
        setFieldState(field, message);
      }
    });

    const errorMessages = Object.values(errors).join(' ');
    showAlert(errorMessages, 'error');
  }

  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    btnText.classList.toggle('hidden', isSubmitting);
    submitLoader.classList.toggle('hidden', !isSubmitting);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateAll()) {
      showAlert('Please fix the errors before submitting.', 'error');
      return;
    }

    setSubmitting(true);

    const formData = {
      fullName: fields.fullName.value.trim(),
      email: fields.email.value.trim(),
      password: fields.password.value,
      confirmPassword: fields.confirmPassword.value,
      age: fields.age.value,
    };

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        showServerErrors(data.errors || {});
        return;
      }

      showAlert(data.message || 'Registration successful!', 'success');
      form.reset();
      updatePasswordStrength();
      document.getElementById('match-indicator').textContent = '';
      Object.keys(fields).forEach((key) => {
        fields[key].classList.remove('valid', 'invalid');
        document.getElementById(`${key}-error`).textContent = '';
      });

      updateUserCount(data.users.length);
      renderUsers(data.users);

      setTimeout(() => navigateTo('users'), 1500);
    } catch {
      showAlert('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function loadUsers() {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();

      if (data.success) {
        updateUserCount(data.users.length);
        renderUsers(data.users);
      }
    } catch {
      usersList.innerHTML = '<p class="empty-state">Failed to load users. Please try again.</p>';
    }
  }

  function updateUserCount(count) {
    userCountBadge.textContent = count;
  }

  function renderUsers(users) {
    if (!users || users.length === 0) {
      usersList.innerHTML = '<p class="empty-state">No users registered yet. Be the first!</p>';
      return;
    }

    usersList.innerHTML = users
      .map(
        (user) => `
        <div class="user-card">
          <div class="user-avatar">${getInitials(user.fullName)}</div>
          <div class="user-info">
            <div class="user-name">${escapeHtml(user.fullName)}</div>
            <div class="user-email">${escapeHtml(user.email)}</div>
            <div class="user-meta">Age: ${user.age} &middot; Registered: ${formatDate(user.registeredAt)}</div>
          </div>
        </div>
      `
      )
      .join('');
  }

  function getInitials(name) {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  init();
})();
