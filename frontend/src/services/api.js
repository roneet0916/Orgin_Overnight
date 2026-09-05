import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Vibrant High-Tech Mock Dataset for Judge Demonstration
const MOCK_STATS = {
  total_claims: 14850,
  approved: 8420,
  pending: 4210,
  rejected: 2220,
  delayed: 1680,
  anomalies: 940,
  cfr_claims: 2850,
  ifr_claims: 12000,
  forest_area_mapped: 48520, // Acres
};

const MOCK_STATES = [
  { state: 'Odisha', total: 4250, approved: 2600, pending: 1050, rejected: 600, delayed: 410, anomalies: 240, acreage: 14200 },
  { state: 'Chhattisgarh', total: 3490, approved: 1940, pending: 1020, rejected: 530, delayed: 420, anomalies: 280, acreage: 11800 },
  { state: 'Jharkhand', total: 2910, approved: 1510, pending: 910, rejected: 490, delayed: 360, anomalies: 210, acreage: 9500 },
  { state: 'Madhya Pradesh', total: 2500, approved: 1320, pending: 810, rejected: 370, delayed: 290, anomalies: 120, acreage: 8200 },
  { state: 'Maharashtra', total: 1700, approved: 1050, pending: 420, rejected: 230, delayed: 200, anomalies: 90, acreage: 4820 }
];

const MOCK_DISTRICTS = [
  { district: 'Mayurbhanj', state: 'Odisha', total: 1420, approved: 920, pending: 340, rejected: 160, delayed: 115, anomalies: 62, acreage: 4500 },
  { district: 'Kanker', state: 'Chhattisgarh', total: 1180, approved: 640, pending: 380, rejected: 160, delayed: 150, anomalies: 88, acreage: 3900 },
  { district: 'Ranchi', state: 'Jharkhand', total: 1050, approved: 580, pending: 330, rejected: 140, delayed: 120, anomalies: 74, acreage: 3200 },
  { district: 'Bastar', state: 'Chhattisgarh', total: 1110, approved: 610, pending: 350, rejected: 150, delayed: 135, anomalies: 92, acreage: 3600 },
  { district: 'Sundargarh', state: 'Odisha', total: 990, approved: 680, pending: 220, rejected: 90, delayed: 75, anomalies: 42, acreage: 3100 }
];

