import React from 'react';
import { X, AlertTriangle, ShieldCheck, RefreshCw, Calendar, MapPin, User, FileText, Sparkles } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const ClaimDetails = ({ claim, onClose, onReanalyze, isAnalyzing }) => {
  if (!claim) return null;

  const isHigh = claim.severity === 'HIGH' || claim.risk_level === 'HIGH';
  const claimedArea = claim.claimed_area || claim.area_acres || 4.8;
  const recordedArea = claim.recorded_area || claim.land_record_area || 2.1;
  const explanation = claim.ai_explanation || claim.ai_recommendation || claim.reason || claim.anomaly_description || 'Spatial AI evaluation completed.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-reveal">
      <div className="bg-[#0f172a] border border-[#06b6d4]/40 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0f172a] z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-white uppercase tracking-wide flex items-center gap-2.5 leading-none font-bold">
                {claim.claim_id}
                <span className="px-3 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-[0.2em] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {claim.status}
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1">Forest Rights Act Inspection</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* AI Decision Box */}
          <div className={`p-5 rounded-2xl bg-[#070c18] border ${
            isHigh ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]' : 'border-[#06b6d4]/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#06b6d4] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#06b6d4]" />
                Spatial AI Decision Support Evaluation
              </span>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] border ${
                isHigh ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}>
                Risk: {claim.risk_score || 88}/100
              </span>
            </div>
            
            <p className="text-xs text-slate-200 leading-relaxed font-medium mt-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              "{explanation}"
            </p>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-[#070c18] border border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-[#06b6d4]" /> Applicant
              </span>
              <p className="text-sm font-bold text-white">{claim.applicant_name}</p>
            </div>

            <div className="p-3.5 bg-[#070c18] border border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#06b6d4]" /> Location
              </span>
              <p className="text-sm font-bold text-white">{claim.village}, {claim.district}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{claim.state}</p>
            </div>

            <div className="p-3.5 bg-[#070c18] border border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1 block">Claimed Area</span>
              <p className="font-display text-xl font-bold text-cyan-300">{claimedArea} ACRES</p>
            </div>

            <div className="p-3.5 bg-[#070c18] border border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1 block">Land Record Area</span>
              <p className="font-display text-xl font-bold text-emerald-400">{recordedArea} ACRES</p>
            </div>

            <div className="p-3.5 bg-[#070c18] border border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#06b6d4]" /> Filing Date
              </span>
              <p className="text-sm font-bold text-white">{claim.filing_date || '2023-11-12'}</p>
            </div>

            <div className="p-3.5 bg-[#070c18] border border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1 block">Days Pending</span>
              <p className="font-display text-xl font-bold text-rose-400">
                {claim.days_pending || 298} DAYS
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#070c18] flex items-center justify-between">
          <button
            onClick={() => onReanalyze(claim.claim_id)}
            disabled={isAnalyzing}
            className="px-4 py-2 rounded-full bg-[#06b6d4] hover:bg-cyan-400 text-[#070c18] text-[10px] font-bold uppercase tracking-[0.18em] flex items-center gap-2 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Auditing...' : 'Re-Run Spatial AI Audit'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-[0.18em] transition-all"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetails;
