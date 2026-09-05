import { GEOJSON_PATH } from "./config.js";
import { getDistrictCoords, normalizeDistrictName } from "./district-coords.js";
import {
  calcApprovalRate,
  escapeHtml,
  extractGeoJsonDistrictName,
  formatNumber,
  formatPercent,
  getDistrictBorderColor,
  getDistrictColorCategory,
  getDistrictFillColor,
  matchDistrictRecord,
  prefersReducedMotion,
} from "./utils.js";
import { fetchAiSummary } from "./api.js";

let map = null;
let districtLayerGroup = null;
let markerByDistrict = {};
let geoJsonLayer = null;
let districtsData = [];
let onDistrictSelect = null;

function initMap(containerId) {
  map = L.map(containerId, {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView([22, 82], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  L.control.scale({ imperial: false }).addTo(map);
  addLegend();

  districtLayerGroup = L.layerGroup().addTo(map);
  return map;
}

function addLegend() {
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "map-legend");
    div.innerHTML = `
      <h4>District Status</h4>
      <div class="legend-item"><span class="legend-swatch good"></span> Good approval progress (&gt;60%)</div>
      <div class="legend-item"><span class="legend-swatch moderate"></span> Moderate approval progress (20–60%)</div>
      <div class="legend-item"><span class="legend-swatch low"></span> Anomaly or low approval (&lt;20%)</div>
      <div class="legend-item"><span class="legend-swatch neutral"></span> No API data match</div>
    `;
    return div;
  };
  legend.addTo(map);
}

function buildDistrictPopupContent(district) {
  const rate = calcApprovalRate(district.claims_approved, district.claims_filed);
  const category = getDistrictColorCategory(district);
  const safeName = escapeHtml(district.district_name);

  return `
    <div class="district-popup" data-district="${safeName}">
      <h3>${safeName}</h3>
      <p class="popup-subtitle">${escapeHtml(district.state)}</p>
      <dl class="popup-stats">
        <dt>Claims filed</dt><dd>${district.claims_filed}</dd>
        <dt>Approved</dt><dd>${district.claims_approved}</dd>
        <dt>Pending</dt><dd>${district.claims_pending}</dd>
        <dt>Rejected</dt><dd>${district.claims_rejected}</dd>
        <dt>Approval rate</dt><dd>${formatPercent(rate)}</dd>
        <dt>Avg pending days</dt><dd>${formatNumber(district.pending_days_avg, 0)}</dd>
        <dt>Land area (ha)</dt><dd>${formatNumber(district.land_area_ha)}</dd>
        <dt>High-risk claims</dt><dd>${district.high_risk_claims}</dd>
        <dt>Evidence score</dt><dd>${formatNumber(district.avg_evidence_score)}</dd>
        <dt>Boundary confidence</dt><dd>${formatNumber(district.avg_boundary_confidence)}</dd>
        <dt>Overlap %</dt><dd>${formatNumber(district.avg_overlap_percent)}</dd>
        <dt>Anomaly</dt><dd>${district.anomaly ? "Yes" : "No"}</dd>
        <dt>Anomaly reason</dt><dd>${district.anomaly_reason ? escapeHtml(district.anomaly_reason) : "—"}</dd>
      </dl>
      <button type="button" class="btn-ai-summary" data-district="${safeName}">Get AI Summary</button>
      <div class="ai-summary-box" id="ai-summary-${safeName.replace(/\s+/g, "-")}"></div>
    </div>
  `;
}

function bindPopupAiButton(popup, district) {
  popup.on("add", () => {
    const el = popup.getElement();
    if (!el) return;
    const btn = el.querySelector(".btn-ai-summary");
    const box = el.querySelector(".ai-summary-box");
    if (!btn || !box) return;

    btn.addEventListener("click", async () => {
      btn.disabled = true;
      box.textContent = "Loading AI summary…";
      box.className = "ai-summary-box loading";
      try {
        const result = await fetchAiSummary(district.district_name);
        box.className = "ai-summary-box success";
        box.textContent = result.ai_summary || "No summary returned.";
      } catch (err) {
        box.className = "ai-summary-box error";
        box.textContent = `Failed to load AI summary: ${err.message}`;
      } finally {
        btn.disabled = false;
      }
    });
  });
}

function styleGeoJsonFeature(feature, districts) {
  const geoName = extractGeoJsonDistrictName(feature.properties);
  const record = matchDistrictRecord(districts, geoName);
  const category = record ? getDistrictColorCategory(record) : "neutral";

  return {
    fillColor: getDistrictFillColor(category),
    color: record && record.anomaly ? "#b00020" : getDistrictBorderColor(category),
    weight: record && record.anomaly ? 3 : 2,
    fillOpacity: 0.55,
    opacity: 0.9,
    className: record && record.anomaly && !prefersReducedMotion() ? "anomaly-pulse" : "",
  };
}

function renderCircleMarkers(districts, anomalyOnly = false) {
  districtLayerGroup.clearLayers();
  markerByDistrict = {};

  const visible = anomalyOnly ? districts.filter((d) => d.anomaly) : districts;
  const bounds = [];

  for (const district of visible) {
    const coords = getDistrictCoords(district.district_name);
    if (!coords) continue;

    const category = getDistrictColorCategory(district);
    const color = getDistrictFillColor(category);
    const isAnomaly = district.anomaly;
    const pulseClass =
      isAnomaly && !prefersReducedMotion() ? "anomaly-marker-pulse" : "";

    const marker = L.circleMarker([coords.lat, coords.lng], {
      radius: isAnomaly ? 14 : 10,
      fillColor: color,
      color: isAnomaly ? "#b00020" : "#fff",
      weight: isAnomaly ? 3 : 2,
      fillOpacity: 0.85,
      className: pulseClass,
    });

    const popup = L.popup({ maxWidth: 340, minWidth: 260 }).setContent(
      buildDistrictPopupContent(district)
    );
    bindPopupAiButton(popup, district);
    marker.bindPopup(popup);

    marker.on("click", () => {
      if (onDistrictSelect) onDistrictSelect(district.district_name);
    });

    marker.addTo(districtLayerGroup);
    markerByDistrict[normalizeDistrictName(district.district_name)] = marker;
    bounds.push([coords.lat, coords.lng]);
  }

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
  }
}

