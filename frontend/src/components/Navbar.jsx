import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, UserCheck, Sparkles, ShieldCheck, Radio } from 'lucide-react';

const Navbar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[#021a11]/90 backdrop-blur-xl border-b border-[#134934] sticky top-0 z-40 shadow-2xl">
      {/* Live Cyber Simulation Header Ribbon */}
      <div className="bg-gradient-to-r from-[#01472e] via-[#064e3b] to-[#01472e] border-b border-[#52b788]/20 px-4 py-1.5 text-[10px] text-[#e9edc9] font-bold tracking-[0.25em] uppercase text-center flex items-center justify-center gap-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-shimmer pointer-events-none" />
        <Radio className="w-3.5 h-3.5 text-[#52b788] animate-pulse" />
        <span className="flex items-center gap-2">
          <span>AI DECISION SUPPORT ENGINE ACTIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#52b788] inline-block animate-ping" />
          <span className="text-[#a3b18a] font-normal">• Hackathon Production Demo</span>
        </span>
      </div>

      <div className="px-8 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-[1.25rem] bg-gradient-to-br from-[#01472e] to-[#065f46] border border-[#52b788]/40 shadow-[0_0_20px_rgba(82,183,136,0.3)] flex items-center justify-center text-xl animate-float">
            🌲
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl text-[#fefae0] uppercase tracking-wide leading-none bg-clip-text text-transparent bg-gradient-to-r from-[#fefae0] via-[#e9edc9] to-[#52b788]">
                FRA Decision Support System
              </h1>
              <span className="bg-[#52b788]/15 text-[#52b788] border border-[#52b788]/40 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-[0.2em] shadow-[0_0_12px_rgba(82,183,136,0.25)] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#52b788]" /> PS-7 AI Core v1.0
              </span>
            </div>
            <p className="text-[10px] text-[#a3b18a] font-medium tracking-[0.15em] uppercase mt-0.5">
              Forest Rights Act Spatial Intelligence • Discrepancy Audits • Heatmap Overlays
            </p>
          </div>
        </div>

        {/* Right Live Indicators */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#063020]/90 border border-[#52b788]/30 text-[10px] font-bold tracking-[0.2em] uppercase text-[#52b788] shadow-[0_0_15px_rgba(82,183,136,0.15)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#52b788]" />
            <span>Audit Engine: Online</span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#063020]/90 border border-[#134934] text-[10px] font-mono text-[#fefae0]">
            <Activity className="w-3.5 h-3.5 text-[#52b788] animate-pulse" />
            <span>{time.toLocaleTimeString()}</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#01472e] to-[#046c46] border border-[#52b788]/40 text-[10px] font-bold tracking-[0.2em] uppercase text-[#fefae0] shadow-[0_0_20px_rgba(82,183,136,0.25)]">
            <UserCheck className="w-3.5 h-3.5 text-[#ccd5ae]" />
            <span>District Officer View</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
