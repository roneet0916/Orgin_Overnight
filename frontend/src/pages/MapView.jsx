import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polygon, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDistrictGeoJSON, getDistrictStats, getLandPatches } from '../services/api';
import Loading from '../components/Loading';
import { MapPin, Layers, Globe, ShieldAlert, CheckCircle2, AlertTriangle, FileText, ExternalLink } from 'lucide-react';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [districtStats, setDistrictStats] = useState([]);
  const [landPatches, setLandPatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeLayer, setActiveLayer] = useState('satellite'); // Default to realistic ESRI Satellite Map!
  const [viewMode, setViewMode] = useState('all');

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const [gData, dStats, patchesRes] = await Promise.all([
        getDistrictGeoJSON(),
        getDistrictStats(),
        getLandPatches().catch(() => ({ land_patches: [] }))
      ]);
      setGeoJsonData(gData);
      setDistrictStats(dStats);
      setLandPatches(patchesRes.land_patches || []);
    } catch (err) {
      console.error('Error fetching map data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDistrictColor = (props) => {
    if (!props) return '#06b6d4';
    const anomalies = props.anomalies || 0;
    const delayed = props.delayed || 0;

    if (anomalies >= 60 || delayed >= 100 || props.risk_level === 'HIGH') {
      return '#f43f5e'; // High Risk / Neon Crimson
    } else if (anomalies >= 40 || props.risk_level === 'MODERATE') {
      return '#f59e0b'; // Warning Amber
    }
    return '#10b981';   // Emerald Clean
  };

  const styleFeature = (feature) => {
    const props = feature.properties;
    const color = getDistrictColor(props);
    return {
      fillColor: color,
      weight: 2,
      opacity: 0.9,
      color: '#ffffff',
      dashArray: '4',
      fillOpacity: 0.45
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties;
    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.75, weight: 3, color: '#38bdf8' });
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
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
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

  if (loading) return <Loading message="Initializing Realistic Satellite Imagery & GIS Spatial Overlays..." />;

  return (
    <div className="space-y-6 pb-16 animate-reveal">
      {/* Title Header */}
      <div className="forest-card p-6 border border-slate-700/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-white uppercase tracking-wide leading-none flex items-center gap-3">
            <MapPin className="w-7 h-7 text-[#06b6d4]" />
            GIS Spatial Intelligence & Realistic Satellite View
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-[0.2em] uppercase mt-2">
            Real-time Forest Rights Act Land Overlap Audit & Satellite Polygon Verification
          </p>
        </div>

        {/* View Mode & Layer Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Display Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#0f172a] border border-[#1e293b] p-1.5 rounded-full text-xs">
            <span className="text-slate-400 px-2 font-bold uppercase tracking-[0.15em] flex items-center gap-1 text-[10px]">
              <Layers className="w-3.5 h-3.5 text-[#06b6d4]" /> Display:
            </span>
            {[
              { id: 'all', label: 'All Layers' },
              { id: 'patches', label: 'Land Patches' },
              { id: 'districts', label: 'District Regions' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${
                  viewMode === mode.id
                    ? 'bg-[#06b6d4] text-[#070c18] border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Basemap switcher */}
          <div className="flex items-center gap-1 bg-[#0f172a] border border-[#1e293b] p-1.5 rounded-full text-xs">
            <span className="text-slate-400 px-2 font-bold uppercase tracking-[0.15em] flex items-center gap-1 text-[10px]">
              <Globe className="w-3.5 h-3.5 text-[#10b981]" /> Basemap:
            </span>
            {['satellite', 'dark', 'osm'].map((layerKey) => (
              <button
                key={layerKey}
                onClick={() => setActiveLayer(layerKey)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${
                  activeLayer === layerKey
                    ? 'bg-[#10b981] text-[#070c18] border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {layerKey}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-3 forest-card p-3 shadow-2xl h-[650px] relative overflow-hidden group border border-[#1e293b]">
          {/* Cyber Radar HUD Overlay */}
          <div className="absolute top-6 right-6 z-[400] bg-[#0f172a]/90 backdrop-blur-md border border-[#06b6d4]/40 px-4 py-2 rounded-full flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#06b6d4] shadow-[0_0_20px_rgba(6,182,212,0.3)] pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] animate-ping inline-block" />
            <span>REALISTIC ISRO/ESRI SATELLITE RADAR</span>
          </div>

          <MapContainer
            center={[22.5, 82.5]}
            zoom={6}
            scrollWheelZoom={true}
            className="w-full h-full rounded-2xl"
            key={`${activeLayer}-${viewMode}`}
          >
            <TileLayer
              attribution={tileLayers[activeLayer].attribution}
              url={tileLayers[activeLayer].url}
            />

            {/* GeoJSON District Layer */}
            {(viewMode === 'all' || viewMode === 'districts') && geoJsonData && (
              <GeoJSON
                key={`geojson-${geoJsonData.features?.length || 0}`}
                data={geoJsonData}
                style={styleFeature}
                onEachFeature={onEachFeature}
              />
            )}

            {/* Land Patches Layer */}
            {(viewMode === 'all' || viewMode === 'patches') && landPatches.map((patch) => {
              const positions = patch.coordinates;
              const isFlagged = patch.status === 'DISCREPANCY_FLAGGED' || patch.severity === 'HIGH';
              const color = isFlagged ? '#f43f5e' : '#10b981';

              if (!positions || positions.length === 0) return null;

              return (
                <Polygon
                  key={patch.id}
                  positions={positions}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: isFlagged ? 0.6 : 0.4,
                    weight: 3,
                    dashArray: isFlagged ? '6' : null
                  }}
                  eventHandlers={{
                    click: () => setSelectedItem({ type: 'patch', data: patch })
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
                        <span className="font-bold text-[#06b6d4]">{patch.claim_id}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          isFlagged ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {patch.status}
                        </span>
                      </div>
                      <p className="font-semibold text-white">{patch.applicant_name}</p>
                      <p className="text-[11px] text-slate-300">{patch.discrepancy_note}</p>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}
          </MapContainer>
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-4">
          <div className="forest-card p-5 border border-slate-700/80 space-y-4">
            <h3 className="font-display text-lg text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-700 pb-3">
              <ShieldAlert className="w-5 h-5 text-[#06b6d4]" />
              Spatial Audit Legend
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                <span className="w-4 h-4 rounded bg-[#10b981] border border-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Verified Land Claim</span>
                  <span className="text-[10px] text-slate-400">Match confirmed with satellite records</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                <span className="w-4 h-4 rounded bg-[#f59e0b] border border-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Moderate Delay / Warning</span>
                  <span className="text-[10px] text-slate-400">Pending review &gt; 120 days</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                <span className="w-4 h-4 rounded bg-[#f43f5e] border border-rose-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">High Risk Overlap</span>
                  <span className="text-[10px] text-slate-400">Discrepancy detected by AI Engine</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Item Detail */}
          {selectedItem && (
            <div className="forest-card p-5 border border-[#06b6d4]/50 animate-reveal space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-xs font-bold text-[#06b6d4] uppercase tracking-wider">
                  {selectedItem.type === 'district' ? 'District Audit' : 'Land Claim Details'}
                </span>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {selectedItem.type === 'district' ? (
                <div className="space-y-2 text-xs">
                  <h4 className="font-display text-xl text-white uppercase">{selectedItem.data.name}</h4>
                  <p className="text-slate-300">State: <span className="font-bold text-white">{selectedItem.data.state}</span></p>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] font-bold">
                    <div className="bg-[#0f172a] p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Total Claims</span>
                      <span className="text-white text-sm font-mono">{selectedItem.data.claims}</span>
                    </div>
                    <div className="bg-[#0f172a] p-2.5 rounded-xl border border-slate-800">
                      <span className="text-rose-400 block">Anomalies</span>
                      <span className="text-rose-400 text-sm font-mono">{selectedItem.data.anomalies}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <h4 className="font-display text-lg text-cyan-300 font-mono">{selectedItem.data.claim_id}</h4>
                  <p className="text-white font-semibold">{selectedItem.data.applicant_name}</p>
                  <p className="text-slate-300 text-[11px] bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                    "{selectedItem.data.discrepancy_note}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
