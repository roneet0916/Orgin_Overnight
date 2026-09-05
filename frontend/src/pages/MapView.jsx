import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDistrictGeoJSON, getLandPatches } from '../services/api';
import { ALL_DISTRICTS_DATA } from '../data/geoData';
import Loading from '../components/Loading';
import { MapPin, Layers, Globe, ShieldAlert, CheckCircle2, AlertTriangle, Filter, Search, Info } from 'lucide-react';

// Custom Leaflet Icons for Claim Points (Red, Yellow, Green Pulsing Markers)
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      background-color: ${color};
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 0 12px ${color};
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const iconRed = createCustomIcon('#f43f5e');
const iconYellow = createCustomIcon('#f59e0b');
const iconGreen = createCustomIcon('#10b981');

const MapView = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [landPatches, setLandPatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeLayer, setActiveLayer] = useState('satellite'); // Default to realistic ESRI Satellite
  const [viewMode, setViewMode] = useState('all');

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const [gData, patchesRes] = await Promise.all([
        getDistrictGeoJSON(),
        getLandPatches()
      ]);
      setGeoJsonData(gData);
      setLandPatches(patchesRes.land_patches || []);
    } catch (err) {
      console.error('Error fetching map data:', err);
    } finally {
      setLoading(false);
    }
  };

  const styleFeature = (feature) => {
    const props = feature.properties || {};
    const riskLevel = props.risk_level || 'LOW';
    let color = props.color || '#10b981';

    if (riskLevel === 'HIGH' || props.anomalies >= 60) {
      color = '#f43f5e'; // Red
    } else if (riskLevel === 'MODERATE' || props.pending >= 250) {
      color = '#f59e0b'; // Yellow
    }

    // Filter out if state or zone doesn't match selection
    if (selectedState !== 'All' && props.state !== selectedState) {
      return { fillOpacity: 0, weight: 0, opacity: 0 };
    }
    if (selectedZone !== 'All') {
      if (selectedZone === 'RED' && color !== '#f43f5e') return { fillOpacity: 0, weight: 0, opacity: 0 };
      if (selectedZone === 'YELLOW' && color !== '#f59e0b') return { fillOpacity: 0, weight: 0, opacity: 0 };
      if (selectedZone === 'GREEN' && color !== '#10b981') return { fillOpacity: 0, weight: 0, opacity: 0 };
    }

    return {
      fillColor: color,
      weight: 2,
      opacity: 0.95,
      color: '#ffffff',
      dashArray: '3',
      fillOpacity: 0.5
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties || {};
    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.8, weight: 3, color: '#06b6d4' });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle(styleFeature(feature));
      },
      click: () => {
        setSelectedItem({ type: 'district', data: props });
      }
    });
  };

  const tileLayers = {
    satellite: {
      name: 'ESRI Satellite (HD)',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; ISRO/Bhuvan Open Spatial Data'
    },
    dark: {
      name: 'Carto Dark Vector',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CARTO &copy; OpenStreetMap'
    },
    osm: {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    }
  };

  if (loading) return <Loading message="Loading Realistic Satellite GIS Layers & 25 District Boundaries..." />;

  // Filtered Land Patches
  const filteredPatches = landPatches.filter(p => {
    if (selectedState !== 'All' && p.state !== selectedState) return false;
    if (selectedZone !== 'All') {
      if (selectedZone === 'RED' && p.color !== '#f43f5e') return false;
      if (selectedZone === 'YELLOW' && p.color !== '#f59e0b') return false;
      if (selectedZone === 'GREEN' && p.color !== '#10b981') return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16 animate-reveal">
      {/* Control Header */}
      <div className="forest-card p-6 border border-slate-700/80 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-white uppercase tracking-wide leading-none flex items-center gap-3">
              <MapPin className="w-8 h-8 text-[#06b6d4]" />
              GIS Spatial Intelligence & Land Audit Map
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-[0.2em] uppercase mt-2">
              State & District Boundaries • Red (Anomalies) • Yellow (Pending) • Green (Approved)
            </p>
          </div>

          {/* Basemap & View Layer Switchers */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#0f172a] border border-slate-700 p-1.5 rounded-full text-xs">
              <span className="text-slate-400 px-2 font-bold uppercase tracking-[0.15em] text-[10px]">
                <Globe className="w-3.5 h-3.5 text-[#10b981] inline mr-1" /> Map Mode:
              </span>
              {['satellite', 'dark', 'osm'].map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveLayer(key)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${
                    activeLayer === key
                      ? 'bg-[#10b981] text-[#070c18] border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* State Dropdown Filter */}
            <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded-full text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px] flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#06b6d4]" /> State:
              </span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#0f172a]">All States (25 Districts)</option>
                <option value="Madhya Pradesh" className="bg-[#0f172a]">Madhya Pradesh</option>
                <option value="Odisha" className="bg-[#0f172a]">Odisha</option>
                <option value="Chhattisgarh" className="bg-[#0f172a]">Chhattisgarh</option>
                <option value="Maharashtra" className="bg-[#0f172a]">Maharashtra</option>
                <option value="Jharkhand" className="bg-[#0f172a]">Jharkhand</option>
              </select>
            </div>

            {/* Status Zone Filter */}
            <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded-full text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">Zone Risk:</span>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#0f172a]">All Status Zones</option>
                <option value="RED" className="bg-[#0f172a] text-rose-400">🔴 Red Zone (High Risk / Anomaly)</option>
                <option value="YELLOW" className="bg-[#0f172a] text-amber-400">🟡 Yellow Zone (Pending / Delayed)</option>
                <option value="GREEN" className="bg-[#0f172a] text-emerald-400">🟢 Green Zone (Approved Clearance)</option>
              </select>
            </div>
          </div>

          {/* Color Legend Pills */}
          <div className="flex items-center gap-3 bg-[#0f172a] border border-slate-700 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" /> Red (Anomalies)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" /> Yellow (Pending)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> Green (Approved)
            </span>
          </div>
        </div>
      </div>

      {/* Map + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Viewport */}
        <div className="lg:col-span-3 forest-card p-3 shadow-2xl h-[680px] relative overflow-hidden group border border-slate-700/80">
          {/* Cyber HUD Badge */}
          <div className="absolute top-6 right-6 z-[400] bg-[#0f172a]/90 backdrop-blur-md border border-[#06b6d4]/40 px-4 py-2 rounded-full flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#06b6d4] shadow-[0_0_20px_rgba(6,182,212,0.3)] pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] animate-ping inline-block" />
            <span>REALTIME SATELLITE SPATIAL AUDIT</span>
          </div>

          <MapContainer
            center={[21.8, 81.5]}
            zoom={6}
            scrollWheelZoom={true}
            className="w-full h-full rounded-2xl"
            key={`${activeLayer}-${selectedState}-${selectedZone}`}
          >
            <TileLayer
              attribution={tileLayers[activeLayer].attribution}
              url={tileLayers[activeLayer].url}
            />

            {/* GeoJSON District Polygons */}
            {geoJsonData && (
              <GeoJSON
                key={`geojson-${geoJsonData.features?.length || 0}`}
                data={geoJsonData}
                style={styleFeature}
                onEachFeature={onEachFeature}
              />
            )}

            {/* Individual Land Patch Polygons & Markers */}
            {filteredPatches.map((patch) => {
              const positions = patch.coordinates;
              const centerPos = patch.center || (positions ? positions[0] : null);
              const color = patch.color || '#10b981';
              const icon = patch.color === '#f43f5e' ? iconRed : patch.color === '#f59e0b' ? iconYellow : iconGreen;

              return (
                <React.Fragment key={patch.id}>
                  {positions && (
                    <Polygon
                      positions={positions}
                      pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.6,
                        weight: 3,
                        dashArray: patch.status === 'ANOMALY' ? '6' : null
                      }}
                      eventHandlers={{
                        click: () => setSelectedItem({ type: 'patch', data: patch })
                      }}
                    />
                  )}

                  {centerPos && (
                    <Marker
                      position={centerPos}
                      icon={icon}
                      eventHandlers={{
                        click: () => setSelectedItem({ type: 'patch', data: patch })
                      }}
                    >
                      <Popup>
                        <div className="p-1 space-y-2 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-700 pb-1 gap-2">
                            <span className="font-mono font-bold text-[#06b6d4]">{patch.claim_id}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              patch.color === '#f43f5e' ? 'bg-rose-500/20 text-rose-400' : patch.color === '#f59e0b' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {patch.status}
                            </span>
                          </div>
                          <p className="font-bold text-white">{patch.applicant_name}</p>
                          <p className="text-[11px] text-slate-300 bg-[#0f172a] p-2 rounded border border-slate-800">{patch.note}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>

        {/* Sidebar District List & Inspection Card */}
        <div className="space-y-4">
          {/* Selected Item Modal/Card */}
          {selectedItem ? (
            <div className="forest-card p-5 border border-[#06b6d4]/50 animate-reveal space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-xs font-bold text-[#06b6d4] uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  {selectedItem.type === 'district' ? 'District Audit Record' : 'Claim Parcel Details'}
                </span>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {selectedItem.type === 'district' ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <h3 className="font-display text-2xl text-white uppercase font-bold">{selectedItem.data.district || selectedItem.data.name}</h3>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">{selectedItem.data.state}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Total Filed</span>
                      <span className="text-white text-base font-mono">{selectedItem.data.claims?.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                      <span className="text-emerald-400 block">Approved</span>
                      <span className="text-emerald-400 text-base font-mono">{selectedItem.data.approved?.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                      <span className="text-amber-400 block">Pending</span>
                      <span className="text-amber-400 text-base font-mono">{selectedItem.data.pending?.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                      <span className="text-rose-400 block">Anomalies</span>
                      <span className="text-rose-400 text-base font-mono">{selectedItem.data.anomalies?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800 text-[11px] flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Risk Zone Classification:</span>
                    <span className={`font-bold uppercase px-2.5 py-0.5 rounded text-[10px] ${
                      selectedItem.data.color === '#f43f5e' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : selectedItem.data.color === '#f59e0b' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {selectedItem.data.risk_level || 'LOW'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-cyan-300 text-sm block">{selectedItem.data.claim_id}</span>
                    <h4 className="font-bold text-white text-base mt-0.5">{selectedItem.data.applicant_name}</h4>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{selectedItem.data.village}, {selectedItem.data.district}</span>
                  </div>

                  <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800 text-[11px] space-y-1">
                    <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block">Audit Assessment Note:</span>
                    <p className="text-slate-200 leading-snug">{selectedItem.data.note}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="forest-card p-5 border border-slate-700/80 space-y-4">
              <h3 className="font-display text-lg text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-700 pb-2">
                <ShieldAlert className="w-5 h-5 text-[#06b6d4]" />
                District Status Legend
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#0f172a] rounded-xl border border-rose-500/30 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" />
                    <span className="font-bold text-white">RED ZONE (High Risk / Anomalies)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">High volume of land record mismatches, satellite canopy discrepancies, or reserve forest boundary overlaps.</p>
                </div>

                <div className="p-3 bg-[#0f172a] rounded-xl border border-amber-500/30 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]" />
                    <span className="font-bold text-white">YELLOW ZONE (Pending / Backlog)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Pending review under Sub-Divisional Committee (SDLC) exceeding statutory 180-day SLA limit.</p>
                </div>

                <div className="p-3 bg-[#0f172a] rounded-xl border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                    <span className="font-bold text-white">GREEN ZONE (Verified & Approved)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">High clearance rate (&gt;60%), clean satellite polygon match, verified for Title Deed issuance.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
