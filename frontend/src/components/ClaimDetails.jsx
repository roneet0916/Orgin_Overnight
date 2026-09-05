import React from 'react';
import { X, AlertTriangle, ShieldCheck, RefreshCw, Calendar, MapPin, User, FileText } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const ClaimDetails = ({ claim, onClose, onReanalyze, isAnalyzing }) => {
  if (!claim) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-reveal">
      <div className="bg-[#063020] border border-[#a3b18a]/30 rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-forest-2xl">
        {/* Header */}
        <div className="px-8 py-5 border-b border-[#134934] flex items-center justify-between sticky top-0 bg-[#063020] z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-[1.25rem] bg-[#01472e] text-[#ccd5ae] border border-[#a3b18a]/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-[#fefae0] uppercase tracking-wide flex items-center gap-2.5 leading-none">
                {claim.claim_id}
                <span className="px-3 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-[0.2em] bg-[#01472e] text-[#ccd5ae] border border-[#a3b18a]/40">
                  {claim.status}
                </span>
              </h2>
              <p className="text-[10px] text-[#a3b18a] uppercase tracking-[0.2em] mt-1">Forest Rights Claim Inspection</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#a3b18a] hover:text-[#fefae0] hover:bg-[#01472e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-6">
          {/* AI Decision & Risk Box */}
          <div className="p-6 rounded-[2rem] bg-[#022317] border border-[#a3b18a]/30 shadow-forest-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ccd5ae] flex items-center gap-2">
                {claim.has_anomaly ? <AlertTriangle className="w-4 h-4 text-[#e9edc9]" /> : <ShieldCheck className="w-4 h-4 text-[#a3b18a]" />}
                AI Decision Support Evaluation
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-[#01472e] text-[#fefae0] border border-[#a3b18a]/40">
                Risk: {claim.risk_score} / 100 ({claim.risk_level})
              </span>
            </div>
            
            <p className="text-xs text-[#fefae0] leading-relaxed font-medium">
              {claim.ai_explanation}
            </p>

            {claim.anomalies && claim.anomalies.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#134934] space-y-2">
                <span className="text-[10px] font-bold text-[#a3b18a] uppercase tracking-[0.2em]">Detected Anomaly Flags:</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {claim.anomalies.map((a, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-[#01472e] text-[#ccd5ae] border border-[#a3b18a]/40 text-[10px] font-mono font-bold">
                      ⚠️ {a.anomaly_type} ({a.severity})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#022317] border border-[#134934] rounded-[1.5rem]">
              <span className="text-[10px] font-bold text-[#a3b18a] uppercase tracking-[0.2em] flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-[#ccd5ae]" /> Applicant
              </span>
              <p className="text-sm font-bold text-[#fefae0]">{claim.applicant_name}</p>
            </div>

            <div className="p-4 bg-[#022317] border border-[#134934] rounded-[1.5rem]">
              <span className="text-[10px] font-bold text-[#a3b18a] uppercase tracking-[0.2em] flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#ccd5ae]" /> Location
              </span>
              <p className="text-sm font-bold text-[#fefae0]">{claim.village}, {claim.district}</p>
              <p className="text-[10px] text-[#a3b18a] uppercase tracking-wider">{claim.state}</p>
            </div>

            <div className="p-4 bg-[#022317] border border-[#134934] rounded-[1.5rem]">
              <span className="text-[10px] font-bold text-[#a3b18a] uppercase tracking-[0.2em] mb-1 block">Claimed Land Area</span>
              <p className="font-display text-2xl text-[#e9edc9]">{claim.claimed_area} HECTARES</p>
            </div>

            <div className="p-4 bg-[#022317] border border-[#134934] rounded-[1.5rem]">
              <span className="text-[10px] font-bold text-[#a3b18a] uppercase tracking-[0.2em] mb-1 block">Recorded Land Area</span>
              <p className="font-display text-2xl text-[#ccd5ae]">{claim.recorded_area} HECTARES</p>
            </div>

            <div className="p-4 bg-[#022317] border border-[#134934] rounded-[1.5rem]">
              <span className="text-[10px] font-bold text-[#a3b18a] uppercase tracking-[0.2em] flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#ccd5ae]" /> Submission
              </span>
              <p className="text-sm font-bold text-[#fefae0]">{formatDate(claim.submission_date)}</p>
            </div>

            <div className="p-4 bg-[#022317] border border-[#134934] rounded-[1.5rem]">
              <span className="text-[10px] font-bold text-[#a3b18a] uppercase tracking-[0.2em] mb-1 block">Days Pending</span>
              <p className="font-display text-2xl text-[#fefae0]">
                {claim.days_pending} DAYS
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-[#134934] bg-[#022317]/60 flex items-center justify-between">
          <button
            onClick={() => onReanalyze(claim.claim_id)}
            disabled={isAnalyzing}
            className="px-5 py-2.5 rounded-full bg-[#01472e] hover:bg-[#a3b18a] hover:text-[#01472e] text-[#fefae0] text-[10px] font-bold uppercase tracking-[0.25em] flex items-center gap-2 transition-all shadow-forest-lg disabled:opacity-50 border border-[#a3b18a]/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Auditing...' : 'Live AI Audit'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#063020] hover:bg-[#134934] text-[#ccd5ae] text-[10px] font-bold uppercase tracking-[0.25em] transition-all border border-[#134934]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetails;
