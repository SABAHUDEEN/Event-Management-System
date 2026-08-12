// Central place for talking to the backend API.
// Change API_BASE if your backend runs somewhere else.
const API_BASE = 'http://localhost:4000/api';

const Auth = {
  // sessionStorage (not localStorage) is used on purpose: it's cleared
  // automatically when the browser/tab is closed, so re-opening the app
  // always lands back on the login page instead of silently staying signed in.
  getToken() {
    return sessionStorage.getItem('re_token');
  },
  getUser() {
    const raw = sessionStorage.getItem('re_user');
    return raw ? JSON.parse(raw) : null;
  },
  setSession(token, user) {
    sessionStorage.setItem('re_token', token);
    sessionStorage.setItem('re_user', JSON.stringify(user));
  },
  clearSession() {
    sessionStorage.removeItem('re_token');
    sessionStorage.removeItem('re_user');
  },
  logout() {
    this.clearSession();
    window.location.href = 'index.html';
  },
  // Call this at the top of every protected page.
  requireLogin() {
    if (!this.getToken()) {
      window.location.href = 'index.html';
    }
  }
};

// Generic fetch wrapper: adds the JWT header and parses JSON automatically.
async function apiRequest(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {};
  const token = Auth.getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (!isForm && body) headers['Content-Type'] = 'application/json';

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: isForm ? body : (body ? JSON.stringify(body) : undefined)
  });

  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (res.status === 401) {
    Auth.clearSession();
    window.location.href = 'index.html';
    return Promise.reject(new Error('Not authenticated'));
  }

  if (!res.ok) {
    throw new Error((data && data.error) || 'Request failed');
  }
  return data;
}

const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body }),
  del: (path) => apiRequest(path, { method: 'DELETE' }),
  postForm: (path, formData) => apiRequest(path, { method: 'POST', body: formData, isForm: true })
};

// Small helper for showing success/error banners on any page.
function showAlert(containerId, message, type = 'success') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${message}
    <button class="alert-close" onclick="this.parentElement.remove()">&times;</button></div>`;
}
