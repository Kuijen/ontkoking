/**
 * Auth: accounts (localStorage) en sessie (sessionStorage).
 * Let op: wachtwoorden staan hier leesbaar in localStorage. Dat is prima voor
 * een schoolproject zonder backend, maar nooit zo doen in productie.
 */
const Auth = (() => {
  const ACCOUNTS_KEY = 'ff_accounts';
  const SESSION_KEY = 'ff_session';
  const MAIN_ADMIN = 'ikbenadmin123';
  const DEFAULT_ACCOUNTS = [{ username: MAIN_ADMIN, password: 'strijders', role: 'admin' }];

  const sameName = (a, b) => a.toLowerCase() === b.toLowerCase();

  const saveAccounts = (accounts) => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  };

  const getAccounts = () => {
    let accounts = [];
    try {
      const stored = JSON.parse(localStorage.getItem(ACCOUNTS_KEY));
      if (Array.isArray(stored)) accounts = stored;
    } catch {
      accounts = [];
    }
    if (!accounts.some((a) => a.username === MAIN_ADMIN)) {
      accounts = [...DEFAULT_ACCOUNTS, ...accounts];
      saveAccounts(accounts);
    }
    return accounts;
  };

  /** Geeft { username, role } terug of null. De rol komt altijd uit de accountlijst. */
  const getSession = () => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      if (!stored?.username) return null;
      const account = getAccounts().find((a) => a.username === stored.username);
      return account ? { username: account.username, role: account.role } : null;
    } catch {
      return null;
    }
  };

  const startSession = (account) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: account.username }));
  };

  const login = (username, password) => {
    const account = getAccounts().find((a) => sameName(a.username, username) && a.password === password);
    if (!account) return { ok: false, error: 'Ongeldige gebruikersnaam of wachtwoord.' };
    startSession(account);
    return { ok: true, user: account };
  };

  const logout = () => sessionStorage.removeItem(SESSION_KEY);

  const validateRegistration = (username, password) => {
    const errors = {};
    if (!/^[\w.-]{3,20}$/.test(username)) {
      errors.username = 'Gebruikersnaam: 3 tot 20 tekens (letters, cijfers, punt, streepje of underscore).';
    }
    if (password.length < 6) errors.password = 'Wachtwoord moet minimaal 6 tekens hebben.';
    return errors;
  };

  const register = (username, password) => {
    const errors = validateRegistration(username, password);
    if (Object.keys(errors).length) return { ok: false, errors };

    const accounts = getAccounts();
    if (accounts.some((a) => sameName(a.username, username))) {
      return { ok: false, errors: { username: 'Deze gebruikersnaam is al in gebruik.' } };
    }
    const account = { username, password, role: 'user' };
    saveAccounts([...accounts, account]);
    startSession(account);
    return { ok: true, user: account };
  };

  const currentPage = () => `${window.location.pathname.split('/').pop() || 'index.html'}${window.location.search}`;

  /** Stuurt niet-ingelogde bezoekers naar de loginpagina. Geeft de sessie terug of null. */
  const requireLogin = () => {
    const session = getSession();
    if (!session) {
      window.location.replace(`login.html?from=${encodeURIComponent(currentPage())}`);
      return null;
    }
    return session;
  };

  const isAdmin = (session = getSession()) => session?.role === 'admin';

  /** Mag deze gebruiker het recept bewerken of verwijderen? */
  const canManage = (recipe, session = getSession()) =>
    Boolean(session) && (session.role === 'admin' || session.username === recipe.author);

  return { MAIN_ADMIN, getAccounts, saveAccounts, getSession, login, logout, register, requireLogin, isAdmin, canManage };
})();