async function tryLoadGeoJson(districts, anomalyOnly = false) {
  try {
    const response = await fetch(GEOJSON_PATH);
    if (!response.ok) throw new Error("GeoJSON not found");
    const geojson = await response.json();

    if (geoJsonLayer) {
      map.removeLayer(geoJsonLayer);
      geoJsonLayer = null;
    }

    const visibleNames = new Set(
      (anomalyOnly ? districts.filter((d) => d.anomaly) : districts).map((d) =>
        d.district_name.trim().toLowerCase()
      )
    );

    geoJsonLayer = L.geoJSON(geojson, {
      filter: (feature) => {
        if (!anomalyOnly) return true;
        const name = extractGeoJsonDistrictName(feature.properties);
        const record = matchDistrictRecord(districts, name);
        return record && record.anomaly;
      },
      style: (feature) => styleGeoJsonFeature(feature, districts),
      onEachFeature: (feature, layer) => {
        const geoName = extractGeoJsonDistrictName(feature.properties);
        const record = matchDistrictRecord(districts, geoName);

        if (record) {
          const popup = L.popup({ maxWidth: 340, minWidth: 260 }).setContent(
            buildDistrictPopupContent(record)
          );
          bindPopupAiButton(popup, record);
          layer.bindPopup(popup);
          layer.on("click", () => {
            if (onDistrictSelect) onDistrictSelect(record.district_name);
          });
          markerByDistrict[normalizeDistrictName(record.district_name)] = layer;
        } else {
          layer.bindPopup(
            `<strong>${escapeHtml(geoName)}</strong><br/>No matching API data (neutral style).`
          );
        }
      },
    }).addTo(map);

    const layerBounds = geoJsonLayer.getBounds();
    if (layerBounds.isValid()) {
      map.fitBounds(layerBounds, { padding: [30, 30], maxZoom: 8 });
    }

    console.info("[FRA] GeoJSON district boundaries loaded.");
    return true;
  } catch (err) {
    console.warn("[FRA] GeoJSON unavailable, using circle marker fallback.", err);
    renderCircleMarkers(districts, anomalyOnly);
    return false;
  }
}

async function renderDistricts(districts, options = {}) {
  districtsData = districts;
  const anomalyOnly = options.anomalyOnly || false;

  if (geoJsonLayer) {
    map.removeLayer(geoJsonLayer);
    geoJsonLayer = null;
  }
  districtLayerGroup.clearLayers();
  markerByDistrict = {};

  const geoLoaded = await tryLoadGeoJson(districts, anomalyOnly);
  if (!geoLoaded) {
    renderCircleMarkers(districts, anomalyOnly);
  }
}

function focusDistrict(districtName) {
  const key = normalizeDistrictName(districtName);
  const layer =
    markerByDistrict[key] ||
    markerByDistrict[districtName.trim().toLowerCase()];
  if (layer) {
    if (layer.getBounds) {
      map.fitBounds(layer.getBounds(), { padding: [60, 60], maxZoom: 10 });
    } else if (layer.getLatLng) {
      map.setView(layer.getLatLng(), 9);
    }
    layer.openPopup?.();
    return;
  }

  const coords = getDistrictCoords(districtName);
  if (coords) {
    map.setView([coords.lat, coords.lng], 9);
  }
}

function setDistrictSelectCallback(callback) {
  onDistrictSelect = callback;
}

function getMap() {
  return map;
}

export {
  initMap,
  renderDistricts,
  focusDistrict,
  setDistrictSelectCallback,
  getMap,
};
