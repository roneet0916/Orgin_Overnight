import React, { useState, useEffect } from 'react';
import { Activity, UserCheck, Sparkles, ShieldCheck, Radio, Trees } from 'lucide-react';

const Navbar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[#0b1329]/90 backdrop-blur-xl border-b border-[#1e293b] sticky top-0 z-40 shadow-2xl">
      {/* Live Simulation Banner */}
      <div className="bg-gradient-to-r from-[#06b6d4]/20 via-[#10b981]/20 to-[#06b6d4]/20 border-b border-[#06b6d4]/30 px-4 py-1 text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase text-center flex items-center justify-center gap-3 relative overflow-hidden">
        <Radio className="w-3.5 h-3.5 text-[#06b6d4] animate-pulse" />
        <span className="flex items-center gap-2">
          <span>AI DECISION SUPPORT ENGINE ACTIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block animate-ping" />
          <span className="text-slate-400 font-normal">• PS-7 Hackathon Live Spatial Audit</span>
        </span>
      </div>

      <div className="px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#06b6d4] to-[#10b981] p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center">
            <div className="w-full h-full bg-[#0f172a] rounded-[0.9rem] flex items-center justify-center text-cyan-400">
              <Trees className="w-6 h-6 text-[#06b6d4]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl text-white font-extrabold uppercase tracking-wide leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-[#06b6d4]">
                FRA Spatial Decision System
              </h1>
              <span className="bg-[#06b6d4]/15 text-[#38bdf8] border border-[#06b6d4]/40 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-[0.2em] shadow-[0_0_12px_rgba(6,182,212,0.25)] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#06b6d4]" /> PS-7 AI Core v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-[0.15em] uppercase mt-0.5">
              Forest Rights Act Spatial Intelligence • Discrepancy Audits • Satellite GeoJSON Layer
            </p>
          </div>
        </div>

        {/* Right Live Indicators */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0f172a] border border-[#10b981]/40 text-[10px] font-bold tracking-[0.2em] uppercase text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Audit Engine: Online</span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0f172a] border border-[#1e293b] text-[10px] font-mono text-cyan-200">
            <Activity className="w-3.5 h-3.5 text-[#06b6d4] animate-pulse" />
            <span>{time.toLocaleTimeString()}</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#10b981] text-[10px] font-bold tracking-[0.2em] uppercase text-[#070c18] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <UserCheck className="w-3.5 h-3.5 text-[#070c18]" />
            <span>District Officer Mode</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
