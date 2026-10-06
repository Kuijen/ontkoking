const AUTH_KEY    = 'ff_accounts';
const SESSION_KEY = 'ff_session';

const DEFAULT_ACCOUNTS = [
  { username: 'ikbenadmin123', password: 'strijders', role: 'admin' }
];

function getAccounts() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)) || DEFAULT_ACCOUNTS; }
  catch { return DEFAULT_ACCOUNTS; }
}

function saveAccounts(accounts) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(accounts));
}

function getSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

function login(username, password) {
  const accounts = getAccounts();
  const match = accounts.find(a => a.username === username && a.password === password);
  if (match) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(match));
    return { ok: true, user: match };
  }
  return { ok: false, error: 'Ongeldige gebruikersnaam of wachtwoord.' };
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

function register(username, password) {
  if (!username.trim() || !password.trim()) return { ok: false, error: 'Vul alle velden in.' };
  if (username.length < 3)  return { ok: false, error: 'Gebruikersnaam minimaal 3 tekens.' };
  if (password.length < 4)  return { ok: false, error: 'Wachtwoord minimaal 4 tekens.' };
  const accounts = getAccounts();
  if (accounts.some(a => a.username === username)) return { ok: false, error: 'Gebruikersnaam al in gebruik.' };
  const newUser = { username, password, role: 'user' };
  accounts.push(newUser);
  saveAccounts(accounts);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  return { ok: true, user: newUser };
}

function requireAdmin(redirectTo = 'login.html') {
  const user = getSession();
  if (!user || user.role !== 'admin') {
    window.location.href = redirectTo + '?from=' + encodeURIComponent(window.location.pathname);
    return false;
  }
  return true;
}

function requireLogin(redirectTo = 'login.html') {
  const user = getSession();
  if (!user) {
    window.location.href = redirectTo + '?from=' + encodeURIComponent(window.location.pathname);
    return false;
  }
  return true;
}
