import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await api.get('/dashboard/stats');
  return res.data;
};

export const getStateStats = async () => {
  const res = await api.get('/dashboard/states');
  return res.data;
};

export const getDistrictStats = async (state = null) => {
  const params = state && state !== 'All' ? { state } : {};
  const res = await api.get('/dashboard/districts', { params });
  return res.data;
};

export const getClaims = async (params = {}) => {
  const res = await api.get('/claims', { params });
  return res.data;
};

export const getClaimDetails = async (claimId) => {
  const res = await api.get(`/claims/${claimId}`);
  return res.data;
};

export const getAnomalies = async (params = {}) => {
  const res = await api.get('/anomalies', { params });
  return res.data;
};

export const analyzeClaim = async (claimId) => {
  const res = await api.post(`/analyze/${claimId}`);
  return res.data;
};

export const getDistrictGeoJSON = async () => {
  const res = await api.get('/maps/districts');
  return res.data;
};

export const getLandPatches = async () => {
  const res = await api.get('/land-patches');
  return res.data;
};

export const getStates = async () => {
  const res = await api.get('/states');
  return res.data;
};

export const getDistrictsByState = async (stateName) => {
  const res = await api.get(`/districts/${stateName}`);
  return res.data;
};

export const getClaimsReportUrl = (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  return `${API_BASE}/reports/claims?${query}`;
};

export const getAnomaliesReportUrl = (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  return `${API_BASE}/reports/anomalies?${query}`;
};

export default api;
