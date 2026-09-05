import {
  calcApprovalRate,
  escapeHtml,
  formatNumber,
  prefersReducedMotion,
} from "./utils.js";

let landLayerGroup = null;
let overlapLayerGroup = null;

function getPatchStyle(patch) {
  const risk = (patch.risk_level || "").toLowerCase();
  const overlap = patch.overlap_percent || 0;

  if (risk === "high" || overlap >= 15) {
    return { color: "#b00020", fillColor: "#e63946", fillOpacity: 0.45, weight: 2 };
  }
  if (risk === "medium" || overlap >= 8) {
    return { color: "#e76f51", fillColor: "#f4a261", fillOpacity: 0.4, weight: 2 };
  }
  return { color: "#2d6a4f", fillColor: "#40916c", fillOpacity: 0.4, weight: 2 };
}

function buildPatchPopup(patch) {
  return `
    <div class="land-popup">
      <span class="demo-badge">DEMO DATA</span>
      <h3>${escapeHtml(patch.claim_id)}</h3>
      <p>${escapeHtml(patch.village)}, ${escapeHtml(patch.district)}</p>
      <dl class="popup-stats">
        <dt>Status</dt><dd>${escapeHtml(patch.status)}</dd>
        <dt>Claim type</dt><dd>${escapeHtml(patch.claim_type)}</dd>
        <dt>Land type</dt><dd>${escapeHtml(patch.land_type)}</dd>
        <dt>Area (ha)</dt><dd>${formatNumber(patch.area_hectares)}</dd>
        <dt>Claimants</dt><dd>${patch.claimant_count}</dd>
        <dt>Risk level</dt><dd>${escapeHtml(patch.risk_level)}</dd>
        <dt>Evidence</dt><dd>${escapeHtml(patch.evidence_type)}</dd>
        <dt>Evidence score</dt><dd>${patch.evidence_score}</dd>
        <dt>Boundary confidence</dt><dd>${patch.boundary_confidence}</dd>
        <dt>Forest cover %</dt><dd>${patch.forest_cover_percent}</dd>
        <dt>Overlap %</dt><dd>${patch.overlap_percent}</dd>
        <dt>Submitted</dt><dd>${escapeHtml(patch.submission_date)}</dd>
      </dl>
    </div>
  `;
}

function renderLandPatches(map, patches) {
  if (landLayerGroup) {
    map.removeLayer(landLayerGroup);
  }
  if (overlapLayerGroup) {
    map.removeLayer(overlapLayerGroup);
  }

  landLayerGroup = L.layerGroup().addTo(map);
  overlapLayerGroup = L.layerGroup().addTo(map);

  const allBounds = [];

  for (const patch of patches) {
    if (!patch.coordinates || patch.coordinates.length < 3) continue;

    const style = getPatchStyle(patch);
    const polygon = L.polygon(patch.coordinates, style);
    polygon.bindPopup(buildPatchPopup(patch));
    polygon.addTo(landLayerGroup);
    allBounds.push(polygon.getBounds());

    if (patch.overlap_coordinates && patch.overlap_coordinates.length >= 3) {
      const overlapLine = L.polygon(patch.overlap_coordinates, {
        color: "#b00020",
        weight: 3,
        fillOpacity: 0,
        dashArray: prefersReducedMotion() ? "6,4" : "8,6",
        className: prefersReducedMotion() ? "" : "overlap-pulse",
      });
      overlapLine.bindPopup(
        `<strong>Overlap / extra boundary</strong><br/>Claim ${escapeHtml(patch.claim_id)} — ${patch.overlap_percent}% overlap (demo).`
      );
      overlapLine.addTo(overlapLayerGroup);
    } else if ((patch.overlap_percent || 0) >= 10) {
      const center = polygon.getBounds().getCenter();
      L.circleMarker(center, {
        radius: 6,
        color: "#b00020",
        fillColor: "#e63946",
        fillOpacity: 0.8,
        weight: 2,
      })
        .bindPopup(`High overlap indicator: ${patch.overlap_percent}%`)
        .addTo(overlapLayerGroup);
    }
  }

  return allBounds;
}

function toggleLandLayers(map, visible) {
  if (landLayerGroup) {
    if (visible) map.addLayer(landLayerGroup);
    else map.removeLayer(landLayerGroup);
  }
  if (overlapLayerGroup) {
    if (visible) map.addLayer(overlapLayerGroup);
    else map.removeLayer(overlapLayerGroup);
  }
}

export { renderLandPatches, toggleLandLayers };
