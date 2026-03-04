// authService.js — Connects to Spring Boot backend via REST API

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const SESSION_KEY = 'hireflow_session';

// ===== API HELPERS =====
export const getAuthHeader = () => {
  const session = getSession();
  return session ? { Authorization: `Bearer ${session.token}` } : {};
};

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader(), ...(options.headers || {}) },
    ...options,
  };
  const response = await fetch(url, config);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }
  return data;
};

// ===== AUTH FUNCTIONS =====
export const register = async (userData) => {
  const data = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role.toUpperCase(),
    }),
  });
  saveSession(data);
  return data;
};

export const login = async (email, password) => {
  const data = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  saveSession(data);
  return data;
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

const saveSession = (authData) => {
  const session = {
    userId: authData.id,
    name: authData.name,
    email: authData.email,
    role: authData.role.toLowerCase(),
    token: authData.token,
    refreshToken: authData.refreshToken,
    expiresAt: Date.now() + (authData.expiresIn || 86400000),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const getSession = () => {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session) return null;
    if (Date.now() > session.expiresAt) { logout(); return null; }
    return session;
  } catch { return null; }
};

export const isAuthenticated = () => !!getSession();

export const getCurrentUser = async () => {
  try { return await apiCall('/users/profile'); }
  catch { return null; }
};

export const updateUserProfile = async (updates) => {
  return await apiCall('/users/profile', { method: 'PUT', body: JSON.stringify(updates) });
};

export const initAuth = () => {};

export { API_BASE };
