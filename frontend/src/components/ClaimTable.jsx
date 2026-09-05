import React from 'react';
import { AlertTriangle, Eye, ShieldAlert } from 'lucide-react';

const ClaimTable = ({ claims, onSelectClaim, onAnalyzeClaim }) => {
  if (!claims || claims.length === 0) {
    return (
      <div className="p-10 text-center text-[#a3b18a] bg-[#063020] rounded-[2rem] border border-[#134934] uppercase tracking-[0.2em] text-xs font-bold">
        No FRA claims found matching the current search & filter criteria.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-[#a3b18a]/20 text-[#ccd5ae] border-[#a3b18a]/40';
      case 'Pending':
        return 'bg-[#e9edc9]/20 text-[#e9edc9] border-[#e9edc9]/40';
      case 'Rejected':
        return 'bg-[#01472e] text-[#fefae0] border-[#ccd5ae]/30';
      default:
        return 'bg-[#063020] text-[#a3b18a] border-[#134934]';
    }
  };

  return (
    <div className="overflow-x-auto rounded-[2rem] border border-[#134934] bg-[#063020] shadow-forest-lg">
      <table className="w-full text-left text-xs text-[#fefae0]">
        <thead className="bg-[#022317] text-[10px] font-bold text-[#a3b18a] uppercase tracking-[0.25em] border-b border-[#134934]">
          <tr>
            <th className="py-4 px-5">Claim ID</th>
            <th className="py-4 px-5">Applicant</th>
            <th className="py-4 px-5">Location</th>
            <th className="py-4 px-5">Claim Type</th>
            <th className="py-4 px-5 text-right">Claimed Area</th>
            <th className="py-4 px-5 text-right">Recorded Area</th>
            <th className="py-4 px-5">Status</th>
            <th className="py-4 px-5 text-center">Days Pending</th>
            <th className="py-4 px-5 text-center">Risk</th>
            <th className="py-4 px-5 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#134934]">
          {claims.map((claim) => (
            <tr
              key={claim.claim_id}
              className={`hover:bg-[#01472e]/60 transition-colors ${
                claim.claim_id === 'FRA-1025' ? 'bg-[#01472e]/40' : ''
              }`}
            >
              <td className="py-3.5 px-5 font-mono font-bold text-[#ccd5ae]">
                {claim.claim_id}
              </td>
              <td className="py-3.5 px-5 font-semibold text-[#fefae0]">
                {claim.applicant_name}
              </td>
              <td className="py-3.5 px-5 text-[#a3b18a]">
                <div className="text-[#fefae0] font-medium">{claim.district}, {claim.state}</div>
                <div className="text-[10px] uppercase tracking-wider">{claim.village}</div>
              </td>
              <td className="py-3.5 px-5 text-[#ccd5ae] uppercase tracking-wider text-[10px] font-bold">
                {claim.claim_type}
              </td>
              <td className="py-3.5 px-5 text-right font-mono text-[#e9edc9] font-bold">
                {claim.claimed_area} ha
              </td>
              <td className="py-3.5 px-5 text-right font-mono text-[#a3b18a] font-bold">
                {claim.recorded_area} ha
              </td>
              <td className="py-3.5 px-5">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border ${getStatusBadge(claim.status)}`}>
                  {claim.status}
                </span>
              </td>
              <td className="py-3.5 px-5 text-center font-mono font-bold text-[#fefae0]">
                {claim.days_pending} d
              </td>
              <td className="py-3.5 px-5 text-center">
                {claim.has_anomaly ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] bg-[#01472e] text-[#ccd5ae] border border-[#a3b18a]/50 inline-flex items-center gap-1 shadow-forest-lg">
                    <AlertTriangle className="w-3 h-3" />
                    {claim.risk_score}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#a3b18a] font-bold uppercase tracking-[0.15em]">0 (Low)</span>
                )}
              </td>
              <td className="py-3.5 px-5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onSelectClaim(claim.claim_id)}
                    className="px-3 py-1.5 rounded-full bg-[#01472e] text-[#fefae0] hover:bg-[#a3b18a] hover:text-[#01472e] border border-[#a3b18a]/40 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 transition-all shadow-forest-lg"
                    title="View Claim Details"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                  {onAnalyzeClaim && (
                    <button
                      onClick={() => onAnalyzeClaim(claim.claim_id)}
                      className="p-1.5 rounded-full bg-[#022317] text-[#ccd5ae] hover:bg-[#ccd5ae] hover:text-[#01472e] border border-[#134934] transition-all"
                      title="Run AI Anomaly Check"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClaimTable;
