import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDistrictGeoJSON, getLandPatches } from '../services/api';
import { ALL_DISTRICTS_DATA, LAND_CLAIM_PATCHES } from '../data/geoData';
import Loading from '../components/Loading';
import { 
  MapPin, Globe, ShieldAlert, CheckCircle2, AlertTriangle, 
  Filter, Info, Eye, Layers, Compass, Crosshair, Sparkles, 
  Zap, ArrowRight, ShieldCheck, Clock, FileWarning, Search,
  Maximize2, Activity, Navigation
} from 'lucide-react';

// Custom Map Markers with Cyber Glow Ripples
const createCustomIcon = (color, pulseColor) => {
  return L.divIcon({
    className: 'custom-map-marker-container',
    html: `
      <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: ${pulseColor || color};
          opacity: 0.6;
          animation: beaconRing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          background-color: ${color};
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 0 12px ${color};
          z-index: 2;
        "></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const iconRed = createCustomIcon('#f43f5e', 'rgba(244, 63, 94, 0.8)');
const iconYellow = createCustomIcon('#f59e0b', 'rgba(245, 158, 11, 0.8)');
const iconGreen = createCustomIcon('#10b981', 'rgba(16, 185, 129, 0.8)');

// Helper component to smoothly move map camera
function MapCameraHandler({ targetLocation }) {
  const map = useMap();
  useEffect(() => {
    if (targetLocation) {
      map.flyTo(targetLocation.center, targetLocation.zoom, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [targetLocation, map]);
  return null;
}

const MapView = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [landPatches, setLandPatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeLayer, setActiveLayer] = useState('voyager');
  const [cameraTarget, setCameraTarget] = useState(null);
  const [showPatches, setShowPatches] = useState(true);
  const [showDistricts, setShowDistricts] = useState(true);

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
      setLandPatches(patchesRes.land_patches || LAND_CLAIM_PATCHES);
    } catch (err) {
      console.error('Error fetching map data:', err);
      // Fallback to local data
      setLandPatches(LAND_CLAIM_PATCHES);
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

  // Zone statistics calculation
  const zoneStats = useMemo(() => {
    const redDistricts = ALL_DISTRICTS_DATA.filter(d => d.risk_level === 'HIGH');
    const yellowDistricts = ALL_DISTRICTS_DATA.filter(d => d.risk_level === 'MODERATE');
    const greenDistricts = ALL_DISTRICTS_DATA.filter(d => d.risk_level === 'LOW');

    const redPatches = landPatches.filter(p => p.color === '#f43f5e' || p.status === 'ANOMALY');
    const yellowPatches = landPatches.filter(p => p.color === '#f59e0b' || p.status === 'PENDING');
    const greenPatches = landPatches.filter(p => p.color === '#10b981' || p.status === 'APPROVED');

    const totalRedAnomalies = redDistricts.reduce((sum, d) => sum + d.anomalies, 0);
    const totalYellowDelayed = yellowDistricts.reduce((sum, d) => sum + d.delayed, 0);

    return {
      red: {
        districtsCount: redDistricts.length,
        patchesCount: redPatches.length,
        anomaliesTotal: totalRedAnomalies,
        hotspots: redDistricts.map(d => ({ name: d.name, state: d.state, lat: d.lat, lng: d.lng }))
      },
      yellow: {
        districtsCount: yellowDistricts.length,
        patchesCount: yellowPatches.length,
        delayedTotal: totalYellowDelayed,
        hotspots: yellowDistricts.map(d => ({ name: d.name, state: d.state, lat: d.lat, lng: d.lng }))
      },
      green: {
        districtsCount: greenDistricts.length,
        patchesCount: greenPatches.length
      }
    };
  }, [landPatches]);

  // Filter Features based on state, zone, and search query
  const features = useMemo(() => {
    return (geoJsonData?.features || []).filter(feat => {
      const props = feat.properties || {};
      if (selectedState !== 'All' && props.state !== selectedState) return false;
      if (selectedZone !== 'All') {
        if (selectedZone === 'RED' && props.risk_level !== 'HIGH' && props.color !== '#f43f5e') return false;
        if (selectedZone === 'YELLOW' && props.risk_level !== 'MODERATE' && props.color !== '#f59e0b') return false;
        if (selectedZone === 'GREEN' && props.risk_level !== 'LOW' && props.color !== '#10b981') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const distName = (props.district || props.name || '').toLowerCase();
        const stateName = (props.state || '').toLowerCase();
        if (!distName.includes(q) && !stateName.includes(q)) return false;
      }
      return true;
    });
  }, [geoJsonData, selectedState, selectedZone, searchQuery]);

  const filteredPatches = useMemo(() => {
    return landPatches.filter(p => {
      if (selectedState !== 'All' && p.state !== selectedState) return false;
      if (selectedZone !== 'All') {
        if (selectedZone === 'RED' && p.color !== '#f43f5e') return false;
        if (selectedZone === 'YELLOW' && p.color !== '#f59e0b') return false;
        if (selectedZone === 'GREEN' && p.color !== '#10b981') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          (p.claim_id || '').toLowerCase().includes(q) ||
          (p.applicant_name || '').toLowerCase().includes(q) ||
          (p.district || '').toLowerCase().includes(q) ||
          (p.village || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [landPatches, selectedState, selectedZone, searchQuery]);

  const jumpToHotspot = (lat, lng, zoom = 8) => {
    setCameraTarget({ center: [lat, lng], zoom });
  };

  const jumpToZone = (zoneKey) => {
    setSelectedZone(zoneKey);
    if (zoneKey === 'RED') {
      // Focus Bastar / Central Red Belt
      setCameraTarget({ center: [20.2, 82.5], zoom: 7 });
    } else if (zoneKey === 'YELLOW') {
      // Focus Mayurbhanj / East Belt
      setCameraTarget({ center: [22.0, 83.5], zoom: 7 });
    } else if (zoneKey === 'GREEN') {
      setCameraTarget({ center: [21.8, 81.5], zoom: 6 });
    } else {
      setCameraTarget({ center: [21.8, 81.5], zoom: 6 });
    }
  };

  if (loading) return <Loading message="Loading GIS Map with State & District Labels..." />;

  return (
    <div className="space-y-6 pb-16 animate-reveal">
      {/* 🚀 TOP COMMAND BAR: RED ZONE & YELLOW ZONE HIGHLIGHT BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* RED ZONE CARD */}
        <div 
          onClick={() => jumpToZone('RED')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
            selectedZone === 'RED'
              ? 'zone-card-red ring-2 ring-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.4)]'
              : 'bg-[#0f172a]/80 border-rose-500/30 hover:border-rose-500/80 hover:bg-rose-950/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 shadow-[0_0_10px_#f43f5e]"></span>
              </span>
              <span className="font-display font-extrabold text-sm tracking-wider uppercase text-rose-400">
                🔴 RED ZONE (HIGH RISK)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase font-bold">
              Critical
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-display font-extrabold text-white tracking-tight">
                {zoneStats.red.districtsCount}
              </span>
              <span className="text-xs text-slate-400 font-bold ml-1.5 uppercase">Districts</span>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-rose-400 font-bold">{zoneStats.red.anomaliesTotal}</span>
              <span className="text-slate-400 block text-[9px] uppercase">Encroachments & Overlaps</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-2 line-clamp-1">
            Bastar, Kanker, Dindori, Gadchiroli, Ranchi, West Singhbhum, Kandhamal
          </p>

          <div className="mt-3 pt-2 border-t border-rose-500/20 flex items-center justify-between text-[10px] text-rose-300 font-bold">
            <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <Crosshair className="w-3 h-3 text-rose-400" /> Focus Red Hotspots
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* YELLOW ZONE CARD */}
        <div 
          onClick={() => jumpToZone('YELLOW')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
            selectedZone === 'YELLOW'
              ? 'zone-card-yellow ring-2 ring-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.4)]'
              : 'bg-[#0f172a]/80 border-amber-500/30 hover:border-amber-500/80 hover:bg-amber-950/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 shadow-[0_0_10px_#f59e0b]"></span>
              </span>
              <span className="font-display font-extrabold text-sm tracking-wider uppercase text-amber-400">
                🟡 YELLOW ZONE (SLA WATCH)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-bold">
              Pending &gt;180D
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-display font-extrabold text-white tracking-tight">
                {zoneStats.yellow.districtsCount}
              </span>
              <span className="text-xs text-slate-400 font-bold ml-1.5 uppercase">Districts</span>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-amber-400 font-bold">{zoneStats.yellow.delayedTotal}</span>
              <span className="text-slate-400 block text-[9px] uppercase">Pending Backlog Claims</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-2 line-clamp-1">
            Mayurbhanj, Mandla, Rayagada, Surguja, Rajnandgaon, Gumla, Palghar
          </p>

          <div className="mt-3 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[10px] text-amber-300 font-bold">
            <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <Clock className="w-3 h-3 text-amber-400" /> Focus Yellow Backlog
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* GREEN ZONE & ALL ZONES CARD */}
        <div 
          onClick={() => jumpToZone('GREEN')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
            selectedZone === 'GREEN'
              ? 'zone-card-green ring-2 ring-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.4)]'
              : 'bg-[#0f172a]/80 border-emerald-500/30 hover:border-emerald-500/80 hover:bg-emerald-950/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
              </span>
              <span className="font-display font-extrabold text-sm tracking-wider uppercase text-emerald-400">
                🟢 GREEN ZONE (CLEARED)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase font-bold">
              Verified
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-display font-extrabold text-white tracking-tight">
                {zoneStats.green.districtsCount}
              </span>
              <span className="text-xs text-slate-400 font-bold ml-1.5 uppercase">Districts</span>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-emerald-400 font-bold">High Compliance</span>
              <span className="text-slate-400 block text-[9px] uppercase">GPS & ISRO Cleared</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-2 line-clamp-1">
            Sundargarh, Koraput, Balaghat, Dhar, Dhamtari, Nandurbar, Simdega
          </p>

          <div className="mt-3 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[10px] text-emerald-300 font-bold">
            <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Focus Green Clearances
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Control Header & Filters */}
      <div className="forest-card p-5 border border-slate-700/80 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl md:text-3xl text-white uppercase tracking-wide leading-none flex items-center gap-2.5">
                <MapPin className="w-7 h-7 text-[#06b6d4]" />
                FRA Spatial Intelligence GIS
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/40 text-[#38bdf8] text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#06b6d4]" /> 25 Districts Live
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-[0.15em] uppercase mt-1.5">
              Multi-Spectral Audit • Red Zone Anomaly Detection • Yellow Zone SLA Tracking • 5 Target States
            </p>
          </div>

          {/* Map Layer Switchers */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#091122] border border-slate-700 p-1.5 rounded-full text-xs">
              <span className="text-slate-400 px-2 font-bold uppercase tracking-[0.15em] text-[10px] flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#10b981]" /> Layer:
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

            {/* Reset Map View */}
            <button
              onClick={() => setCameraTarget({ center: [21.8, 81.5], zoom: 6 })}
              className="p-2 rounded-full bg-[#091122] border border-slate-700 text-slate-300 hover:text-white hover:border-[#06b6d4] transition-all shadow-md"
              title="Reset Map to All India Central View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/90">
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search district, village, claim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#091122] border border-slate-700 rounded-full pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] w-56 font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* State Filter */}
            <div className="flex items-center gap-2 bg-[#091122] border border-slate-700 px-3 py-1.5 rounded-full text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px] flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#06b6d4]" /> State:
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

            {/* Zone Filter Pill Selector */}
            <div className="flex items-center gap-1 bg-[#091122] border border-slate-700 p-1 rounded-full text-xs">
              <button
                onClick={() => setSelectedZone('All')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] transition-all ${
                  selectedZone === 'All'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Zones
              </button>
              <button
                onClick={() => setSelectedZone('RED')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] transition-all flex items-center gap-1.5 ${
                  selectedZone === 'RED'
                    ? 'bg-rose-500 text-white shadow-[0_0_12px_#f43f5e]'
                    : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                Red Zone
              </button>
              <button
                onClick={() => setSelectedZone('YELLOW')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] transition-all flex items-center gap-1.5 ${
                  selectedZone === 'YELLOW'
                    ? 'bg-amber-500 text-black shadow-[0_0_12px_#f59e0b]'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Yellow Zone
              </button>
              <button
                onClick={() => setSelectedZone('GREEN')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] transition-all flex items-center gap-1.5 ${
                  selectedZone === 'GREEN'
                    ? 'bg-emerald-500 text-black shadow-[0_0_12px_#10b981]'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Green Zone
              </button>
            </div>
          </div>

          {/* Quick Jump Hotspot Badges */}
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> Hotspots:
            </span>
            <button
              onClick={() => jumpToHotspot(19.1000, 81.9500, 9)}
              className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500 hover:text-white transition-all font-bold"
            >
              🔴 Bastar (CG)
            </button>
            <button
              onClick={() => jumpToHotspot(22.9515, 81.0800, 9)}
              className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500 hover:text-white transition-all font-bold"
            >
              🔴 Dindori (MP)
            </button>
            <button
              onClick={() => jumpToHotspot(21.9333, 86.7333, 9)}
              className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black transition-all font-bold"
            >
              🟡 Mayurbhanj (OD)
            </button>
            <button
              onClick={() => jumpToHotspot(22.5986, 80.3708, 9)}
              className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black transition-all font-bold"
            >
              🟡 Mandla (MP)
            </button>
          </div>
        </div>
      </div>

      {/* Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Viewport Container */}
        <div className="lg:col-span-3 forest-card p-3 shadow-2xl h-[720px] relative overflow-hidden group border border-slate-700/80">
          {/* Cyber Radar HUD Badge */}
          <div className="absolute top-6 right-6 z-[400] bg-[#070e1e]/90 backdrop-blur-md border border-[#06b6d4]/50 px-4 py-2 rounded-full flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#06b6d4] shadow-[0_0_25px_rgba(6,182,212,0.35)] pointer-events-none">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span>REALTIME FRA DISTRICT SPATIAL LAYER • {features.length} ACTIVE</span>
          </div>

          {/* Floating Zone Legend Overlay */}
          <div className="absolute bottom-6 left-6 z-[400] bg-[#070e1e]/95 backdrop-blur-md border border-slate-700/90 p-3.5 rounded-2xl space-y-2 shadow-[0_10px_35px_rgba(0,0,0,0.85)] pointer-events-auto max-w-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#06b6d4]" /> Zone Risk Classification
              </span>
              <span className="text-[9px] font-mono text-cyan-400 font-bold">25 DIST</span>
            </div>
            <div className="space-y-1.5 text-[10px] font-bold">
              <div className="flex items-center justify-between gap-3 text-rose-400 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" /> 🔴 Red Zone
                </span>
                <span className="text-[9px] text-slate-300 font-mono">High Risk / Anomalies</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-amber-400 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" /> 🟡 Yellow Zone
                </span>
                <span className="text-[9px] text-slate-300 font-mono">Pending Backlog &gt;180D</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> 🟢 Green Zone
                </span>
                <span className="text-[9px] text-slate-300 font-mono">Approved Clearance</span>
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
            <MapCameraHandler targetLocation={cameraTarget} />

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
              const isRed = color === '#f43f5e' || props.risk_level === 'HIGH';
              const isYellow = color === '#f59e0b' || props.risk_level === 'MODERATE';
              
              const zoneSymbol = isRed ? '🔴' : isYellow ? '🟡' : '🟢';
              const zoneText = isRed ? 'RED ZONE' : isYellow ? 'YELLOW ZONE' : 'GREEN ZONE';
              const stateAbbr = props.state === 'Madhya Pradesh' ? 'MP' : props.state === 'Chhattisgarh' ? 'CG' : props.state === 'Maharashtra' ? 'MH' : props.state === 'Jharkhand' ? 'JH' : 'OD';
              
              const tooltipClass = `district-tooltip-label ${
                isRed ? 'district-tooltip-red' : isYellow ? 'district-tooltip-yellow' : 'district-tooltip-green'
              }`;

              return (
                <Polygon
                  key={`dist-${props.district || idx}`}
                  positions={leafletCoords}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: isRed ? 0.6 : isYellow ? 0.5 : 0.45,
                    weight: isRed ? 3.5 : 2.5,
                    dashArray: isRed ? '6' : isYellow ? '4' : null
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedItem({ type: 'district', data: props });
                      if (props.latitude && props.longitude) {
                        setCameraTarget({ center: [props.latitude, props.longitude], zoom: 8 });
                      }
                    }
                  }}
                >
                  {/* Permanent Text Label showing Zone Tag, District Name & State directly on the Map */}
                  <Tooltip
                    permanent={true}
                    direction="center"
                    className={tooltipClass}
                  >
                    <span>{zoneSymbol} {props.district || props.name}</span>
                    <span className="opacity-75 text-[9px]">({stateAbbr})</span>
                  </Tooltip>

                  <Popup>
                    <div className="p-1.5 space-y-2.5 text-xs min-w-[220px]">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                        <div>
                          <span className="font-bold text-white text-sm block">{props.district || props.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{props.state}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          isRed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50' : isYellow ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        }`}>
                          {zoneText}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-mono font-bold">
                        <div className="bg-[#091122] p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[8px] uppercase">Total Claims</span>
                          <span className="text-white text-xs">{props.claims}</span>
                        </div>
                        <div className="bg-[#091122] p-2 rounded-lg border border-slate-800">
                          <span className="text-emerald-400 block text-[8px] uppercase">Approved</span>
                          <span className="text-emerald-400 text-xs">{props.approved}</span>
                        </div>
                        <div className="bg-[#091122] p-2 rounded-lg border border-slate-800">
                          <span className="text-amber-400 block text-[8px] uppercase">Pending Backlog</span>
                          <span className="text-amber-400 text-xs">{props.pending}</span>
                        </div>
                        <div className="bg-[#091122] p-2 rounded-lg border border-slate-800">
                          <span className="text-rose-400 block text-[8px] uppercase">Anomalies</span>
                          <span className="text-rose-400 text-xs">{props.anomalies}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedItem({ type: 'district', data: props })}
                        className="w-full py-1.5 bg-[#06b6d4]/20 hover:bg-[#06b6d4] hover:text-[#070c18] text-[#38bdf8] font-bold text-[10px] rounded-lg transition-all border border-[#06b6d4]/40 uppercase tracking-wider text-center"
                      >
                        Inspect District Dossier →
                      </button>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

            {/* Render Individual Land Claim Boundary Patches & Pulsing Markers */}
            {filteredPatches.map((patch) => {
              const positions = patch.coordinates;
              const centerPos = patch.center || (positions ? positions[0] : null);
              const color = patch.color || '#10b981';
              const isRedPatch = color === '#f43f5e' || patch.status === 'ANOMALY';
              const isYellowPatch = color === '#f59e0b' || patch.status === 'PENDING';
              const icon = isRedPatch ? iconRed : isYellowPatch ? iconYellow : iconGreen;

              return (
                <React.Fragment key={patch.id}>
                  {positions && (
                    <Polygon
                      positions={positions}
                      pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.75,
                        weight: 3,
                        dashArray: isRedPatch ? '4' : null
                      }}
                      eventHandlers={{
                        click: () => {
                          setSelectedItem({ type: 'patch', data: patch });
                          if (centerPos) setCameraTarget({ center: centerPos, zoom: 11 });
                        }
                      }}
                    />
                  )}

                  {centerPos && (
                    <Marker
                      position={centerPos}
                      icon={icon}
                      eventHandlers={{
                        click: () => {
                          setSelectedItem({ type: 'patch', data: patch });
                          setCameraTarget({ center: centerPos, zoom: 11 });
                        }
                      }}
                    >
                      <Popup>
                        <div className="p-1.5 space-y-2 text-xs min-w-[200px]">
                          <div className="flex items-center justify-between border-b border-slate-700 pb-1 gap-2">
                            <span className="font-mono font-bold text-[#06b6d4]">{patch.claim_id}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              isRedPatch ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : isYellowPatch ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            }`}>
                              {isRedPatch ? '🔴 RED ZONE' : isYellowPatch ? '🟡 YELLOW ZONE' : '🟢 GREEN ZONE'}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{patch.applicant_name}</p>
                            <p className="text-[10px] text-slate-400">{patch.village}, {patch.district} ({patch.state})</p>
                          </div>
                          <p className="text-[11px] text-slate-300 bg-[#091122] p-2 rounded-lg border border-slate-800 leading-snug">
                            {patch.note}
                          </p>
                          <button
                            onClick={() => setSelectedItem({ type: 'patch', data: patch })}
                            className="w-full py-1 bg-[#06b6d4]/20 hover:bg-[#06b6d4] hover:text-[#070c18] text-[#38bdf8] font-bold text-[10px] rounded transition-all uppercase tracking-wider text-center"
                          >
                            Inspect Parcel Details →
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>

        {/* Sidebar Info Panel & Live Zone Intelligence Dossier */}
        <div className="space-y-4">
          {selectedItem ? (
            <div className="forest-card p-5 border border-[#06b6d4]/50 animate-reveal space-y-4 shadow-2xl bg-gradient-to-b from-[#0f172a] to-[#070e1e]">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
                <span className="text-xs font-extrabold text-[#06b6d4] uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  {selectedItem.type === 'district' ? 'District Audit Dossier' : 'Land Parcel Audit'}
                </span>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-xs text-slate-400 hover:text-white bg-slate-800/80 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {selectedItem.type === 'district' ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-2xl text-white uppercase font-bold tracking-tight">
                        {selectedItem.data.district || selectedItem.data.name}
                      </h3>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        selectedItem.data.risk_level === 'HIGH' || selectedItem.data.color === '#f43f5e'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                          : selectedItem.data.risk_level === 'MODERATE' || selectedItem.data.color === '#f59e0b'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      }`}>
                        {selectedItem.data.risk_level === 'HIGH' ? '🔴 RED ZONE' : selectedItem.data.risk_level === 'MODERATE' ? '🟡 YELLOW ZONE' : '🟢 GREEN ZONE'}
                      </span>
                    </div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mt-0.5">
                      {selectedItem.data.state} State Jurisdiction
                    </span>
                  </div>

                  {/* 4-Stat Metric Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <div className="bg-[#091122] p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block uppercase text-[8px]">Total Claims</span>
                      <span className="text-white text-lg font-mono">{selectedItem.data.claims?.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#091122] p-3 rounded-xl border border-slate-800">
                      <span className="text-emerald-400 block uppercase text-[8px]">Approved</span>
                      <span className="text-emerald-400 text-lg font-mono">{selectedItem.data.approved?.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#091122] p-3 rounded-xl border border-slate-800">
                      <span className="text-amber-400 block uppercase text-[8px]">Pending (SLA)</span>
                      <span className="text-amber-400 text-lg font-mono">{selectedItem.data.pending?.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#091122] p-3 rounded-xl border border-slate-800">
                      <span className="text-rose-400 block uppercase text-[8px]">Anomalies</span>
                      <span className="text-rose-400 text-lg font-mono">{selectedItem.data.anomalies?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Threat Assessment Details */}
                  <div className="p-3 bg-[#091122] rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" /> AI Risk Matrix Assessment:
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {selectedItem.data.risk_level === 'HIGH'
                        ? 'High density of boundary discrepancies against ISRO Bhuvan satellite layer. Multiple Reserve Forest overlaps require DLC special resolution.'
                        : selectedItem.data.risk_level === 'MODERATE'
                        ? 'Average resolution cycle exceeds 180-day statutory limit. Gram Sabha verification backlog identified.'
                        : 'Clean GIS cadastral overlay match. High Gram Sabha approval rate with low boundary dispute frequency.'}
                    </p>
                  </div>

                  {/* Action Quick Buttons */}
                  <div className="space-y-2 pt-1">
                    <button 
                      onClick={() => jumpToHotspot(selectedItem.data.latitude || 22.0, selectedItem.data.longitude || 82.0, 9)}
                      className="w-full py-2 bg-gradient-to-r from-[#06b6d4] to-[#10b981] text-[#070c18] font-extrabold text-xs rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" /> Focus Camera On District
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-300 text-sm">{selectedItem.data.claim_id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        selectedItem.data.color === '#f43f5e'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : selectedItem.data.color === '#f59e0b'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {selectedItem.data.color === '#f43f5e' ? '🔴 RED ZONE' : selectedItem.data.color === '#f59e0b' ? '🟡 YELLOW ZONE' : '🟢 GREEN ZONE'}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-lg mt-1">{selectedItem.data.applicant_name}</h4>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{selectedItem.data.village}, {selectedItem.data.district} ({selectedItem.data.state})</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold">
                    <div className="bg-[#091122] p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[8px] uppercase">Claimed Area</span>
                      <span className="text-white text-sm">{selectedItem.data.claimed_area || '4.2'} Acres</span>
                    </div>
                    <div className="bg-[#091122] p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[8px] uppercase">Record Area</span>
                      <span className="text-amber-400 text-sm">{selectedItem.data.record_area || '2.8'} Acres</span>
                    </div>
                  </div>

                  <div className="bg-[#091122] p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block flex items-center gap-1">
                      <FileWarning className="w-3.5 h-3.5 text-rose-400" /> Spatial Audit Note:
                    </span>
                    <p className="text-slate-200 text-[11px] leading-relaxed font-medium">{selectedItem.data.note}</p>
                  </div>

                  <button 
                    onClick={() => {
                      const centerPos = selectedItem.data.center || (selectedItem.data.coordinates ? selectedItem.data.coordinates[0] : null);
                      if (centerPos) jumpToHotspot(centerPos[0], centerPos[1], 12);
                    }}
                    className="w-full py-2 bg-[#06b6d4] text-[#070c18] font-extrabold text-xs rounded-xl hover:bg-cyan-400 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Crosshair className="w-4 h-4" /> Zoom to Parcel Boundary
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="forest-card p-5 border border-slate-700/80 space-y-4 bg-gradient-to-b from-[#0f172a] to-[#070e1e]">
              <h3 className="font-display text-lg text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-700 pb-2">
                <ShieldAlert className="w-5 h-5 text-[#06b6d4]" />
                Spatial Status Zone Index
              </h3>

              <div className="space-y-3 text-xs">
                {/* Red Zone Explanation */}
                <div 
                  onClick={() => jumpToZone('RED')}
                  className="p-3.5 bg-gradient-to-br from-rose-950/30 to-[#091122] rounded-xl border border-rose-500/40 space-y-1.5 cursor-pointer hover:border-rose-400 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-pulse" />
                      <span className="font-extrabold text-rose-400 tracking-wider">🔴 RED ZONE</span>
                    </div>
                    <span className="text-[9px] font-mono text-rose-300 font-bold">7 DISTRICTS</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Critical spatial anomalies, reserve forest overlaps &gt;1.5 acres, and high discrepancy flags.
                  </p>
                  <span className="text-[9px] text-rose-300/80 font-bold block pt-1 group-hover:text-rose-200">
                    Bastar, Kanker, Dindori, Gadchiroli, Ranchi, West Singhbhum, Kandhamal
                  </span>
                </div>

                {/* Yellow Zone Explanation */}
                <div 
                  onClick={() => jumpToZone('YELLOW')}
                  className="p-3.5 bg-gradient-to-br from-amber-950/30 to-[#091122] rounded-xl border border-amber-500/40 space-y-1.5 cursor-pointer hover:border-amber-400 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b] animate-pulse" />
                      <span className="font-extrabold text-amber-400 tracking-wider">🟡 YELLOW ZONE</span>
                    </div>
                    <span className="text-[9px] font-mono text-amber-300 font-bold">9 DISTRICTS</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    SLA delay exceeding 180 days, missing Gram Sabha seal, or pending SDLC/DLC review.
                  </p>
                  <span className="text-[9px] text-amber-300/80 font-bold block pt-1 group-hover:text-amber-200">
                    Mayurbhanj, Mandla, Rayagada, Surguja, Rajnandgaon, Gumla, Palghar
                  </span>
                </div>

                {/* Green Zone Explanation */}
                <div 
                  onClick={() => jumpToZone('GREEN')}
                  className="p-3.5 bg-gradient-to-br from-emerald-950/30 to-[#091122] rounded-xl border border-emerald-500/40 space-y-1.5 cursor-pointer hover:border-emerald-400 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                      <span className="font-extrabold text-emerald-400 tracking-wider">🟢 GREEN ZONE</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-300 font-bold">9 DISTRICTS</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Title deeds cleared, GPS boundary verified against satellite cadastral registry.
                  </p>
                  <span className="text-[9px] text-emerald-300/80 font-bold block pt-1 group-hover:text-emerald-200">
                    Sundargarh, Koraput, Balaghat, Dhar, Dhamtari, Nandurbar, Simdega
                  </span>
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
