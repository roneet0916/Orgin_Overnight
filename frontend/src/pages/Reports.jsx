import React, { useEffect, useState } from 'react';
import { getClaimsReportUrl, getAnomaliesReportUrl, getStateStats, getDistrictStats } from '../services/api';
import Loading from '../components/Loading';
import { Download, FileSpreadsheet, ShieldAlert, BarChart } from 'lucide-react';

const Reports = () => {
  const [stateStats, setStateStats] = useState([]);
  const [districtStats, setDistrictStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stData, dData] = await Promise.all([
        getStateStats(),
        getDistrictStats()
      ]);
      setStateStats(stData);
      setDistrictStats(dData);
    } catch (err) {
      console.error('Error fetching report summaries:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Generating Forest Intelligence Datasets..." />;

  return (
    <div className="space-y-8 pb-16 animate-reveal">
      {/* Title */}
      <div className="forest-card p-8 border border-[#a3b18a]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-[#fefae0] uppercase tracking-wide leading-none flex items-center gap-3">
            <Download className="w-8 h-8 text-[#ccd5ae]" />
            Reports & CSV Data Export
          </h1>
          <p className="text-xs text-[#a3b18a] font-medium tracking-[0.2em] uppercase mt-2">
            Export Master Claims Filings • Anomaly Audit Logs • State Analytics Matrix
          </p>
        </div>
      </div>

      {/* Export Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Full Claims CSV */}
        <div className="forest-card p-8 shadow-forest-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="p-4 w-fit rounded-[1.25rem] bg-[#01472e] text-[#ccd5ae] border border-[#a3b18a]/30 shadow-forest-lg">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h3 className="font-display text-3xl text-[#fefae0] uppercase tracking-wide">Master Claims Dataset</h3>
            <p className="text-xs text-[#a3b18a] leading-relaxed">
              Export complete database records including applicant details, claimed land area, recorded land area, status, days pending, and risk evaluations.
            </p>
          </div>

          <a
            href={getClaimsReportUrl()}
            download="fra_claims_report.csv"
            className="w-full py-3.5 px-6 rounded-full bg-[#01472e] hover:bg-[#a3b18a] hover:text-[#01472e] text-[#fefae0] text-xs font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all shadow-forest-2xl border border-[#a3b18a]/30"
          >
            <Download className="w-4 h-4" />
            <span>Download Master Claims CSV</span>
          </a>
        </div>

        {/* Card 2: AI Anomalies CSV */}
        <div className="forest-card p-8 shadow-forest-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="p-4 w-fit rounded-[1.25rem] bg-[#01472e] text-[#e9edc9] border border-[#a3b18a]/30 shadow-forest-lg">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="font-display text-3xl text-[#fefae0] uppercase tracking-wide">AI Anomaly Audit Log</h3>
            <p className="text-xs text-[#a3b18a] leading-relaxed">
              Export filtered anomaly audit logs containing flagged claims, land mismatch percentages, delayed claim metrics, and AI explanation notes.
            </p>
          </div>

          <a
            href={getAnomaliesReportUrl()}
            download="fra_anomalies_report.csv"
            className="w-full py-3.5 px-6 rounded-full bg-[#01472e] hover:bg-[#a3b18a] hover:text-[#01472e] text-[#fefae0] text-xs font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all shadow-forest-2xl border border-[#a3b18a]/30"
          >
            <Download className="w-4 h-4" />
            <span>Download Anomaly Audit CSV</span>
          </a>
        </div>
      </div>

      {/* State-wise Administrative Matrix */}
      <div className="forest-card p-8 shadow-forest-2xl space-y-6">
        <h3 className="font-display text-3xl text-[#fefae0] uppercase tracking-wide flex items-center gap-3">
          <BarChart className="w-6 h-6 text-[#ccd5ae]" />
          State-Wise Administrative Matrix
        </h3>

        <div className="overflow-x-auto rounded-[1.5rem] border border-[#134934] bg-[#022317]">
          <table className="w-full text-left text-xs text-[#fefae0]">
            <thead className="bg-[#022317] text-[10px] text-[#a3b18a] uppercase font-bold tracking-[0.25em] border-b border-[#134934]">
              <tr>
                <th className="py-4 px-5">State</th>
                <th className="py-4 px-5 text-right">Total Claims</th>
                <th className="py-4 px-5 text-right text-[#ccd5ae]">Approved</th>
                <th className="py-4 px-5 text-right text-[#e9edc9]">Pending</th>
                <th className="py-4 px-5 text-right text-[#a3b18a]">Rejected</th>
                <th className="py-4 px-5 text-right text-[#a3b18a]">Delayed (&gt;180d)</th>
                <th className="py-4 px-5 text-right text-[#ccd5ae]">Anomalies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#134934]">
              {stateStats.map((row) => (
                <tr key={row.state} className="hover:bg-[#01472e]/60 transition-colors">
                  <td className="py-4 px-5 font-display text-lg text-[#fefae0] uppercase tracking-wider">{row.state}</td>
                  <td className="py-4 px-5 text-right font-mono font-bold text-sm">{row.total}</td>
                  <td className="py-4 px-5 text-right font-mono font-bold text-[#ccd5ae]">{row.approved}</td>
                  <td className="py-4 px-5 text-right font-mono font-bold text-[#e9edc9]">{row.pending}</td>
                  <td className="py-4 px-5 text-right font-mono font-bold text-[#a3b18a]">{row.rejected}</td>
                  <td className="py-4 px-5 text-right font-mono font-bold text-[#a3b18a]">{row.delayed}</td>
                  <td className="py-4 px-5 text-right font-mono font-bold text-[#fefae0] text-sm">{row.anomalies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
