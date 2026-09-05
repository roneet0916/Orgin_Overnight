// Complete 25-District GeoJSON & Spatial Dataset for India Forest Rights Act (FRA) Decision Support
// States: Odisha, Chhattisgarh, Madhya Pradesh, Maharashtra, Jharkhand

export const ALL_DISTRICTS_DATA = [
  // MADHYA PRADESH
  { name: 'Dhar', state: 'Madhya Pradesh', lat: 22.5976, lng: 75.3023, total: 920, approved: 640, pending: 210, rejected: 70, delayed: 35, anomalies: 18, risk_level: 'LOW', color: '#10b981', acreage: 3400 },
  { name: 'Dindori', state: 'Madhya Pradesh', lat: 22.9515, lng: 81.0800, total: 1150, approved: 580, pending: 380, rejected: 190, delayed: 140, anomalies: 68, risk_level: 'HIGH', color: '#f43f5e', acreage: 4200 },
  { name: 'Mandla', state: 'Madhya Pradesh', lat: 22.5986, lng: 80.3708, total: 1080, approved: 620, pending: 320, rejected: 140, delayed: 90, anomalies: 45, risk_level: 'MODERATE', color: '#f59e0b', acreage: 3900 },
  { name: 'Balaghat', state: 'Madhya Pradesh', lat: 21.8142, lng: 80.1843, total: 980, approved: 710, pending: 190, rejected: 80, delayed: 40, anomalies: 22, risk_level: 'LOW', color: '#10b981', acreage: 3600 },
  { name: 'Chhindwara', state: 'Madhya Pradesh', lat: 22.0574, lng: 78.9382, total: 890, approved: 570, pending: 220, rejected: 100, delayed: 60, anomalies: 34, risk_level: 'MODERATE', color: '#f59e0b', acreage: 3100 },

  // ODISHA
  { name: 'Mayurbhanj', state: 'Odisha', lat: 21.9333, lng: 86.7333, total: 1420, approved: 920, pending: 340, rejected: 160, delayed: 115, anomalies: 62, risk_level: 'MODERATE', color: '#f59e0b', acreage: 4500 },
  { name: 'Sundargarh', state: 'Odisha', lat: 22.1167, lng: 84.0333, total: 1180, approved: 820, pending: 240, rejected: 120, delayed: 50, anomalies: 42, risk_level: 'LOW', color: '#10b981', acreage: 4100 },
  { name: 'Kandhamal', state: 'Odisha', lat: 20.2333, lng: 84.0167, total: 1050, approved: 510, pending: 360, rejected: 180, delayed: 130, anomalies: 65, risk_level: 'HIGH', color: '#f43f5e', acreage: 3800 },
  { name: 'Koraput', state: 'Odisha', lat: 18.8167, lng: 82.7167, total: 960, approved: 690, pending: 190, rejected: 80, delayed: 45, anomalies: 28, risk_level: 'LOW', color: '#10b981', acreage: 3500 },
  { name: 'Rayagada', state: 'Odisha', lat: 19.1667, lng: 83.4167, total: 880, approved: 540, pending: 230, rejected: 110, delayed: 70, anomalies: 48, risk_level: 'MODERATE', color: '#f59e0b', acreage: 3200 },

  // CHHATTISGARH
  { name: 'Bastar', state: 'Chhattisgarh', lat: 19.1000, lng: 81.9500, total: 1310, approved: 610, pending: 420, rejected: 280, delayed: 175, anomalies: 92, risk_level: 'HIGH', color: '#f43f5e', acreage: 4800 },
  { name: 'Kanker', state: 'Chhattisgarh', lat: 20.2700, lng: 81.4900, total: 1240, approved: 640, pending: 380, rejected: 220, delayed: 150, anomalies: 88, risk_level: 'HIGH', color: '#f43f5e', acreage: 4300 },
  { name: 'Surguja', state: 'Chhattisgarh', lat: 23.1200, lng: 83.2000, total: 1020, approved: 590, pending: 280, rejected: 150, delayed: 85, anomalies: 52, risk_level: 'MODERATE', color: '#f59e0b', acreage: 3700 },
  { name: 'Dhamtari', state: 'Chhattisgarh', lat: 20.7100, lng: 81.5500, total: 850, approved: 580, pending: 180, rejected: 90, delayed: 35, anomalies: 20, risk_level: 'LOW', color: '#10b981', acreage: 2900 },
  { name: 'Rajnandgaon', state: 'Chhattisgarh', lat: 21.1000, lng: 81.0300, total: 910, approved: 560, pending: 240, rejected: 110, delayed: 65, anomalies: 42, risk_level: 'MODERATE', color: '#f59e0b', acreage: 3200 },

  // MAHARASHTRA
  { name: 'Gadchiroli', state: 'Maharashtra', lat: 20.1833, lng: 80.0000, total: 1190, approved: 570, pending: 390, rejected: 230, delayed: 160, anomalies: 70, risk_level: 'HIGH', color: '#f43f5e', acreage: 4400 },
  { name: 'Chandrapur', state: 'Maharashtra', lat: 19.9500, lng: 79.3000, total: 940, approved: 580, pending: 250, rejected: 110, delayed: 75, anomalies: 40, risk_level: 'MODERATE', color: '#f59e0b', acreage: 3300 },
  { name: 'Nandurbar', state: 'Maharashtra', lat: 21.3700, lng: 74.2500, total: 860, approved: 610, pending: 170, rejected: 80, delayed: 30, anomalies: 24, risk_level: 'LOW', color: '#10b981', acreage: 3000 },
  { name: 'Palghar', state: 'Maharashtra', lat: 19.6967, lng: 72.7656, total: 820, approved: 520, pending: 210, rejected: 90, delayed: 55, anomalies: 36, risk_level: 'MODERATE', color: '#f59e0b', acreage: 2800 },
  { name: 'Yavatmal', state: 'Maharashtra', lat: 20.4000, lng: 78.1333, total: 780, approved: 540, pending: 160, rejected: 80, delayed: 35, anomalies: 26, risk_level: 'LOW', color: '#10b981', acreage: 2700 },

  // JHARKHAND
  { name: 'West Singhbhum', state: 'Jharkhand', lat: 22.5667, lng: 85.8000, total: 1280, approved: 610, pending: 410, rejected: 260, delayed: 165, anomalies: 82, risk_level: 'HIGH', color: '#f43f5e', acreage: 4600 },
  { name: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lng: 85.3091, total: 1120, approved: 580, pending: 340, rejected: 200, delayed: 130, anomalies: 74, risk_level: 'HIGH', color: '#f43f5e', acreage: 3900 },
  { name: 'Gumla', state: 'Jharkhand', lat: 23.0400, lng: 84.5400, total: 890, approved: 530, pending: 240, rejected: 120, delayed: 65, anomalies: 38, risk_level: 'MODERATE', color: '#f59e0b', acreage: 3100 },
  { name: 'Simdega', state: 'Jharkhand', lat: 22.6167, lng: 84.5167, total: 810, approved: 560, pending: 170, rejected: 80, delayed: 30, anomalies: 19, risk_level: 'LOW', color: '#10b981', acreage: 2800 },
  { name: 'Latehar', state: 'Jharkhand', lat: 23.7439, lng: 84.5028, total: 790, approved: 520, pending: 190, rejected: 80, delayed: 40, anomalies: 21, risk_level: 'LOW', color: '#10b981', acreage: 2700 }
];

