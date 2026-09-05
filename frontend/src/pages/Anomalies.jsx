import React, { useEffect, useState } from 'react';
import { getAnomalies, getClaimDetails, analyzeClaim } from '../services/api';
import Loading from '../components/Loading';
import ClaimDetails from '../components/ClaimDetails';
import { AlertTriangle, ShieldAlert, Filter, ArrowUpRight, CheckCircle } from 'lucide-react';

const Anomalies = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All');
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
      setAnomalies(data);
    } catch (err) {
      console.error('Error fetching anomalies:', err);
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

  if (loading) return <Loading message="Executing Rule-Based & Statistical AI Anomaly Audit..." />;

  const highRiskCount = anomalies.filter(a => a.severity === 'HIGH').length;
  const mediumRiskCount = anomalies.filter(a => a.severity === 'MEDIUM').length;
  const lowRiskCount = anomalies.filter(a => a.severity === 'LOW').length;

  return (
    <div className="space-y-6 pb-16 animate-reveal">
      {/* Title */}
      <div className="forest-card p-8 border border-[#a3b18a]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-[#fefae0] uppercase tracking-wide leading-none flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-[#ccd5ae]" />
            AI Anomaly Detection Center
          </h1>
          <p className="text-xs text-[#a3b18a] font-medium tracking-[0.2em] uppercase mt-2">
            Automated Audit of Land Record Mismatches, Processing Delays, and Missing Data
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-2 bg-[#022317] border border-[#134934] p-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em]">
          <span className="text-[#a3b18a] px-3 flex items-center gap-1.5 text-[10px]">
            <Filter className="w-3 h-3 text-[#ccd5ae]" /> Severity:
          </span>
          {['All', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3.5 py-1.5 rounded-full text-[10px] transition-all ${
                severityFilter === sev
                  ? 'bg-[#01472e] text-[#fefae0] border border-[#a3b18a]/40 shadow-forest-lg'
                  : 'text-[#a3b18a] hover:text-[#fefae0]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="forest-card p-6 border border-[#a3b18a]/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#e76f51] uppercase tracking-[0.25em] block">High Severity Risks</span>
            <span className="font-display text-4xl text-[#fefae0]">{highRiskCount}</span>
          </div>
          <div className="p-3.5 rounded-[1.25rem] bg-[#01472e] text-[#e76f51] border border-[#134934]">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="forest-card p-6 border border-[#a3b18a]/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#e9edc9] uppercase tracking-[0.25em] block">Medium Severity Risks</span>
            <span className="font-display text-4xl text-[#fefae0]">{mediumRiskCount}</span>
          </div>
          <div className="p-3.5 rounded-[1.25rem] bg-[#01472e] text-[#e9edc9] border border-[#134934]">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="forest-card p-6 border border-[#a3b18a]/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#ccd5ae] uppercase tracking-[0.25em] block">Low Severity Flags</span>
            <span className="font-display text-4xl text-[#fefae0]">{lowRiskCount}</span>
          </div>
          <div className="p-3.5 rounded-[1.25rem] bg-[#01472e] text-[#ccd5ae] border border-[#134934]">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Anomaly Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {anomalies.map((anom) => (
          <div
            key={anom.id}
            className="forest-card p-6 shadow-forest-lg flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#ccd5ae] text-xs">
                  {anom.claim_id}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-[#01472e] text-[#fefae0] border border-[#a3b18a]/40 shadow-forest-lg">
                  {anom.severity} RISK ({anom.risk_score})
                </span>
              </div>

              <div>
                <h3 className="font-display text-2xl text-[#fefae0] uppercase tracking-wide flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#ccd5ae] shrink-0" />
                  {anom.anomaly_type}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a3b18a] mt-1">
                  📍 {anom.district}, {anom.state} ({anom.village})
                </p>
              </div>

              <p className="text-xs text-[#fefae0] bg-[#022317] p-4 rounded-[1.5rem] border border-[#134934] leading-relaxed">
                "{anom.reason}"
              </p>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider pt-1">
                <div className="bg-[#022317] p-3 rounded-[1rem] border border-[#134934]">
                  <span className="text-[#a3b18a] block text-[8px]">Applicant</span>
                  <span className="font-semibold text-[#fefae0] truncate block">{anom.applicant_name}</span>
                </div>
                <div className="bg-[#022317] p-3 rounded-[1rem] border border-[#134934]">
                  <span className="text-[#a3b18a] block text-[8px]">Days Pending</span>
                  <span className="font-mono text-[#ccd5ae] text-xs">{anom.days_pending} days</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#134934] flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a3b18a]">
                Logged: {anom.detected_at ? new Date(anom.detected_at).toLocaleDateString() : 'Today'}
              </span>

              <button
                onClick={() => handleOpenClaim(anom.claim_id)}
                className="px-4 py-1.5 rounded-full bg-[#01472e] hover:bg-[#a3b18a] hover:text-[#01472e] text-[#fefae0] text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 transition-all shadow-forest-lg border border-[#a3b18a]/30"
              >
                <span>Inspect</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
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
