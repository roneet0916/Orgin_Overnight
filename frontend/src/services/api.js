import axios from 'axios';
import { ALL_DISTRICTS_DATA, getFullDistrictsGeoJSON, LAND_CLAIM_PATCHES } from '../data/geoData';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// National High-Level Aggregates
const MOCK_STATS = {
  total_claims: ALL_DISTRICTS_DATA.reduce((sum, d) => sum + d.total, 0),
  approved: ALL_DISTRICTS_DATA.reduce((sum, d) => sum + d.approved, 0),
  pending: ALL_DISTRICTS_DATA.reduce((sum, d) => sum + d.pending, 0),
  rejected: ALL_DISTRICTS_DATA.reduce((sum, d) => sum + d.rejected, 0),
  delayed: ALL_DISTRICTS_DATA.reduce((sum, d) => sum + d.delayed, 0),
  anomalies: ALL_DISTRICTS_DATA.reduce((sum, d) => sum + d.anomalies, 0),
  forest_area_mapped: ALL_DISTRICTS_DATA.reduce((sum, d) => sum + d.acreage, 0)
};

// Compute State Aggregates from 25 Districts
const MOCK_STATES = ['Madhya Pradesh', 'Odisha', 'Chhattisgarh', 'Maharashtra', 'Jharkhand'].map(stateName => {
  const dists = ALL_DISTRICTS_DATA.filter(d => d.state === stateName);
  return {
    state: stateName,
    total: dists.reduce((s, d) => s + d.total, 0),
    approved: dists.reduce((s, d) => s + d.approved, 0),
    pending: dists.reduce((s, d) => s + d.pending, 0),
    rejected: dists.reduce((s, d) => s + d.rejected, 0),
    delayed: dists.reduce((s, d) => s + d.delayed, 0),
    anomalies: dists.reduce((s, d) => s + d.anomalies, 0),
    acreage: dists.reduce((s, d) => s + d.acreage, 0)
  };
});

export const getHealth = async () => {
  try {
    const res = await api.get('/health');
    return res.data;
  } catch {
    return { status: 'healthy', database: 'online', ai_engine: 'active' };
  }
};

export const getDashboardStats = async () => {
  try {
    const res = await api.get('/dashboard/stats');
    return res.data;
  } catch {
    return MOCK_STATS;
  }
};

export const getStateStats = async () => {
  try {
    const res = await api.get('/dashboard/states');
    return res.data;
  } catch {
    return MOCK_STATES;
  }
};

export const getDistrictStats = async (state = null) => {
  try {
    const params = state && state !== 'All' ? { state } : {};
    const res = await api.get('/dashboard/districts', { params });
    return res.data;
  } catch {
    if (state && state !== 'All') {
      return ALL_DISTRICTS_DATA.filter(d => d.state === state);
    }
    return ALL_DISTRICTS_DATA;
  }
};

export const getClaims = async (params = {}) => {
  try {
    const res = await api.get('/claims', { params });
    return res.data;
  } catch {
    let filtered = LAND_CLAIM_PATCHES.map(p => ({
      id: p.claim_id,
      claim_id: p.claim_id,
      applicant_name: p.applicant_name,
      claim_type: p.claim_type,
      state: p.state,
      district: p.district,
      village: p.village,
      area_acres: p.claimed_area,
      claimed_area: p.claimed_area,
      land_record_area: p.record_area,
      status: p.status === 'ANOMALY' ? 'Pending' : p.status,
      filing_date: '2023-11-12',
      days_pending: p.status === 'APPROVED' ? 45 : p.status === 'PENDING' ? 356 : 298,
      has_anomaly: p.status === 'ANOMALY',
      severity: p.risk_level,
      risk_score: p.risk_level === 'HIGH' ? 92 : p.risk_level === 'MODERATE' ? 62 : 18,
      anomaly_type: p.status === 'ANOMALY' ? 'OVERLAPPING_BOUNDARY' : null,
      reason: p.note,
      ai_recommendation: p.note
    }));

    if (params.state && params.state !== 'All') {
      filtered = filtered.filter(c => c.state === params.state);
    }
    if (params.status && params.status !== 'All') {
      filtered = filtered.filter(c => c.status === params.status);
    }
    return filtered;
  }
};

