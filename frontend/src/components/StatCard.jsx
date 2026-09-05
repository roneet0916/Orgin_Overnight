import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'emerald', subtitle }) => {
  const isDanger = title?.toLowerCase().includes('anomaly') || title?.toLowerCase().includes('delayed') || title?.toLowerCase().includes('reject');

  return (
    <div className={`forest-card p-6 relative overflow-hidden group transition-all duration-300 ${
      isDanger ? 'forest-card-risk' : 'forest-card-glow'
    }`}>
      {/* Top Shimmer Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#52b788]/60 to-transparent group-hover:via-[#52b788] transition-all" />

      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-[#a3b18a] uppercase tracking-[0.25em]">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-[1.25rem] border transition-transform duration-300 group-hover:scale-110 shadow-lg ${
            isDanger 
              ? 'bg-[#e76f51]/20 border-[#e76f51]/40 text-[#e76f51] shadow-[0_0_15px_rgba(231,111,81,0.3)]' 
              : 'bg-[#01472e] border-[#52b788]/40 text-[#52b788] shadow-[0_0_15px_rgba(82,183,136,0.25)]'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <h3 className={`font-display text-4xl tracking-normal transition-all ${
          isDanger ? 'text-[#e76f51]' : 'text-[#fefae0]'
        }`}>
          {value}
        </h3>
      </div>

      {subtitle && (
        <p className="text-[10px] text-[#a3b18a] mt-2 font-medium tracking-wider uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#52b788] inline-block" />
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
