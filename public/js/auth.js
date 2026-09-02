/**
 * Auth helpers – login, register, logout, current user
 */

function getToken() {
  return localStorage.getItem('nova_token');
}

function setToken(token) {
  if (token) localStorage.setItem('nova_token', token);
  else localStorage.removeItem('nova_token');
}

function getUser() {
  try {
    const s = localStorage.getItem('nova_user');
    return s ? JSON.parse(s) : null;
  } catch (_) {
    return null;
  }
}

function setUser(user) {
  if (user) localStorage.setItem('nova_user', JSON.stringify(user));
  else localStorage.removeItem('nova_user');
}

function isAdmin() {
  const u = getUser();
  return u && u.role === 'admin';
}

async function fetchMe() {
  const token = getToken();
  if (!token) return null;
  try {
    const { data } = await api('/api/auth/me');
    if (data && data.user) {
      setUser(data.user);
      return data.user;
    }
  } catch (_) {}
  setToken(null);
  setUser(null);
  return null;
}

async function login(email, password) {
  const { data } = await api('/api/auth/login', { method: 'POST', body: { email, password } });
  setToken(data.token);
  setUser(data.user);
  return data.user;
}

async function register(name, email, password) {
  const { data } = await api('/api/auth/register', { method: 'POST', body: { name, email, password } });
  setToken(data.token);
  setUser(data.user);
  return data.user;
}

function logout() {
  setToken(null);
  setUser(null);
  window.location.href = '/';
}
