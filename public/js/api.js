/**
 * API client – base URL, auth token, fetch helpers
 */

const API_BASE = '';

function getToken() {
  return localStorage.getItem('nova_token');
}

function setToken(token) {
  if (token) localStorage.setItem('nova_token', token);
  else localStorage.removeItem('nova_token');
}

/**
 * Fetch wrapper: JSON body, auth header, error handling
 * @param {string} url
 * @param {object} opts { method, body, headers }
 * @returns {Promise<{ data: any, ok: boolean }>}
 */
async function api(url, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + url, {
    ...opts,
    headers,
    body: opts.body != null ? JSON.stringify(opts.body) : undefined,
  });

  let data = null;
  const ct = res.headers.get('Content-Type') || '';
  if (ct.includes('application/json')) {
    try {
      data = await res.json();
    } catch (_) {}
  }

  if (!res.ok) {
    const msg = (data && data.message) || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return { data, ok: true };
}

/**
 * FormData fetch (for multipart uploads). No JSON Content-Type.
 */
async function apiForm(url, formData, method = 'POST') {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + url, {
    method,
    headers,
    body: formData,
  });

  let data = null;
  const ct = res.headers.get('Content-Type') || '';
  if (ct.includes('application/json')) {
    try {
      data = await res.json();
    } catch (_) {}
  }

  if (!res.ok) {
    const msg = (data && data.message) || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return { data, ok: true };
}
