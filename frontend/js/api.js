import { API_ENDPOINTS, LOCAL_LAND_PATCHES_PATH } from "./config.js";

async function fetchJson(url, label) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${label} request failed (${response.status})`);
  }
  return response.json();
}

async function fetchDistricts() {
  return fetchJson(API_ENDPOINTS.districts, "Districts");
}

async function fetchAnomalies() {
  return fetchJson(API_ENDPOINTS.anomalies, "Anomalies");
}

async function fetchSummary() {
  return fetchJson(API_ENDPOINTS.summary, "Summary");
}

async function fetchAiSummary(districtName) {
  return fetchJson(API_ENDPOINTS.aiSummary(districtName), "AI Summary");
}

async function fetchLandPatches() {
  try {
    return await fetchJson(API_ENDPOINTS.landPatches, "Land patches");
  } catch (err) {
    console.warn("[FRA] Land patches API unavailable, using local demo file.", err);
    const response = await fetch(LOCAL_LAND_PATCHES_PATH);
    if (!response.ok) throw new Error("Local land patch demo data unavailable");
    return response.json();
  }
}

export {
  fetchDistricts,
  fetchAnomalies,
  fetchSummary,
  fetchAiSummary,
  fetchLandPatches,
};