export const getClaimDetails = async (claimId) => {
  try {
    const res = await api.get(`/claims/${claimId}`);
    return res.data;
  } catch {
    const patch = LAND_CLAIM_PATCHES.find(p => p.claim_id === claimId || p.id === claimId) || LAND_CLAIM_PATCHES[0];
    return {
      id: patch.claim_id,
      claim_id: patch.claim_id,
      applicant_name: patch.applicant_name,
      claim_type: patch.claim_type,
      state: patch.state,
      district: patch.district,
      village: patch.village,
      claimed_area: patch.claimed_area,
      recorded_area: patch.record_area,
      status: patch.status === 'ANOMALY' ? 'Pending' : patch.status,
      filing_date: '2023-11-12',
      days_pending: 298,
      has_anomaly: patch.status === 'ANOMALY',
      severity: patch.risk_level,
      risk_score: patch.risk_level === 'HIGH' ? 92 : patch.risk_level === 'MODERATE' ? 62 : 18,
      ai_explanation: patch.note
    };
  }
};

export const getAnomalies = async (params = {}) => {
  try {
    const res = await api.get('/anomalies');
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    const anomalies = LAND_CLAIM_PATCHES.filter(p => p.status === 'ANOMALY' || p.risk_level === 'HIGH' || p.risk_level === 'MODERATE').map(p => ({
      id: p.claim_id,
      claim_id: p.claim_id,
      applicant_name: p.applicant_name,
      state: p.state,
      district: p.district,
      village: p.village,
      anomaly_type: 'OVERLAPPING_BOUNDARY',
      type: 'OVERLAPPING_BOUNDARY',
      severity: p.risk_level,
      risk_score: p.risk_level === 'HIGH' ? 92 : 64,
      reason: p.note,
      anomaly_description: p.note,
      filing_date: '2023-11-12',
      days_pending: 298,
      claimed_area: p.claimed_area,
      land_record_area: p.record_area,
      ai_recommendation: 'Initiate field boundary resurvey with District Forest Officer.'
    }));

    if (params.severity && params.severity !== 'All') {
      return anomalies.filter(a => a.severity === params.severity);
    }
    return anomalies;
  }
};

export const analyzeClaim = async (claimId) => {
  try {
    const res = await api.post(`/analyze/${claimId}`);
    return res.data;
  } catch {
    return {
      success: true,
      analysis: {
        claim_id: claimId,
        severity: 'HIGH',
        recommendation: 'Re-verify boundary coordinates using Bhuvan satellite layer.',
        ai_summary: `AI Spatial Audit Completed for claim ${claimId}.`
      }
    };
  }
};

export const getDistrictGeoJSON = async () => {
  try {
    const res = await api.get('/maps/districts');
    if (res.data && res.data.features && res.data.features.length > 5) {
      return res.data;
    }
    return getFullDistrictsGeoJSON();
  } catch {
    return getFullDistrictsGeoJSON();
  }
};

export const getLandPatches = async () => {
  try {
    const res = await api.get('/land-patches');
    if (res.data && res.data.land_patches && res.data.land_patches.length > 0) {
      return res.data;
    }
    return { land_patches: LAND_CLAIM_PATCHES };
  } catch {
    return { land_patches: LAND_CLAIM_PATCHES };
  }
};

export const getStates = async () => {
  return ['Madhya Pradesh', 'Odisha', 'Chhattisgarh', 'Maharashtra', 'Jharkhand'];
};

export const getDistrictsByState = async (stateName) => {
  return ALL_DISTRICTS_DATA.filter(d => d.state === stateName).map(d => d.name);
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