// Helper to generate hexagonal district polygon around lat/lng
function createHexagonPolygon(lat, lng, radius = 0.35) {
  const numPoints = 6;
  const coords = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (2 * Math.PI / numPoints) * i;
    const jitter = 0.04 * Math.sin(i * 2.5);
    const r = radius + jitter;
    const ptLng = lng + r * Math.cos(angle) * 1.15;
    const ptLat = lat + r * Math.sin(angle);
    coords.push([Number(ptLng.toFixed(4)), Number(ptLat.toFixed(4))]);
  }
  coords.push(coords[0]); // Close ring
  return [coords];
}

// Generate complete GeoJSON FeatureCollection with 25 Districts
export function getFullDistrictsGeoJSON() {
  const features = ALL_DISTRICTS_DATA.map((dist) => {
    return {
      type: 'Feature',
      properties: {
        district: dist.name,
        name: dist.name,
        state: dist.state,
        latitude: dist.lat,
        longitude: dist.lng,
        claims: dist.total,
        approved: dist.approved,
        pending: dist.pending,
        rejected: dist.rejected,
        delayed: dist.delayed,
        anomalies: dist.anomalies,
        risk_level: dist.risk_level,
        color: dist.color,
        acreage: dist.acreage
      },
      geometry: {
        type: 'Polygon',
        coordinates: createHexagonPolygon(dist.lat, dist.lng, 0.35)
      }
    };
  });

  return {
    type: 'FeatureCollection',
    name: 'FRA_India_Districts',
    features: features
  };
}

