import { normalizeDistrictName } from "./district-coords.js";

function calcApprovalRate(approved, filed) {
  if (!filed || filed <= 0) return 0;
  return (approved / filed) * 100;
}

function getDistrictColorCategory(district) {
  if (district.anomaly) return "anomaly";
  const rate = calcApprovalRate(district.claims_approved, district.claims_filed);
  if (rate > 60) return "good";
  if (rate >= 20) return "moderate";
  return "low";
}

function getDistrictFillColor(category) {
  switch (category) {
    case "good":
      return "#2d6a4f";
    case "moderate":
      return "#e9c46a";
    case "anomaly":
    case "low":
      return "#e63946";
    default:
      return "#adb5bd";
  }
}

function getDistrictBorderColor(category) {
  if (category === "anomaly") return "#b00020";
  return "#ffffff";
}

function formatNumber(value, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Number(value).toFixed(decimals);
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${Number(value).toFixed(1)}%`;
}

function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function extractGeoJsonDistrictName(properties) {
  if (!properties) return "";
  return (
    properties.district_name ||
    properties.district ||
    properties.DISTRICT ||
    properties.name ||
    properties.NAME_2 ||
    ""
  );
}

function matchDistrictRecord(districts, geoName) {
  const key = normalizeDistrictName(geoName);
  return districts.find(
    (d) => normalizeDistrictName(d.district_name) === key
  );
}

function aggregateDistrictStats(districts) {
  const totals = {
    totalDistricts: districts.length,
    totalFiled: 0,
    totalApproved: 0,
    totalPending: 0,
    totalRejected: 0,
    totalLandArea: 0,
    totalAnomalies: 0,
  };

  for (const d of districts) {
    totals.totalFiled += d.claims_filed || 0;
    totals.totalApproved += d.claims_approved || 0;
    totals.totalPending += d.claims_pending || 0;
    totals.totalRejected += d.claims_rejected || 0;
    totals.totalLandArea += d.land_area_ha || 0;
    if (d.anomaly) totals.totalAnomalies += 1;
  }

  totals.avgApprovalRate = calcApprovalRate(totals.totalApproved, totals.totalFiled);
  return totals;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export {
  calcApprovalRate,
  getDistrictColorCategory,
  getDistrictFillColor,
  getDistrictBorderColor,
  formatNumber,
  formatPercent,
  escapeHtml,
  extractGeoJsonDistrictName,
  matchDistrictRecord,
  aggregateDistrictStats,
  prefersReducedMotion,
};
