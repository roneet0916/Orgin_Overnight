import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDistrictGeoJSON, getLandPatches } from '../services/api';
import { ALL_DISTRICTS_DATA } from '../data/geoData';
import Loading from '../components/Loading';
import { MapPin, Layers, Globe, ShieldAlert, CheckCircle2, AlertTriangle, Filter, Info, Eye } from 'lucide-react';

// Custom Map Markers
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      background-color: ${color};
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 0 14px ${color};
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
  const [activeLayer, setActiveLayer] = useState('voyager'); // Default to CartoDB Voyager with crisp labels!

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

  const tileLayers = {
    voyager: {
      name: 'Carto Voyager (Labels)',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CARTO &copy; OpenStreetMap'
    },
    satellite: {
      name: 'ESRI Satellite HD',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; ISRO/Bhuvan Open Data'
    },
    dark: {
      name: 'Dark Tactical',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CARTO &copy; OpenStreetMap'
    }
  };

  if (loading) return <Loading message="Loading GIS Map with State & District Labels..." />;

  // Filter Features
  const features = (geoJsonData?.features || []).filter(feat => {
    const props = feat.properties || {};
    if (selectedState !== 'All' && props.state !== selectedState) return false;
    if (selectedZone !== 'All') {
      if (selectedZone === 'RED' && props.color !== '#f43f5e') return false;
      if (selectedZone === 'YELLOW' && props.color !== '#f59e0b') return false;
      if (selectedZone === 'GREEN' && props.color !== '#10b981') return false;
    }
    return true;
  });

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
              GIS Spatial Map — State & District Intelligence
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-[0.2em] uppercase mt-2">
              Forest Rights Act Auditing • Red (Anomalies) • Yellow (Pending) • Green (Approved)
            </p>
          </div>

          {/* Map Layer Switchers */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#0f172a] border border-slate-700 p-1.5 rounded-full text-xs">
              <span className="text-slate-400 px-2 font-bold uppercase tracking-[0.15em] text-[10px]">
                <Globe className="w-3.5 h-3.5 text-[#10b981] inline mr-1" /> Map Layer:
              </span>
              {['voyager', 'satellite', 'dark'].map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveLayer(key)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${
                    activeLayer === key
                      ? 'bg-[#06b6d4] text-[#070c18] border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tileLayers[key].name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* State Filter */}
            <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded-full text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px] flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#06b6d4]" /> Filter State:
              </span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#0f172a]">All 5 States (25 Districts)</option>
                <option value="Madhya Pradesh" className="bg-[#0f172a]">Madhya Pradesh</option>
                <option value="Odisha" className="bg-[#0f172a]">Odisha</option>
                <option value="Chhattisgarh" className="bg-[#0f172a]">Chhattisgarh</option>
                <option value="Maharashtra" className="bg-[#0f172a]">Maharashtra</option>
                <option value="Jharkhand" className="bg-[#0f172a]">Jharkhand</option>
              </select>
            </div>

            {/* Status Zone Filter */}
            <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded-full text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">Risk Zone:</span>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#0f172a]">All Status Zones</option>
                <option value="RED" className="bg-[#0f172a] text-rose-400">🔴 Red Zone (High Risk / Anomalies)</option>
                <option value="YELLOW" className="bg-[#0f172a] text-amber-400">🟡 Yellow Zone (Pending SLA Delay)</option>
                <option value="GREEN" className="bg-[#0f172a] text-emerald-400">🟢 Green Zone (Approved Clearance)</option>
              </select>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-3 bg-[#0f172a] border border-slate-700 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" /> Red (Anomalies)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" /> Yellow (Pending)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> Green (Approved)
            </span>
          </div>
        </div>
      </div>

      {/* Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Viewport */}
        <div className="lg:col-span-3 forest-card p-3 shadow-2xl h-[700px] relative overflow-hidden group border border-slate-700/80">
          {/* Cyber Radar HUD Badge */}
          <div className="absolute top-6 right-6 z-[400] bg-[#0f172a]/90 backdrop-blur-md border border-[#06b6d4]/40 px-4 py-2 rounded-full flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#06b6d4] shadow-[0_0_20px_rgba(6,182,212,0.3)] pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] animate-ping inline-block" />
            <span>REALTIME FRA DISTRICT SPATIAL LAYER</span>
          </div>

          {/* Floating On-Map Zone Legend Overlay */}
          <div className="absolute bottom-6 left-6 z-[400] bg-[#0f172a]/95 backdrop-blur-md border border-slate-700/90 p-3 rounded-2xl space-y-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] pointer-events-auto max-w-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-300 block border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#06b6d4]" /> Status Zone Color Key
            </span>
            <div className="space-y-1 text-[10px] font-bold">
              <div className="flex items-center justify-between gap-3 text-rose-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" /> Red Zone
                </span>
                <span className="text-[9px] text-slate-400">High Risk / Anomalies</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-amber-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" /> Yellow Zone
                </span>
                <span className="text-[9px] text-slate-400">Pending Backlog</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> Green Zone
                </span>
                <span className="text-[9px] text-slate-400">Approved Clearance</span>
              </div>
            </div>
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

            {/* Render 25 District Hexagonal Polygons with Permanent Labels */}
            {features.map((feature, idx) => {
              const props = feature.properties || {};
              const coords = feature.geometry?.coordinates[0];
              if (!coords) return null;

              // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
              const leafletCoords = coords.map(c => [c[1], c[0]]);
              const color = props.color || (props.risk_level === 'HIGH' ? '#f43f5e' : props.risk_level === 'MODERATE' ? '#f59e0b' : '#10b981');
              const zoneSymbol = color === '#f43f5e' ? '🔴' : color === '#f59e0b' ? '🟡' : '🟢';
              const stateAbbr = props.state === 'Madhya Pradesh' ? 'MP' : props.state === 'Chhattisgarh' ? 'CG' : props.state === 'Maharashtra' ? 'MH' : props.state === 'Jharkhand' ? 'JH' : 'OD';
              const tooltipClass = `district-tooltip-label ${
                color === '#f43f5e' ? 'district-tooltip-red' : color === '#f59e0b' ? 'district-tooltip-yellow' : 'district-tooltip-green'
              }`;

              return (
                <Polygon
                  key={`dist-${props.district || idx}`}
                  positions={leafletCoords}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.65,
                    weight: 3,
                    dashArray: color === '#f43f5e' ? '6' : null
                  }}
                  eventHandlers={{
                    click: () => setSelectedItem({ type: 'district', data: props })
                  }}
                >
                  {/* Permanent Text Label showing District Name, Zone Symbol & State directly on the Map! */}
                  <Tooltip
                    permanent={true}
                    direction="center"
                    className={tooltipClass}
                  >
                    {zoneSymbol} {props.district || props.name} ({stateAbbr})
                  </Tooltip>

                  <Popup>
                    <div className="p-1 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                        <span className="font-bold text-white text-sm">{props.district || props.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          color === '#f43f5e' ? 'bg-rose-500/20 text-rose-400' : color === '#f59e0b' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {props.risk_level} RISK
                        </span>
                      </div>
                      <p className="text-slate-300">State: <span className="font-bold text-white">{props.state}</span></p>
                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-mono font-bold">
                        <div className="bg-[#0f172a] p-1.5 rounded border border-slate-800">
                          <span className="text-slate-400 block text-[8px]">Claims</span>
                          <span>{props.claims}</span>
                        </div>
                        <div className="bg-[#0f172a] p-1.5 rounded border border-slate-800">
                          <span className="text-emerald-400 block text-[8px]">Approved</span>
                          <span>{props.approved}</span>
                        </div>
                        <div className="bg-[#0f172a] p-1.5 rounded border border-slate-800">
                          <span className="text-amber-400 block text-[8px]">Pending</span>
                          <span>{props.pending}</span>
                        </div>
                        <div className="bg-[#0f172a] p-1.5 rounded border border-slate-800">
                          <span className="text-rose-400 block text-[8px]">Anomalies</span>
                          <span>{props.anomalies}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

            {/* Render Individual Land Claim Markers */}
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
                        fillOpacity: 0.7,
                        weight: 3,
                        dashArray: patch.status === 'ANOMALY' ? '4' : null
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

        {/* Sidebar Info Panel */}
        <div className="space-y-4">
          {selectedItem ? (
            <div className="forest-card p-5 border border-[#06b6d4]/50 animate-reveal space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-xs font-bold text-[#06b6d4] uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  {selectedItem.type === 'district' ? 'District Audit Details' : 'Parcel Inspection'}
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
                      <span className="text-slate-400 block">Total Claims</span>
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
                    <span className="font-bold text-rose-400">RED ZONE (Anomalies / High Risk)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Bastar, Kanker, Dindori, Gadchiroli, Ranchi, West Singhbhum, Kandhamal.</p>
                </div>

                <div className="p-3 bg-[#0f172a] rounded-xl border border-amber-500/30 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]" />
                    <span className="font-bold text-amber-400">YELLOW ZONE (Pending SLA Backlog)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Mayurbhanj, Mandla, Rayagada, Surguja, Rajnandgaon, Gumla, Palghar, etc.</p>
                </div>

                <div className="p-3 bg-[#0f172a] rounded-xl border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                    <span className="font-bold text-emerald-400">GREEN ZONE (Approved Clearance)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Sundargarh, Koraput, Balaghat, Dhar, Dhamtari, Nandurbar, Simdega, etc.</p>
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