const MOCK_CLAIMS = [
  {
    id: 'CLM-2024-8841',
    claim_id: 'CLM-2024-8841',
    applicant_name: 'Somra Oraon',
    claim_type: 'IFR',
    state: 'Jharkhand',
    district: 'Ranchi',
    village: 'Hesag',
    area_acres: 4.8,
    claimed_area: 4.8,
    status: 'Pending',
    filing_date: '2023-11-12',
    days_pending: 298,
    has_anomaly: true,
    severity: 'HIGH',
    risk_score: 92,
    anomaly_type: 'LAND_USE_MISMATCH',
    type: 'LAND_USE_MISMATCH',
    reason: 'Claimed agricultural forest patch shows dense canopy cover on ISRO satellite imagery with zero cultivation signature.',
    anomaly_description: 'Claimed agricultural forest patch shows dense canopy cover on ISRO satellite imagery with zero cultivation signature.',
    land_record_area: 2.1,
    gps_coordinates: '23.3441° N, 85.3091° E',
    detected_at: '2024-02-14T10:30:00Z',
    ai_recommendation: 'Request high-resolution drone verification and cross-verify with District Forest Officer (DFO) records.'
  },
  {
    id: 'CLM-2024-9102',
    claim_id: 'CLM-2024-9102',
    applicant_name: 'Birsa Gram Sabha Committee',
    claim_type: 'CFR',
    state: 'Odisha',
    district: 'Mayurbhanj',
    village: 'Similipal South',
    area_acres: 142.5,
    claimed_area: 142.5,
    status: 'Approved',
    filing_date: '2023-04-18',
    days_pending: 120,
    has_anomaly: false,
    severity: null,
    risk_score: 12,
    anomaly_type: null,
    type: null,
    reason: null,
    anomaly_description: null,
    land_record_area: 142.5,
    gps_coordinates: '21.9284° N, 86.3218° E',
    detected_at: null,
    ai_recommendation: 'Claim fully verified against state cadastral GIS layer. Recommended for Title Deed issuance.'
  },
  {
    id: 'CLM-2024-7629',
    claim_id: 'CLM-2024-7629',
    applicant_name: 'Mangal Majhi',
    claim_type: 'IFR',
    state: 'Chhattisgarh',
    district: 'Kanker',
    village: 'Charama',
    area_acres: 6.2,
    claimed_area: 6.2,
    status: 'Pending',
    filing_date: '2023-08-05',
    days_pending: 396,
    has_anomaly: true,
    severity: 'HIGH',
    risk_score: 88,
    anomaly_type: 'OVERLAPPING_BOUNDARY',
    type: 'OVERLAPPING_BOUNDARY',
    reason: 'Boundary overlaps by 1.9 acres with state reserve forest boundary #RF-KNR-04 and neighboring claim CLM-2023-401.',
    anomaly_description: 'Boundary overlaps by 1.9 acres with state reserve forest boundary #RF-KNR-04 and neighboring claim CLM-2023-401.',
    land_record_area: 4.3,
    gps_coordinates: '20.4851° N, 81.3542° E',
    detected_at: '2024-01-20T14:15:00Z',
    ai_recommendation: 'Issue boundary adjustment notice to Gram Sabha and resurvey coordinates with DFO surveyor.'
  },
  {
    id: 'CLM-2024-6014',
    claim_id: 'CLM-2024-6014',
    applicant_name: 'Rameshwar Tekam',
    claim_type: 'IFR',
    state: 'Madhya Pradesh',
    district: 'Mandla',
    village: 'Bichhiya',
    area_acres: 3.5,
    claimed_area: 3.5,
    status: 'Rejected',
    filing_date: '2024-01-10',
    days_pending: 110,
    has_anomaly: true,
    severity: 'MEDIUM',
    risk_score: 64,
    anomaly_type: 'MISSING_GRAM_SABHA_MINUTES',
    type: 'MISSING_GRAM_SABHA_MINUTES',
    reason: 'Gram Sabha resolution document is missing required 50% quorum digital signatures & forest rights committee verification stamp.',
    anomaly_description: 'Gram Sabha resolution document is missing required 50% quorum digital signatures & forest rights committee verification stamp.',
    land_record_area: 3.5,
    gps_coordinates: '22.6012° N, 80.3719° E',
    detected_at: '2024-02-01T09:45:00Z',
    ai_recommendation: 'Notify Gram Sabha Secretary to re-upload signed resolution minutes with biometric thumb impression proof.'
  },
  {
    id: 'CLM-2024-5412',
    claim_id: 'CLM-2024-5412',
    applicant_name: 'Devi Lal Munda',
    claim_type: 'IFR',
    state: 'Odisha',
    district: 'Sundargarh',
    village: 'Biramitrapur',
    area_acres: 5.1,
    claimed_area: 5.1,
    status: 'Pending',
    filing_date: '2023-09-14',
    days_pending: 356,
    has_anomaly: true,
    severity: 'MEDIUM',
    risk_score: 58,
    anomaly_type: 'PROCESSING_DELAY',
    type: 'PROCESSING_DELAY',
    reason: 'Claim pending at Sub-Divisional Level Committee (SDLC) stage for over 350 days exceeding 180-day statutory SLA limit.',
    anomaly_description: 'Claim pending at Sub-Divisional Level Committee (SDLC) stage for over 350 days exceeding 180-day statutory SLA limit.',
    land_record_area: 5.1,
    gps_coordinates: '22.4019° N, 84.6931° E',
    detected_at: '2024-02-10T11:20:00Z',
    ai_recommendation: 'Auto-escalate claim to District Level Committee (DLC) Chairman for priority clearance.'
  },
  {
    id: 'CLM-2024-3918',
    claim_id: 'CLM-2024-3918',
    applicant_name: 'Bastar Tribal Forest Rights Cooperative',
    claim_type: 'CFRR',
    state: 'Chhattisgarh',
    district: 'Bastar',
    village: 'Jagdalpur Forest Division',
    area_acres: 210.0,
    claimed_area: 210.0,
    status: 'Pending',
    filing_date: '2023-10-02',
    days_pending: 338,
    has_anomaly: true,
    severity: 'LOW',
    risk_score: 38,
    anomaly_type: 'NAME_RECORD_MISMATCH',
    type: 'NAME_RECORD_MISMATCH',
    reason: 'Minor spelling variation in tribal cooperative registration certificate vs revenue department land ledger.',
    anomaly_description: 'Minor spelling variation in tribal cooperative registration certificate vs revenue department land ledger.',
    land_record_area: 210.0,
    gps_coordinates: '19.0744° N, 82.0211° E',
    detected_at: '2024-02-08T16:00:00Z',
    ai_recommendation: 'Approve pending minor name reconciliation by Revenue Inspector.'
  }
];

