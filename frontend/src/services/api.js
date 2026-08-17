import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  getMe: () => api.get('/auth/me'),
};

export const constellationAPI = {
  getSummary: () => api.get('/constellation/summary'),
  getSatellites: () => api.get('/constellation/satellites'),
  getSatellite: (id) => api.get(`/constellation/satellites/${id}`),
  getGroundStations: () => api.get('/constellation/ground-stations'),
  getLinks: () => api.get('/constellation/links'),
  getTopology: () => api.get('/constellation/topology'),
  executeAction: (id, action, parameters = {}) => api.post(`/constellation/satellites/${id}/action`, { action, parameters }),
  resetFleet: () => api.post('/constellation/reset-fleet'),
};

export const telemetryAPI = {
  getLive: (id) => api.get(`/telemetry/live/${id}`),
  getHistory: (id, limit = 50) => api.get(`/telemetry/history/${id}?limit=${limit}`),
};

export const trustAPI = {
  getScores: () => api.get('/trust/scores'),
  getFactors: (id) => api.get(`/trust/factors/${id}`),
  getAllFactors: () => api.get('/trust/all-factors'),
  getHistory: (id, limit = 50) => api.get(`/trust/history/${id}?limit=${limit}`),
};

export const attacksAPI = {
  getScenarios: () => api.get('/attacks/scenarios'),
  launch: (attack_type, target_satellite_ids, intensity = 1.0, parameters = {}) =>
    api.post('/attacks/launch', { attack_type, target_satellite_ids, intensity, parameters }),
  getActive: () => api.get('/attacks/active'),
  stop: (id) => api.post(`/attacks/${id}/stop`),
  stopAll: () => api.post('/attacks/stop-all'),
};

export const alertsAPI = {
  getActive: () => api.get('/alerts/active'),
  resolve: (id) => api.post(`/alerts/${id}/resolve`),
  getAuditLogs: () => api.get('/alerts/audit-logs'),
};

export const missionsAPI = {
  getTasks: () => api.get('/missions/tasks'),
  getContinuityReport: () => api.get('/missions/continuity-report'),
};

export const analyticsAPI = {
  getMetrics: () => api.get('/analytics/metrics'),
  exportReport: () => api.get('/analytics/export-report'),
};

export default api;
