import React from 'react';

const StatCard = ({ title, value, icon: Icon, subtitle }) => {
  const isDanger = title?.toLowerCase().includes('anomaly') || title?.toLowerCase().includes('delayed') || title?.toLowerCase().includes('reject');

  return (
    <div className={`forest-card p-5 relative overflow-hidden group transition-all duration-300 ${
      isDanger ? 'border border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]' : 'border border-slate-700/80 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
    }`}>
      {/* Top Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${
        isDanger ? 'bg-gradient-to-r from-transparent via-rose-500 to-transparent' : 'bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent'
      }`} />

      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl border transition-transform duration-300 group-hover:scale-110 ${
            isDanger 
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' 
              : 'bg-[#06b6d4]/20 border-[#06b6d4]/40 text-[#06b6d4]'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <h3 className={`font-display text-3xl font-extrabold tracking-tight ${
          isDanger ? 'text-rose-400' : 'text-white'
        }`}>
          {value || 0}
        </h3>
      </div>

      {subtitle && (
        <p className="text-[10px] text-slate-400 mt-2 font-medium tracking-wider uppercase flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${isDanger ? 'bg-rose-400' : 'bg-[#10b981]'}`} />
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
