import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MapPin, FileText, AlertTriangle, Download, TreePine, Sparkles } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/map', label: 'GIS Spatial Map', icon: MapPin },
    { path: '/claims', label: 'FRA Claims Registry', icon: FileText },
    { path: '/anomalies', label: 'AI Anomaly Center', icon: AlertTriangle },
    { path: '/reports', label: 'Reports & Export', icon: Download },
  ];

  return (
    <aside className="w-64 bg-[#021a11]/95 border-r border-[#134934] flex flex-col justify-between shrink-0 min-h-[calc(100vh-80px)] p-4 backdrop-blur-xl">
      <div className="space-y-2">
        <div className="px-4 py-2 text-[10px] font-bold text-[#52b788] uppercase tracking-[0.3em] flex items-center justify-between">
          <span>MONITORING HUB</span>
          <span className="w-2 h-2 rounded-full bg-[#52b788] animate-ping" />
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-[1.5rem] text-xs font-bold uppercase tracking-[0.2em] transition-all group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-[#01472e] to-[#046c46] text-[#fefae0] border border-[#52b788]/60 shadow-[0_0_20px_rgba(82,183,136,0.3)]'
                    : 'text-[#a3b18a] hover:text-[#fefae0] hover:bg-[#063020]/70 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#52b788] shadow-[0_0_10px_#52b788]" />}
                  <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-[#52b788]' : 'text-[#a3b18a]'
                  }`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Cyber Info Card */}
      <div className="p-5 rounded-[2rem] bg-gradient-to-br from-[#063020] to-[#022317] border border-[#52b788]/30 shadow-[0_0_25px_rgba(1,71,46,0.5)] space-y-3 relative overflow-hidden group">
        <div className="absolute inset-0 bg-shimmer opacity-30 pointer-events-none" />
        <div className="flex items-center gap-2 text-[#fefae0] font-bold text-xs uppercase tracking-[0.2em]">
          <TreePine className="w-4 h-4 text-[#52b788]" />
          <span>Forest Intelligence</span>
        </div>
        <p className="text-[10px] text-[#a3b18a] leading-relaxed uppercase tracking-wider">
          Autonomous Forest Rights Act Spatial Monitoring Engine
        </p>
        <div className="pt-2.5 border-t border-[#134934] flex items-center justify-between text-[10px] font-mono text-[#52b788]">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#52b788]" /> FASTAPI + SQLITE
          </span>
          <span className="font-bold px-2 py-0.5 rounded bg-[#01472e] border border-[#52b788]/40">v1.0 LIVE</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
