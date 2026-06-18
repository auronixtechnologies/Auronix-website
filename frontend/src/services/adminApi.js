/**
 * Admin API Service
 * All requests include the Authorization: Bearer <token> header.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const TOKEN_KEY = 'auronix_admin_token';

// ── Token helpers ──────────────────────────────
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function adminRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, { headers: authHeaders(), ...options });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/auronix-admin';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ── Auth ──────────────────────────────────────
export const adminAuth = {
  login: (email, password) =>
    adminRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ── Projects ──────────────────────────────────
export const adminProjects = {
  list: (skip = 0, limit = 100) =>
    adminRequest(`/projects?skip=${skip}&limit=${limit}`),

  get: (id) => adminRequest(`/projects/${id}`),

  create: (data) =>
    adminRequest('/projects', { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) =>
    adminRequest(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id) =>
    adminRequest(`/projects/${id}`, { method: 'DELETE' }),
};

// ── Team Members ──────────────────────────────
export const adminTeam = {
  list: (skip = 0, limit = 100) =>
    adminRequest(`/team?skip=${skip}&limit=${limit}`),

  get: (id) => adminRequest(`/team/${id}`),

  create: (data) =>
    adminRequest('/team', { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) =>
    adminRequest(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id) =>
    adminRequest(`/team/${id}`, { method: 'DELETE' }),
};

// ── Client Projects ────────────────────────────
export const adminClientProjects = {
  list: (skip = 0, limit = 100) =>
    adminRequest(`/client-projects?skip=${skip}&limit=${limit}`),

  get: (id) => adminRequest(`/client-projects/${id}`),

  create: (data) =>
    adminRequest('/client-projects', { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) =>
    adminRequest(`/client-projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id) =>
    adminRequest(`/client-projects/${id}`, { method: 'DELETE' }),
};

// ── Leads ─────────────────────────────────────
export const adminLeads = {
  list: (skip = 0, limit = 100) =>
    adminRequest(`/admin/leads?skip=${skip}&limit=${limit}`),

  delete: (id) =>
    adminRequest(`/admin/leads/${id}`, { method: 'DELETE' }),
};