// Interactive Individual Claim Land Boundary Patches with Explicit Status & Zone Colors
export const LAND_CLAIM_PATCHES = [
  // RED ZONE (ANOMALY / OVERLAP / REJECTED)
  {
    id: 'LP-RED-01',
    claim_id: 'CLM-2024-8841',
    applicant_name: 'Somra Oraon',
    state: 'Jharkhand',
    district: 'Ranchi',
    village: 'Hesag',
    claim_type: 'IFR',
    status: 'ANOMALY',
    zone_type: 'RED_RISK_ZONE',
    risk_level: 'HIGH',
    color: '#f43f5e',
    center: [23.3441, 85.3091],
    coordinates: [
      [23.341, 85.305],
      [23.348, 85.305],
      [23.348, 85.313],
      [23.341, 85.313]
    ],
    claimed_area: 4.8,
    record_area: 2.1,
    note: '⚠️ RED ZONE: 1.9 Acre overlap with Reserve Forest Boundary #RF-KNR-04 & dense satellite canopy cover.'
  },
  {
    id: 'LP-RED-02',
    claim_id: 'CLM-2024-7629',
    applicant_name: 'Mangal Majhi',
    state: 'Chhattisgarh',
    district: 'Kanker',
    village: 'Charama',
    claim_type: 'IFR',
    status: 'ANOMALY',
    zone_type: 'RED_RISK_ZONE',
    risk_level: 'HIGH',
    color: '#f43f5e',
    center: [20.2700, 81.4900],
    coordinates: [
      [20.265, 81.485],
      [20.275, 81.485],
      [20.275, 81.495],
      [20.265, 81.495]
    ],
    claimed_area: 6.2,
    record_area: 4.3,
    note: '⚠️ RED ZONE: Boundary overlap with neighboring claim CLM-2023-401.'
  },
  {
    id: 'LP-RED-03',
    claim_id: 'CLM-2024-9912',
    applicant_name: 'Bastar Tribal Cooperative',
    state: 'Chhattisgarh',
    district: 'Bastar',
    village: 'Jagdalpur Division',
    claim_type: 'CFRR',
    status: 'ANOMALY',
    zone_type: 'RED_RISK_ZONE',
    risk_level: 'HIGH',
    color: '#f43f5e',
    center: [19.1000, 81.9500],
    coordinates: [
      [19.095, 81.942],
      [19.108, 81.942],
      [19.108, 81.958],
      [19.095, 81.958]
    ],
    claimed_area: 185.0,
    record_area: 120.0,
    note: '⚠️ RED ZONE: 65 Acre land record discrepancy vs ISRO Bhuvan satellite layer.'
  },
  {
    id: 'LP-RED-04',
    claim_id: 'CLM-2024-3310',
    applicant_name: 'Laxman Maravi',
    state: 'Madhya Pradesh',
    district: 'Dindori',
    village: 'Karanjia',
    claim_type: 'IFR',
    status: 'ANOMALY',
    zone_type: 'RED_RISK_ZONE',
    risk_level: 'HIGH',
    color: '#f43f5e',
    center: [22.9515, 81.0800],
    coordinates: [
      [22.946, 81.074],
      [22.956, 81.074],
      [22.956, 81.086],
      [22.946, 81.086]
    ],
    claimed_area: 5.5,
    record_area: 3.1,
    note: '⚠️ RED ZONE: Encroachment warning flagged on Tiger Corridor Buffer Zone.'
  },

  // YELLOW ZONE (PENDING REVIEW / DELAYED >180 DAYS)
  {
    id: 'LP-YEL-01',
    claim_id: 'CLM-2024-5412',
    applicant_name: 'Devi Lal Munda',
    state: 'Odisha',
    district: 'Sundargarh',
    village: 'Biramitrapur',
    claim_type: 'IFR',
    status: 'PENDING',
    zone_type: 'YELLOW_WARNING_ZONE',
    risk_level: 'MODERATE',
    color: '#f59e0b',
    center: [22.1167, 84.0333],
    coordinates: [
      [22.112, 84.028],
      [22.121, 84.028],
      [22.121, 84.038],
      [22.112, 84.038]
    ],
    claimed_area: 5.1,
    record_area: 5.1,
    note: '⏳ YELLOW ZONE: Pending at Sub-Divisional Committee (SDLC) for 356 days.'
  },
  {
    id: 'LP-YEL-02',
    claim_id: 'CLM-2024-6014',
    applicant_name: 'Rameshwar Tekam',
    state: 'Madhya Pradesh',
    district: 'Mandla',
    village: 'Bichhiya',
    claim_type: 'IFR',
    status: 'PENDING',
    zone_type: 'YELLOW_WARNING_ZONE',
    risk_level: 'MODERATE',
    color: '#f59e0b',
    center: [22.5986, 80.3708],
    coordinates: [
      [22.594, 80.365],
      [22.603, 80.365],
      [22.603, 80.376],
      [22.594, 80.376]
    ],
    claimed_area: 3.5,
    record_area: 3.5,
    note: '⏳ YELLOW ZONE: Gram Sabha resolution minutes missing digital verification seal.'
  },
  {
    id: 'LP-YEL-03',
    claim_id: 'CLM-2024-4190',
    applicant_name: 'Savitri Pangi',
    state: 'Odisha',
    district: 'Mayurbhanj',
    village: 'Baripada West',
    claim_type: 'IFR',
    status: 'PENDING',
    zone_type: 'YELLOW_WARNING_ZONE',
    risk_level: 'MODERATE',
    color: '#f59e0b',
    center: [21.9333, 86.7333],
    coordinates: [
      [21.928, 86.728],
      [21.938, 86.728],
      [21.938, 86.738],
      [21.928, 86.738]
    ],
    claimed_area: 4.2,
    record_area: 4.2,
    note: '⏳ YELLOW ZONE: Pending field survey by Revenue Inspector.'
  },

  // GREEN ZONE (APPROVED & VERIFIED CLAIMS)
  {
    id: 'LP-GRN-01',
    claim_id: 'CLM-2024-9102',
    applicant_name: 'Birsa Gram Sabha Committee',
    state: 'Odisha',
    district: 'Mayurbhanj',
    village: 'Similipal South',
    claim_type: 'CFR',
    status: 'APPROVED',
    zone_type: 'GREEN_VERIFIED_ZONE',
    risk_level: 'LOW',
    color: '#10b981',
    center: [21.9333, 86.7333],
    coordinates: [
      [21.942, 86.742],
      [21.955, 86.742],
      [21.955, 86.758],
      [21.942, 86.758]
    ],
    claimed_area: 142.5,
    record_area: 142.5,
    note: '✅ GREEN ZONE: Verified against Cadastral layer & approved for Title Deed.'
  },
  {
    id: 'LP-GRN-02',
    claim_id: 'CLM-2024-1044',
    applicant_name: 'Ganesh Bhil',
    state: 'Madhya Pradesh',
    district: 'Dhar',
    village: 'Sardarpur',
    claim_type: 'IFR',
    status: 'APPROVED',
    zone_type: 'GREEN_VERIFIED_ZONE',
    risk_level: 'LOW',
    color: '#10b981',
    center: [22.5976, 75.3023],
    coordinates: [
      [22.592, 75.297],
      [22.602, 75.297],
      [22.602, 75.307],
      [22.592, 75.307]
    ],
    claimed_area: 4.5,
    record_area: 4.5,
    note: '✅ GREEN ZONE: Title Deed issued under FRA Section 3(1)(a).'
  },
  {
    id: 'LP-GRN-03',
    claim_id: 'CLM-2024-2088',
    applicant_name: 'Balaghat Forest Rights Committee',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    village: 'Baihar Division',
    claim_type: 'CFRR',
    status: 'APPROVED',
    zone_type: 'GREEN_VERIFIED_ZONE',
    risk_level: 'LOW',
    color: '#10b981',
    center: [21.8142, 80.1843],
    coordinates: [
      [21.808, 80.178],
      [21.820, 80.178],
      [21.820, 80.190],
      [21.808, 80.190]
    ],
    claimed_area: 98.0,
    record_area: 98.0,
    note: '✅ GREEN ZONE: Community Forest Rights title granted by DLC.'
  }
];
