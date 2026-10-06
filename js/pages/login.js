(() => {
  // Alleen interne .html-pagina's zijn toegestaan als doorstuurdoel (geen open redirect).
  const SAFE_TARGET = /^[\w-]+\.html(\?[\w=&%.\-]*)?$/;
  const from = new URLSearchParams(window.location.search).get('from') || '';
  const redirectTo = SAFE_TARGET.test(from) ? from : 'index.html';

  if (Auth.getSession()) {
    window.location.replace(redirectTo);
    return;
  }

  const form = UI.$('#authForm');
  const tabs = UI.$$('[role="tab"]', form.closest('.card'));
  const confirmGroup = UI.$('#confirmGroup');
  const submitBtn = UI.$('#submitBtn');
  const formAlert = UI.$('#formAlert');
  const switchHint = UI.$('#switchHint');
  const passwordInput = UI.$('#password');

  let mode = 'login';

  const setFieldError = (name, message = '') => {
    const error = UI.$(`#err-${name}`);
    const field = UI.$(`#${name}`);
    error.textContent = message;
    error.hidden = !message;
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  };

  const clearErrors = () => {
    ['username', 'password', 'confirm'].forEach((name) => setFieldError(name));
    formAlert.hidden = true;
  };

  const showAlert = (message) => {
    formAlert.textContent = message;
    formAlert.hidden = false;
  };

  const switchMode = (nextMode) => {
    mode = nextMode;
    const isLogin = mode === 'login';
    tabs.forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.mode === mode)));
    confirmGroup.hidden = isLogin;
    switchHint.hidden = !isLogin;
    submitBtn.textContent = isLogin ? 'Inloggen' : 'Account aanmaken';
    passwordInput.autocomplete = isLogin ? 'current-password' : 'new-password';
    clearErrors();
  };

  tabs.forEach((tab) => tab.addEventListener('click', () => switchMode(tab.dataset.mode)));
  UI.$('#toRegisterBtn').addEventListener('click', () => switchMode('register'));

  form.addEventListener('input', (event) => {
    if (event.target.id) setFieldError(event.target.id);
    formAlert.hidden = true;
  });

  const handleLogin = (username, password) => {
    if (!username || !password) {
      if (!username) setFieldError('username', 'Vul je gebruikersnaam in.');
      if (!password) setFieldError('password', 'Vul je wachtwoord in.');
      return;
    }
    const result = Auth.login(username, password);
    if (!result.ok) {
      showAlert(result.error);
      return;
    }
    UI.flash(`Welkom terug, ${result.user.username}!`);
    window.location.href = redirectTo;
  };

  const handleRegister = (username, password, confirmation) => {
    if (password !== confirmation) {
      setFieldError('confirm', 'De wachtwoorden komen niet overeen.');
      return;
    }
    const result = Auth.register(username, password);
    if (!result.ok) {
      Object.entries(result.errors).forEach(([name, message]) => setFieldError(name, message));
      return;
    }
    UI.flash(`Account aangemaakt. Welkom, ${result.user.username}!`);
    window.location.href = redirectTo;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors();
    const username = form.elements.username.value.trim();
    const password = form.elements.password.value;

    if (mode === 'login') handleLogin(username, password);
    else handleRegister(username, password, form.elements.confirm.value);
  });
})();