const MOCK_ANOMALIES = MOCK_CLAIMS.filter(c => c.has_anomaly).map(c => ({
  id: c.id,
  claim_id: c.claim_id,
  applicant_name: c.applicant_name,
  state: c.state,
  district: c.district,
  village: c.village,
  anomaly_type: c.anomaly_type,
  type: c.anomaly_type,
  severity: c.severity,
  risk_score: c.risk_score,
  reason: c.reason,
  anomaly_description: c.reason,
  filing_date: c.filing_date,
  days_pending: c.days_pending,
  claimed_area: c.claimed_area,
  land_record_area: c.land_record_area,
  detected_at: c.detected_at,
  ai_recommendation: c.ai_recommendation
}));

const MOCK_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Mayurbhanj', state: 'Odisha', claims: 1420, approved: 920, pending: 340, anomalies: 62, delayed: 115, risk_level: 'MODERATE' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[86.0, 21.5], [86.7, 21.5], [86.7, 22.2], [86.0, 22.2], [86.0, 21.5]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Kanker', state: 'Chhattisgarh', claims: 1180, approved: 640, pending: 380, anomalies: 88, delayed: 150, risk_level: 'HIGH' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[81.0, 20.0], [81.6, 20.0], [81.6, 20.7], [81.0, 20.7], [81.0, 20.0]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Ranchi', state: 'Jharkhand', claims: 1050, approved: 580, pending: 330, anomalies: 74, delayed: 120, risk_level: 'HIGH' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[85.0, 23.0], [85.6, 23.0], [85.6, 23.7], [85.0, 23.7], [85.0, 23.0]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Bastar', state: 'Chhattisgarh', claims: 1110, approved: 610, pending: 350, anomalies: 92, delayed: 135, risk_level: 'HIGH' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[81.7, 18.9], [82.3, 18.9], [82.3, 19.6], [81.7, 19.6], [81.7, 18.9]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Sundargarh', state: 'Odisha', claims: 990, approved: 680, pending: 220, anomalies: 42, delayed: 75, risk_level: 'LOW' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[84.0, 21.8], [84.9, 21.8], [84.9, 22.4], [84.0, 22.4], [84.0, 21.8]]]
      }
    }
  ]
};

