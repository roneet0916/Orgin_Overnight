/**
 * FRA WebGIS API configuration.
 * Switch USE_LOCAL_BACKEND to true for local FastAPI at http://127.0.0.1:8000
 */
const USE_LOCAL_BACKEND = true;

const API_BASE_URL = USE_LOCAL_BACKEND
  ? "http://127.0.0.1:8000"
  : "https://vanadhikar-ai.onrender.com";

const API_ENDPOINTS = {
  districts: `${API_BASE_URL}/api/districts`,
  anomalies: `${API_BASE_URL}/api/anomalies`,
  summary: `${API_BASE_URL}/api/summary`,
  aiSummary: (district) =>
    `${API_BASE_URL}/api/ai-summary/${encodeURIComponent(district)}`,
  landPatches: `${API_BASE_URL}/api/land-patches`,
  health: `${API_BASE_URL}/health`,
};

/** Local GeoJSON path (relative to frontend root when served statically) */
const GEOJSON_PATH = "data/mp_districts.geojson";

/** Demo land patches fallback if API unavailable */
const LOCAL_LAND_PATCHES_PATH = "data/land_patches.json";

export { API_BASE_URL, API_ENDPOINTS, GEOJSON_PATH, LOCAL_LAND_PATCHES_PATH, USE_LOCAL_BACKEND };
