import {
  aggregateDistrictStats,
  calcApprovalRate,
  escapeHtml,
  formatNumber,
  formatPercent,
  getDistrictColorCategory,
} from "./utils.js";

function renderSummaryCards(container, districts) {
  const stats = aggregateDistrictStats(districts);
  container.innerHTML = `
    <div class="stat-card"><span class="stat-label">Total districts</span><span class="stat-value">${stats.totalDistricts}</span></div>
    <div class="stat-card"><span class="stat-label">Claims filed</span><span class="stat-value">${stats.totalFiled}</span></div>
    <div class="stat-card"><span class="stat-label">Approved</span><span class="stat-value">${stats.totalApproved}</span></div>
    <div class="stat-card"><span class="stat-label">Pending</span><span class="stat-value">${stats.totalPending}</span></div>
    <div class="stat-card"><span class="stat-label">Rejected</span><span class="stat-value">${stats.totalRejected}</span></div>
    <div class="stat-card"><span class="stat-label">Land area (ha)</span><span class="stat-value">${formatNumber(stats.totalLandArea)}</span></div>
    <div class="stat-card"><span class="stat-label">Anomalies</span><span class="stat-value anomaly">${stats.totalAnomalies}</span></div>
    <div class="stat-card"><span class="stat-label">Avg approval rate</span><span class="stat-value">${formatPercent(stats.avgApprovalRate)}</span></div>
  `;
}

function renderStateSummary(container, summaryData) {
  if (!summaryData || !Array.isArray(summaryData.summary)) {
    container.innerHTML = "";
    return;
  }

  const knownFields = new Set([
    "state",
    "district_count",
    "total_claims_filed",
    "total_claims_approved",
    "total_claims_pending",
    "total_claims_rejected",
    "total_land_area_ha",
    "anomaly_count",
    "high_risk_claim_count",
    "avg_pending_days",
    "approval_rate_pct",
  ]);

  for (const row of summaryData.summary) {
    for (const key of Object.keys(row)) {
      if (!knownFields.has(key)) {
        console.warn(`[FRA] Unknown summary field: "${key}"`, row[key]);
      }
    }
  }

  container.innerHTML = summaryData.summary
    .map(
      (s) => `
      <div class="state-card">
        <h3>${escapeHtml(s.state)}</h3>
        <p>${s.district_count} districts · ${formatPercent(s.approval_rate_pct)} approval</p>
        <ul>
          <li>Filed: ${s.total_claims_filed}</li>
          <li>Approved: ${s.total_claims_approved}</li>
          <li>Pending: ${s.total_claims_pending}</li>
          <li>Rejected: ${s.total_claims_rejected}</li>
          <li>Land: ${formatNumber(s.total_land_area_ha)} ha</li>
          <li>Anomalies: ${s.anomaly_count}</li>
          <li>High-risk claims: ${s.high_risk_claim_count}</li>
          <li>Avg pending: ${formatNumber(s.avg_pending_days, 0)} days</li>
        </ul>
      </div>
    `
    )
    .join("");
}

function getStatusBadgeClass(category) {
  switch (category) {
    case "good":
      return "badge-good";
    case "moderate":
      return "badge-moderate";
    case "anomaly":
      return "badge-anomaly";
    default:
      return "badge-low";
  }
}

function getStatusLabel(category, district) {
  if (district.anomaly) return "Anomaly";
  switch (category) {
    case "good":
      return "Good";
    case "moderate":
      return "Moderate";
    default:
      return "Low";
  }
}

function filterDistricts(districts, { search = "", statusFilter = "all", anomalyOnly = false }) {
  const term = search.trim().toLowerCase();
  return districts.filter((d) => {
    if (anomalyOnly && !d.anomaly) return false;

    const category = getDistrictColorCategory(d);
    if (statusFilter === "good" && category !== "good") return false;
    if (statusFilter === "moderate" && category !== "moderate") return false;
    if (statusFilter === "anomaly" && !d.anomaly) return false;

    if (term && !d.district_name.toLowerCase().includes(term)) return false;
    return true;
  });
}

function renderDistrictTable(tbody, districts, onRowClick) {
  if (!districts.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-row">No districts match the current filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = districts
    .map((d) => {
      const rate = calcApprovalRate(d.claims_approved, d.claims_filed);
      const category = getDistrictColorCategory(d);
      const badgeClass = getStatusBadgeClass(category);
      const label = getStatusLabel(category, d);
      return `
        <tr data-district="${escapeHtml(d.district_name)}" tabindex="0">
          <td>${escapeHtml(d.district_name)}</td>
          <td>${d.claims_filed}</td>
          <td>${d.claims_approved}</td>
          <td>${d.claims_pending}</td>
          <td>${d.claims_rejected}</td>
          <td>${formatPercent(rate)}</td>
          <td>${d.anomaly ? "Yes" : "No"}</td>
          <td><span class="badge ${badgeClass}">${label}</span></td>
        </tr>
      `;
    })
    .join("");

  tbody.querySelectorAll("tr[data-district]").forEach((row) => {
    const name = row.getAttribute("data-district");
    const handler = () => onRowClick(name);
    row.addEventListener("click", handler);
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handler();
      }
    });
  });
}

export {
  renderSummaryCards,
  renderStateSummary,
  filterDistricts,
  renderDistrictTable,
};