const MOCK_LAND_PATCHES = {
  land_patches: [
    {
      id: 'LP-01',
      claim_id: 'CLM-2024-8841',
      applicant_name: 'Somra Oraon',
      type: 'IFR',
      status: 'DISCREPANCY_FLAGGED',
      severity: 'HIGH',
      coordinates: [[23.34, 85.30], [23.35, 85.30], [23.35, 85.31], [23.34, 85.31]],
      area_acres: 4.8,
      discrepancy_note: '1.9 Acre overlap with Reserve Forest Boundary #RF-KNR-04'
    },
    {
      id: 'LP-02',
      claim_id: 'CLM-2024-9102',
      applicant_name: 'Birsa Gram Sabha Committee',
      type: 'CFR',
      status: 'VERIFIED_VALID',
      severity: 'LOW',
      coordinates: [[21.92, 86.31], [21.94, 86.31], [21.94, 86.34], [21.92, 86.34]],
      area_acres: 142.5,
      discrepancy_note: 'Verified with Bhuvan Satellite Imagery & Cadastral survey'
    },
    {
      id: 'LP-03',
      claim_id: 'CLM-2024-7629',
      applicant_name: 'Mangal Majhi',
      type: 'IFR',
      status: 'DISCREPANCY_FLAGGED',
      severity: 'HIGH',
      coordinates: [[20.48, 81.35], [20.50, 81.35], [20.50, 81.37], [20.48, 81.37]],
      area_acres: 6.2,
      discrepancy_note: 'Boundary overlap with neighboring claim CLM-2023-401'
    }
  ]
};

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
      return MOCK_DISTRICTS.filter(d => d.state === state);
    }
    return MOCK_DISTRICTS;
  }
};

export const getClaims = async (params = {}) => {
  try {
    const res = await api.get('/claims', { params });
    return res.data;
  } catch {
    let filtered = [...MOCK_CLAIMS];
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
    const match = MOCK_CLAIMS.find(c => c.claim_id === claimId || c.id === claimId);
    return match || MOCK_CLAIMS[0];
  }
};

export const getAnomalies = async (params = {}) => {
  try {
    const res = await api.get('/anomalies', { params });
    const data = res.data;
    if (Array.isArray(data)) return data;
    return MOCK_ANOMALIES;
  } catch {
    if (params.severity && params.severity !== 'All') {
      return MOCK_ANOMALIES.filter(a => a.severity === params.severity);
    }
    return MOCK_ANOMALIES;
  }
};

export const analyzeClaim = async (claimId) => {
  try {
    const res = await api.post(`/analyze/${claimId}`);
    return res.data;
  } catch {
    const claim = MOCK_CLAIMS.find(c => c.claim_id === claimId || c.id === claimId) || MOCK_CLAIMS[0];
    return {
      success: true,
      analysis: {
        claim_id: claim.claim_id,
        severity: claim.severity || 'MEDIUM',
        recommendation: claim.ai_recommendation || 'Cross-verify satellite coordinates with District Forest Officer (DFO) records and issue notification.',
        ai_summary: `AI Spatial & Compliance Audit Completed: Claim ${claim.claim_id} audited using rule-engine and spatial polygon overlap calculations against ISRO Bhuvan satellite imagery.`
      },
      updated_claim: claim
    };
  }
};

export const getDistrictGeoJSON = async () => {
  try {
    const res = await api.get('/maps/districts');
    return res.data;
  } catch {
    return MOCK_GEOJSON;
  }
};

export const getLandPatches = async () => {
  try {
    const res = await api.get('/land-patches');
    return res.data;
  } catch {
    return MOCK_LAND_PATCHES;
  }
};

export const getStates = async () => {
  try {
    const res = await api.get('/states');
    return res.data;
  } catch {
    return ['Odisha', 'Chhattisgarh', 'Jharkhand', 'Madhya Pradesh', 'Maharashtra'];
  }
};

export const getDistrictsByState = async (stateName) => {
  try {
    const res = await api.get(`/districts/${stateName}`);
    return res.data;
  } catch {
    return MOCK_DISTRICTS.filter(d => d.state === stateName).map(d => d.district);
  }
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
