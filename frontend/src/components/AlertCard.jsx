import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';

const AlertCard = ({ alert, onSelect }) => {
  return (
    <div
      onClick={() => onSelect && onSelect(alert.claim_id)}
      className="p-4 rounded-[1.5rem] bg-[#022317] border border-[#134934] hover:border-[#a3b18a]/60 hover:bg-[#063020] cursor-pointer transition-all flex items-start justify-between group shadow-forest-lg"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-[1rem] bg-[#01472e] text-[#ccd5ae] border border-[#a3b18a]/30 shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#ccd5ae]">{alert.claim_id}</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] bg-[#01472e] text-[#e9edc9] border border-[#a3b18a]/30">
              {alert.severity} RISK
            </span>
          </div>

          <h4 className="text-xs font-bold text-[#fefae0] uppercase tracking-wide">{alert.anomaly_type}</h4>
          <p className="text-[11px] text-[#a3b18a] line-clamp-2 leading-relaxed">{alert.reason}</p>

          <div className="text-[10px] text-[#ccd5ae]/80 font-bold uppercase tracking-[0.15em] pt-1">
            📍 {alert.district}, {alert.state}
          </div>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-[#a3b18a] group-hover:text-[#fefae0] group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
    </div>
  );
};

export default AlertCard;
