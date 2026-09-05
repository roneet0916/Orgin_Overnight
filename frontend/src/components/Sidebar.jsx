import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MapPin, FileText, AlertTriangle, Download, Sparkles, ShieldAlert } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/map', label: 'GIS Spatial Map', icon: MapPin },
    { path: '/claims', label: 'FRA Registry', icon: FileText },
    { path: '/anomalies', label: 'AI Anomaly Center', icon: AlertTriangle },
    { path: '/reports', label: 'Reports & Export', icon: Download },
  ];

  return (
    <aside className="w-64 bg-[#0f172a]/95 border-r border-[#1e293b] flex flex-col justify-between shrink-0 min-h-[calc(100vh-70px)] p-4 backdrop-blur-xl">
      <div className="space-y-2">
        <div className="px-4 py-2 text-[10px] font-bold text-[#06b6d4] uppercase tracking-[0.3em] flex items-center justify-between">
          <span>NAVIGATION HUB</span>
          <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-ping" />
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-[0.18em] transition-all group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-[#06b6d4]/20 to-[#10b981]/20 text-white border border-[#06b6d4]/50 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#06b6d4] shadow-[0_0_10px_#06b6d4]" />}
                  <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-[#06b6d4]' : 'text-slate-400'
                  }`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Cyber Info Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-[#06b6d4]/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] space-y-3 relative overflow-hidden group">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-[0.2em]">
          <ShieldAlert className="w-4 h-4 text-[#06b6d4]" />
          <span>PS-7 Spatial System</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-wider">
          AI Decision Support for Forest Rights Act Monitoring & Land Audits
        </p>
        <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[10px] font-mono text-[#06b6d4]">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#10b981]" /> LEAFLET + FASTAPI
          </span>
          <span className="font-bold px-2 py-0.5 rounded bg-[#06b6d4]/20 border border-[#06b6d4]/40 text-[#38bdf8]">v2.4</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
