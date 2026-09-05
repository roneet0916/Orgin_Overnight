import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, Marker, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDistrictGeoJSON, getDistrictStats, getLandPatches } from '../services/api';
import Loading from '../components/Loading';
import { MapPin, Info, Layers, Globe, ShieldAlert, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

// Fix default Leaflet icon paths
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
  const [selectedItem, setSelectedItem] = useState(null); // district or land patch
  const [activeLayer, setActiveLayer] = useState('dark');
  const [viewMode, setViewMode] = useState('all'); // 'all', 'patches', 'districts'

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
    if (!props) return '#2a9d8f';
    const anomalies = props.anomalies || 0;
    const delayed = props.delayed || 0;
    const pending = props.pending || 0;

    if (anomalies >= 8 || delayed >= 3) {
      return '#e76f51'; // High Risk / Red
    } else if (pending >= 10 || anomalies >= 5) {
      return '#e9c46a'; // Medium Risk / Warning Yellow
    }
    return '#2a9d8f';   // Normal / Green
  };

  const styleFeature = (feature) => {
    const props = feature.properties;
    const color = getDistrictColor(props);
    return {
      fillColor: color,
      weight: 2,
      opacity: 0.9,
      color: '#01472e',
      dashArray: '3',
      fillOpacity: 0.45
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties;
    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.75, weight: 3, color: '#ccd5ae' });
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
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri'
    }
  };

  if (loading) return <Loading message="Initializing Forest GIS Spatial Intelligence & Land Boundary Patches..." />;

  return (
    <div className="space-y-6 pb-16 animate-reveal">
      {/* Title */}
      <div className="forest-card p-8 border border-[#a3b18a]/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-[#fefae0] uppercase tracking-wide leading-none flex items-center gap-3">
            <MapPin className="w-8 h-8 text-[#ccd5ae]" />
            GIS Spatial Intelligence & Land Patches
          </h1>
          <p className="text-xs text-[#a3b18a] font-medium tracking-[0.2em] uppercase mt-2">
            Green (Claim Boundary) vs Red (Land Overlap Discrepancy) GIS Visual Audit
          </p>
        </div>

        {/* View Mode & Layer Switchers */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#022317] border border-[#134934] p-1.5 rounded-full text-xs">
            <span className="text-[#a3b18a] px-2 font-bold uppercase tracking-[0.15em] flex items-center gap-1 text-[10px]">
              <Layers className="w-3.5 h-3.5 text-[#ccd5ae]" /> Display:
            </span>
            {[
              { id: 'all', label: 'All Layers' },
              { id: 'patches', label: 'Land Patches (Red/Green)' },
              { id: 'districts', label: 'District Regions' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${
                  viewMode === mode.id
                    ? 'bg-[#01472e] text-[#fefae0] border border-[#a3b18a]/40 shadow-forest-lg'
                    : 'text-[#a3b18a] hover:text-[#fefae0]'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Basemap switcher */}
          <div className="flex items-center gap-1 bg-[#022317] border border-[#134934] p-1.5 rounded-full text-xs">
            <span className="text-[#a3b18a] px-2 font-bold uppercase tracking-[0.15em] flex items-center gap-1 text-[10px]">
              <Globe className="w-3.5 h-3.5 text-[#ccd5ae]" /> Basemap:
            </span>
            {['dark', 'osm', 'satellite'].map((layerKey) => (
              <button
                key={layerKey}
                onClick={() => setActiveLayer(layerKey)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${
                  activeLayer === layerKey ? 'bg-[#01472e] text-[#fefae0] border border-[#a3b18a]/40 shadow-forest-lg' : 'text-[#a3b18a] hover:text-[#fefae0]'
                }`}
              >
                {layerKey}
              </button>
            ))}
          </div>

          {/* Map Color Legend */}
          <div className="flex items-center gap-3 bg-[#022317] border border-[#134934] px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]">
            <span className="flex items-center gap-1.5 text-[#52b788]">
              <span className="w-3 h-3 rounded bg-[#52b788] inline-block border border-white/20" /> Claim Boundary (Green)
            </span>
            <span className="flex items-center gap-1.5 text-[#e76f51]">
              <span className="w-3 h-3 rounded bg-[#e76f51] inline-block border border-white/20" /> Land Overlap / Anomaly (Red)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-3 forest-card p-3 shadow-forest-2xl h-[680px] relative overflow-hidden group">
          {/* Cyber Radar Pulse HUD Overlay */}
          <div className="absolute top-6 right-6 z-[400] bg-[#021a11]/90 backdrop-blur-md border border-[#52b788]/40 px-4 py-2 rounded-full flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#52b788] shadow-[0_0_20px_rgba(82,183,136,0.3)] pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-[#52b788] animate-ping inline-block" />
            <span className="flex items-center gap-1.5">
              <span>LIVE GIS SPATIAL AUDIT RADAR</span>
              <span className="text-[#a3b18a] font-mono text-[9px]">(22.8°N, 77.2°E)</span>
            </span>
          </div>
          <MapContainer
            center={[22.8, 77.2]}
            zoom={7}
            scrollWheelZoom={true}
            className="w-full h-full rounded-[2rem]"
            key={`${activeLayer}-${viewMode}`}
          >
            <TileLayer
              attribution={tileLayers[activeLayer].attribution}
              url={tileLayers[activeLayer].url}
            />

            {/* District Polygons Layer */}
            {(viewMode === 'all' || viewMode === 'districts') && geoJsonData && (
              <GeoJSON
                key={`geojson-${geoJsonData.features?.length || 0}`}
                data={geoJsonData}
                style={styleFeature}
                onEachFeature={onEachFeature}
              />
            )}

            {/* Land Patches Layer (Green Claim Boundary & Red Overlap Discrepancy Block) */}
            {(viewMode === 'all' || viewMode === 'patches') && landPatches.map((patch) => {
              const claimPositions = patch.coordinates;
              const overlapPositions = patch.overlap_coordinates;

              return (
                <React.Fragment key={`patch-group-${patch.claim_id}`}>
                  {/* GREEN POLYGON BLOCK: Valid Claim Boundary */}
                  {claimPositions && claimPositions.length > 0 && (
                    <Polygon
                      positions={claimPositions}
                      pathOptions={{
                        color: '#2a9d8f',
                        fillColor: '#52b788',
                        fillOpacity: 0.6,
                        weight: 3,
                        dashArray: '2, 4'
                      }}
                      eventHandlers={{
                        click: () => setSelectedItem({ type: 'patch', data: patch })
                      }}
                    >
                      <Popup className="forest-popup">
                        <div className="p-3 space-y-2 min-w-[220px]">
                          <div className="border-b border-[#134934] pb-2 flex items-center justify-between">
                            <div>
                              <h3 className="font-display text-xl text-[#fefae0] uppercase tracking-wide">{patch.claim_id}</h3>
                              <p className="text-[10px] text-[#52b788] uppercase font-bold tracking-wider">Valid Claimed Land Boundary</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#01472e] text-[#fefae0] border border-[#52b788]">
                              {patch.status}
                            </span>
                          </div>
                          <div className="text-xs space-y-1 text-[#fefae0]">
                            <p><strong className="text-[#a3b18a]">Village:</strong> {patch.village}, {patch.district}</p>
                            <p><strong className="text-[#a3b18a]">Claim Area:</strong> {patch.area_hectares} Hectares</p>
                            <p><strong className="text-[#a3b18a]">Evidence Score:</strong> {patch.evidence_score}%</p>
                            <p><strong className="text-[#a3b18a]">Forest Cover:</strong> {patch.forest_cover_percent}%</p>
                          </div>
                        </div>
                      </Popup>
                    </Polygon>
                  )}

                  {/* RED POLYGON BLOCK: Overlap Discrepancy Anomaly Area */}
                  {overlapPositions && overlapPositions.length > 0 && (
                    <Polygon
                      positions={overlapPositions}
                      pathOptions={{
                        color: '#d90429',
                        fillColor: '#e76f51',
                        fillOpacity: 0.85,
                        weight: 3,
                      }}
                      eventHandlers={{
                        click: () => setSelectedItem({ type: 'patch', data: patch })
                      }}
                    >
                      <Popup className="forest-popup">
                        <div className="p-3 space-y-2 min-w-[220px]">
                          <div className="border-b border-[#134934] pb-2 flex items-center justify-between">
                            <div>
                              <h3 className="font-display text-xl text-[#e76f51] uppercase tracking-wide">⚠️ Land Overlap Block</h3>
                              <p className="text-[10px] text-[#e76f51] uppercase font-bold tracking-wider">Boundary Conflict Anomaly ({patch.overlap_percent}%)</p>
                            </div>
                          </div>
                          <div className="text-xs space-y-1 text-[#fefae0]">
                            <p><strong className="text-[#e76f51]">Associated Claim:</strong> {patch.claim_id}</p>
                            <p><strong className="text-[#a3b18a]">Location:</strong> {patch.village}, {patch.district}</p>
                            <p><strong className="text-[#e76f51]">Risk Level:</strong> {patch.risk_level}</p>
                            <p><strong className="text-[#a3b18a]">Discrepancy:</strong> Encroaches on reserved forest / neighboring claim boundary.</p>
                          </div>
                        </div>
                      </Popup>
                    </Polygon>
                  )}
                </React.Fragment>
              );
            })}

            {/* District Markers Layer */}
            {(viewMode === 'all' || viewMode === 'districts') && districtStats.map((dist) => (
              <Marker
                key={dist.district}
                position={[dist.latitude, dist.longitude]}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'district', data: dist })
                }}
              >
                <Popup className="forest-popup">
                  <div className="p-3 space-y-2 min-w-[200px]">
                    <div className="border-b border-[#134934] pb-2">
                      <h3 className="font-display text-xl text-[#fefae0] uppercase tracking-wide">{dist.district}</h3>
                      <p className="text-[10px] text-[#a3b18a] uppercase tracking-wider">{dist.state}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider">
                      <div className="bg-[#022317] p-2 rounded-[1rem]">
                        <span className="text-[#a3b18a] block text-[8px]">Total</span>
                        <span className="font-display text-base text-[#fefae0]">{dist.total}</span>
                      </div>
                      <div className="bg-[#022317] p-2 rounded-[1rem]">
                        <span className="text-[#a3b18a] block text-[8px]">Approved</span>
                        <span className="font-display text-base text-[#ccd5ae]">{dist.approved}</span>
                      </div>
                      <div className="bg-[#022317] p-2 rounded-[1rem]">
                        <span className="text-[#e9edc9] block text-[8px]">Pending</span>
                        <span className="font-display text-base text-[#e9edc9]">{dist.pending}</span>
                      </div>
                      <div className="bg-[#022317] p-2 rounded-[1rem]">
                        <span className="text-[#e76f51] block text-[8px]">Delayed</span>
                        <span className="font-display text-base text-[#e76f51]">{dist.delayed}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-[#a3b18a]">AI Anomalies:</span>
                      <span className="font-mono text-[#fefae0] px-2.5 py-0.5 rounded-full bg-[#01472e] border border-[#a3b18a]/40">
                        {dist.anomalies}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar Inspector */}
        <div className="forest-card p-6 shadow-forest-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-display text-2xl text-[#fefae0] uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-[#134934] pb-3">
              <Layers className="w-5 h-5 text-[#ccd5ae]" />
              Spatial Inspector
            </h3>

            {selectedItem ? (
              selectedItem.type === 'patch' ? (
                /* Land Patch Detailed Inspector */
                <div className="space-y-4">
                  <div className="p-4 bg-[#022317] border border-[#134934] rounded-[1.5rem]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-lg text-[#fefae0]">{selectedItem.data.claim_id}</span>
                      <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        selectedItem.data.risk_level === 'High'
                          ? 'bg-[#e76f51]/20 text-[#e76f51] border-[#e76f51]'
                          : 'bg-[#52b788]/20 text-[#52b788] border-[#52b788]'
                      }`}>
                        {selectedItem.data.risk_level} Risk
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a3b18a] uppercase tracking-[0.15em] mt-1">
                      {selectedItem.data.village}, {selectedItem.data.district} ({selectedItem.data.state})
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-3 bg-[#022317] rounded-[1rem] border border-[#134934]">
                      <span className="text-[#a3b18a] uppercase tracking-[0.15em] text-[10px] font-bold">Claim Area</span>
                      <span className="font-display text-lg text-[#52b788]">{selectedItem.data.area_hectares} Ha</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-[#022317] rounded-[1rem] border border-[#134934]">
                      <span className="text-[#a3b18a] uppercase tracking-[0.15em] text-[10px] font-bold">Land / Claim Type</span>
                      <span className="font-bold text-xs text-[#fefae0]">{selectedItem.data.claim_type}</span>
                    </div>

                    {selectedItem.data.overlap_percent > 0 && (
                      <div className="flex justify-between items-center p-3 bg-[#e76f51]/20 border border-[#e76f51]/50 rounded-[1rem]">
                        <span className="text-[#e76f51] uppercase tracking-[0.15em] text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Red Overlap Block
                        </span>
                        <span className="font-display text-xl text-[#e76f51]">{selectedItem.data.overlap_percent}% Area</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center p-3 bg-[#022317] rounded-[1rem] border border-[#134934]">
                      <span className="text-[#a3b18a] uppercase tracking-[0.15em] text-[10px] font-bold">Evidence Confidence</span>
                      <span className="font-mono text-sm text-[#ccd5ae]">{selectedItem.data.evidence_score}%</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-[#022317] rounded-[1rem] border border-[#134934]">
                      <span className="text-[#a3b18a] uppercase tracking-[0.15em] text-[10px] font-bold">Forest Cover</span>
                      <span className="font-mono text-sm text-[#52b788]">{selectedItem.data.forest_cover_percent}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* District Inspector */
                <div className="space-y-4">
                  <div className="p-4 bg-[#022317] border border-[#134934] rounded-[1.5rem]">
                    <h2 className="font-display text-2xl text-[#fefae0] uppercase tracking-wide">{selectedItem.data.district}</h2>
                    <p className="text-[10px] text-[#a3b18a] uppercase tracking-[0.2em]">{selectedItem.data.state}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-3 bg-[#022317] rounded-[1rem] border border-[#134934]">
                      <span className="text-[#a3b18a] uppercase tracking-[0.15em] text-[10px] font-bold">Total Claims</span>
                      <span className="font-display text-xl text-[#fefae0]">{selectedItem.data.total}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-[#022317] rounded-[1rem] border border-[#134934]">
                      <span className="text-[#ccd5ae] uppercase tracking-[0.15em] text-[10px] font-bold">Approved</span>
                      <span className="font-display text-xl text-[#ccd5ae]">{selectedItem.data.approved}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-[#022317] rounded-[1rem] border border-[#134934]">
                      <span className="text-[#e9edc9] uppercase tracking-[0.15em] text-[10px] font-bold">Pending</span>
                      <span className="font-display text-xl text-[#e9edc9]">{selectedItem.data.pending}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-[#022317] rounded-[1rem] border border-[#134934]">
                      <span className="text-[#e76f51] uppercase tracking-[0.15em] text-[10px] font-bold">Delayed (&gt;180d)</span>
                      <span className="font-display text-xl text-[#e76f51]">{selectedItem.data.delayed}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-[#01472e] border border-[#a3b18a]/40 rounded-[1rem] shadow-forest-lg">
                      <span className="text-[#ccd5ae] uppercase tracking-[0.2em] text-[10px] font-bold">AI Flagged Anomalies</span>
                      <span className="font-display text-xl text-[#fefae0]">{selectedItem.data.anomalies}</span>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="p-8 text-center text-[#a3b18a] text-xs space-y-3">
                <Info className="w-8 h-8 text-[#ccd5ae] mx-auto" />
                <p className="uppercase tracking-[0.2em] leading-relaxed">
                  Click any Green/Red land patch block or district boundary on the map to inspect spatial statistics.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#134934] text-[10px] font-mono text-[#a3b18a] uppercase tracking-wider flex items-center justify-between">
            <span>Land Patches: {landPatches.length} loaded</span>
            <span>Center: 22.8° N, 77.2° E</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
