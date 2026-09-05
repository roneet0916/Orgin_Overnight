import { API_BASE_URL } from "./config.js";
import { fetchDistricts, fetchSummary, fetchLandPatches } from "./api.js";
import {
  initMap,
  renderDistricts,
  focusDistrict,
  setDistrictSelectCallback,
  getMap,
} from "./district-map.js";
import { renderLandPatches, toggleLandLayers } from "./land-patches.js";
import {
  renderSummaryCards,
  renderStateSummary,
  filterDistricts,
  renderDistrictTable,
} from "./dashboard.js";

const state = {
  districts: [],
  anomalyOnly: false,
  showLandPatches: true,
  search: "",
  statusFilter: "all",
};

function setLoading(isLoading, message = "") {
  const el = document.getElementById("loading-banner");
  if (!el) return;
  el.hidden = !isLoading;
  el.textContent = message || "Loading FRA monitoring data…";
}

function setError(message) {
  const el = document.getElementById("error-banner");
  if (!el) return;
  if (message) {
    el.hidden = false;
    el.textContent = message;
  } else {
    el.hidden = true;
    el.textContent = "";
  }
}

function refreshTableAndMap() {
  const filtered = filterDistricts(state.districts, {
    search: state.search,
    statusFilter: state.statusFilter,
    anomalyOnly: state.anomalyOnly,
  });

  const tbody = document.getElementById("district-table-body");
  renderDistrictTable(tbody, filtered, (name) => focusDistrict(name));

  renderDistricts(
    state.anomalyOnly ? state.districts.filter((d) => d.anomaly) : state.districts,
    { anomalyOnly: state.anomalyOnly }
  );
}

async function loadLandPatches() {
  const map = getMap();
  if (!map) return;
  try {
    const data = await fetchLandPatches();
    renderLandPatches(map, data.land_patches || []);
    toggleLandLayers(map, state.showLandPatches);
    console.info(`[FRA] Rendered ${(data.land_patches || []).length} demo land patches.`);
  } catch (err) {
    console.warn("[FRA] Could not load land patch demo data.", err);
  }
}

async function bootstrap() {
  setLoading(true);
  setError("");

  initMap("map");

  setDistrictSelectCallback((name) => {
    const row = document.querySelector(`tr[data-district="${CSS.escape(name)}"]`);
    row?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    row?.classList.add("row-highlight");
    setTimeout(() => row?.classList.remove("row-highlight"), 1500);
  });

  try {
    const [districtResponse, summaryResponse] = await Promise.all([
      fetchDistricts(),
      fetchSummary().catch((err) => {
        console.warn("[FRA] Summary endpoint unavailable.", err);
        return null;
      }),
    ]);

    state.districts = districtResponse.districts || [];
    if (!state.districts.length) {
      throw new Error("District API returned an empty list.");
    }

    renderSummaryCards(document.getElementById("summary-cards"), state.districts);
    renderStateSummary(document.getElementById("state-summary"), summaryResponse);
    refreshTableAndMap();
    await loadLandPatches();
  } catch (err) {
    console.error(err);
    setError(`Failed to load dashboard data from ${API_BASE_URL}. ${err.message}`);
  } finally {
    setLoading(false);
  }
}

function bindControls() {
  document.getElementById("search-input")?.addEventListener("input", (e) => {
    state.search = e.target.value;
    refreshTableAndMap();
  });

  document.getElementById("status-filter")?.addEventListener("change", (e) => {
    state.statusFilter = e.target.value;
    refreshTableAndMap();
  });

  document.getElementById("btn-anomalies")?.addEventListener("click", () => {
    state.anomalyOnly = !state.anomalyOnly;
    const btn = document.getElementById("btn-anomalies");
    btn.classList.toggle("active", state.anomalyOnly);
    btn.setAttribute("aria-pressed", String(state.anomalyOnly));
    refreshTableAndMap();
  });

  document.getElementById("toggle-land-patches")?.addEventListener("change", (e) => {
    state.showLandPatches = e.target.checked;
    toggleLandLayers(getMap(), state.showLandPatches);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindControls();
  bootstrap();
});

export { bootstrap, state };
