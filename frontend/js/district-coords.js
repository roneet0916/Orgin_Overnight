/**
 * District coordinate mapping for Madhya Pradesh demo districts.
 * Edit this object to add or update district marker locations.
 */
const DISTRICT_COORDS = {
  bhopal: { lat: 23.2599, lng: 77.4126, label: "Bhopal" },
  burhanpur: { lat: 21.319, lng: 76.23, label: "Burhanpur" },
  dewas: { lat: 22.9676, lng: 76.0534, label: "Dewas" },
  khandwa: { lat: 21.8247, lng: 76.3521, label: "Khandwa" },
  khargone: { lat: 21.8225, lng: 75.6102, label: "Khargone" },
  raisen: { lat: 23.3315, lng: 77.782, label: "Raisen" },
  sehore: { lat: 23.1993, lng: 77.085, label: "Sehore" },
  vidisha: { lat: 23.5251, lng: 77.8081, label: "Vidisha" },
};

const DISTRICT_ALIASES = {
  "east nimar": "khandwa",
  "west nimar": "khargone",
  nimar: "khandwa",
};

function normalizeDistrictName(name) {
  if (!name || typeof name !== "string") return "";
  const trimmed = name.trim().toLowerCase();
  return DISTRICT_ALIASES[trimmed] || trimmed;
}

function getDistrictCoords(districtName) {
  const key = normalizeDistrictName(districtName);
  const coords = DISTRICT_COORDS[key];
  if (!coords) {
    console.warn(`[FRA] No coordinates for district: "${districtName}" (normalized: "${key}")`);
    return null;
  }
  return coords;
}

export { DISTRICT_COORDS, DISTRICT_ALIASES, normalizeDistrictName, getDistrictCoords };
