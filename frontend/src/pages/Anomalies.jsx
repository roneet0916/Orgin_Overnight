import React, { useEffect, useState } from 'react';
import { getAnomalies, getClaimDetails, analyzeClaim } from '../services/api';
import Loading from '../components/Loading';
import ClaimDetails from '../components/ClaimDetails';
import { AlertTriangle, ShieldAlert, Filter, ArrowUpRight, CheckCircle, Search, RefreshCw, Sparkles } from 'lucide-react';

const Anomalies = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchAnomalies();
  }, [severityFilter]);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const params = severityFilter !== 'All' ? { severity: severityFilter } : {};
      const data = await getAnomalies(params);
      setAnomalies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching anomalies:', err);
      setAnomalies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClaim = async (claimId) => {
    try {
      const data = await getClaimDetails(claimId);
      setSelectedClaim(data);
    } catch (err) {
      console.error('Error opening claim:', err);
    }
  };

  const handleReanalyze = async (claimId) => {
    try {
      setIsAnalyzing(true);
      const res = await analyzeClaim(claimId);
      if (res.updated_claim) {
        setSelectedClaim(res.updated_claim);
      }
      fetchAnomalies();
    } catch (err) {
      console.error('Error re-analyzing claim:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) return <Loading message="Running Spatial & Compliance Rule Engine AI Anomaly Audit..." />;

  const highRiskCount = anomalies.filter(a => a.severity === 'HIGH').length;
  const mediumRiskCount = anomalies.filter(a => a.severity === 'MEDIUM').length;
  const lowRiskCount = anomalies.filter(a => a.severity === 'LOW').length;

  const filteredAnomalies = anomalies.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.claim_id && a.claim_id.toLowerCase().includes(q)) ||
      (a.applicant_name && a.applicant_name.toLowerCase().includes(q)) ||
      (a.district && a.district.toLowerCase().includes(q)) ||
      (a.state && a.state.toLowerCase().includes(q)) ||
      (a.village && a.village.toLowerCase().includes(q)) ||
      ((a.anomaly_type || a.type) && (a.anomaly_type || a.type).toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-16 animate-reveal">
      {/* Header */}
      <div className="forest-card p-8 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-white uppercase tracking-wide leading-none flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-[#06b6d4]" />
            AI Anomaly Detection Center
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-[0.2em] uppercase mt-2">
            Automated Audit of Land Record Mismatches, Spatial Overlaps & Statutory Delays
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search claim ID, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 rounded-full pl-10 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#06b6d4] transition-all w-52"
            />
          </div>

          {/* Severity Tabs */}
          <div className="flex items-center gap-1 bg-[#0f172a] border border-slate-700 p-1.5 rounded-full text-xs font-bold uppercase tracking-[0.15em]">
            <span className="text-slate-400 px-2 flex items-center gap-1 text-[10px]">
              <Filter className="w-3.5 h-3.5 text-[#06b6d4]" /> Risk:
            </span>
            {['All', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-full text-[10px] transition-all ${
                  severityFilter === sev
                    ? 'bg-[#06b6d4] text-[#070c18] border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnomalies}
            className="p-2 rounded-full bg-[#0f172a] border border-slate-700 text-slate-400 hover:text-white hover:border-[#06b6d4] transition-all"
            title="Re-run AI Audit Scan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Risk Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="forest-card p-6 border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.25em] block">High Severity Risks</span>
            <span className="font-display text-4xl text-white mt-1 block">{highRiskCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="forest-card p-6 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.25em] block">Medium Severity Risks</span>
            <span className="font-display text-4xl text-white mt-1 block">{mediumRiskCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="forest-card p-6 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.25em] block">Low Severity Flags</span>
            <span className="font-display text-4xl text-white mt-1 block">{lowRiskCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Anomalies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnomalies.map((anom) => {
          const typeName = anom.anomaly_type || anom.type || 'LAND_RECORD_MISMATCH';
          const reasonText = anom.reason || anom.anomaly_description || anom.description || 'Discrepancy detected by rule-engine.';
          const riskScore = anom.risk_score || (anom.severity === 'HIGH' ? 92 : anom.severity === 'MEDIUM' ? 64 : 38);
          const isHigh = anom.severity === 'HIGH';
          const isMedium = anom.severity === 'MEDIUM';

          return (
            <div
              key={anom.id || anom.claim_id}
              className={`forest-card p-6 shadow-2xl flex flex-col justify-between space-y-4 border ${
                isHigh ? 'border-rose-500/40' : isMedium ? 'border-amber-500/40' : 'border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#06b6d4] text-xs bg-[#06b6d4]/10 px-2.5 py-1 rounded-lg border border-[#06b6d4]/30">
                    {anom.claim_id}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] border ${
                    isHigh ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : isMedium ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}>
                    {anom.severity} RISK ({riskScore}/100)
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-xl text-white uppercase tracking-wide flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${isHigh ? 'text-rose-400' : 'text-amber-400'}`} />
                    {typeName.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mt-1">
                    📍 {anom.district}, {anom.state} ({anom.village})
                  </p>
                </div>

                <p className="text-xs text-slate-200 bg-[#0f172a] p-3.5 rounded-xl border border-slate-800 leading-relaxed font-sans">
                  "{reasonText}"
                </p>

                {anom.ai_recommendation && (
                  <div className="bg-[#06b6d4]/10 p-3 rounded-xl border border-[#06b6d4]/30 text-[11px] text-cyan-200 space-y-1">
                    <span className="font-bold text-[#06b6d4] text-[9px] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Recommendation
                    </span>
                    <p className="leading-snug">{anom.ai_recommendation}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider pt-1">
                  <div className="bg-[#0f172a] p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[8px]">Applicant</span>
                    <span className="font-semibold text-white truncate block">{anom.applicant_name}</span>
                  </div>
                  <div className="bg-[#0f172a] p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[8px]">Days Pending</span>
                    <span className="font-mono text-cyan-300 text-xs">{anom.days_pending} days</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Filing: {anom.filing_date || '2023-11-12'}
                </span>

                <button
                  onClick={() => handleOpenClaim(anom.claim_id)}
                  className="px-4 py-1.5 rounded-full bg-[#06b6d4] hover:bg-cyan-400 text-[#070c18] text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                >
                  <span>Inspect</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <ClaimDetails
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onReanalyze={handleReanalyze}
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  );
};

export default Anomalies;
