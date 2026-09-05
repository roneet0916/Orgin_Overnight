import React, { useEffect, useState } from 'react';
import { getDashboardStats, getStateStats, getClaimDetails, analyzeClaim } from '../services/api';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import ClaimDetails from '../components/ClaimDetails';
import { FileText, CheckCircle2, Clock, XCircle, AlertTriangle, ShieldAlert, BarChart3, TrendingUp, Sparkles, Layers, Activity } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';

const CHART_COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [stateStats, setStateStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sData, stData] = await Promise.all([
        getDashboardStats(),
        getStateStats()
      ]);
      setStats(sData);
      setStateStats(stData);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClaim = async (claimId) => {
    try {
      const data = await getClaimDetails(claimId);
      setSelectedClaim(data);
    } catch (err) {
      console.error('Error fetching claim:', err);
    }
  };

  const handleReanalyze = async (claimId) => {
    try {
      setIsAnalyzing(true);
      const res = await analyzeClaim(claimId);
      if (res.updated_claim) {
        setSelectedClaim(res.updated_claim);
      }
      fetchData();
    } catch (err) {
      console.error('Error analyzing claim:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) return <Loading message="Computing Real-Time Spatial Metrics & AI Decision Analytics..." />;

  const statusPieData = [
    { name: 'Approved', value: stats?.approved || 0 },
    { name: 'Pending', value: stats?.pending || 0 },
    { name: 'Rejected', value: stats?.rejected || 0 }
  ];

  return (
    <div className="space-y-8 pb-16 animate-reveal">
      {/* Hero Executive Banner */}
      <div className="forest-card p-8 md:p-10 border border-[#06b6d4]/40 flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden group shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#06b6d4]/20 border border-[#06b6d4]/40 text-[10px] font-bold text-[#38bdf8] uppercase tracking-[0.3em] flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-[#06b6d4]" /> AI Decision Support Engine
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-extrabold tracking-tight uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-[#06b6d4]">
            FRA Executive Decision Center
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-[0.15em] uppercase">
            Forest Rights Act Monitoring • Land Discrepancy Audits • Spatial GeoJSON Intelligence
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="px-4 py-2.5 rounded-full bg-[#0f172a] border border-[#10b981]/50 text-xs font-bold tracking-[0.2em] uppercase text-[#10b981] flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <Activity className="w-4 h-4 text-[#10b981] animate-pulse" />
            <span>Spatial Engine Active</span>
          </div>
        </div>
      </div>

      {/* Top 6 Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Claims"
          value={stats?.total_claims?.toLocaleString()}
          icon={FileText}
          subtitle="Registered in system"
        />
        <StatCard
          title="Approved"
          value={stats?.approved?.toLocaleString()}
          icon={CheckCircle2}
          subtitle={`${((stats?.approved / stats?.total_claims) * 100).toFixed(1)}% clearance rate`}
        />
        <StatCard
          title="Pending"
          value={stats?.pending?.toLocaleString()}
          icon={Clock}
          subtitle="Under district review"
        />
        <StatCard
          title="Rejected"
          value={stats?.rejected?.toLocaleString()}
          icon={XCircle}
          subtitle="Non-compliant filings"
        />
        <StatCard
          title="Delayed >180d"
          value={stats?.delayed?.toLocaleString()}
          icon={AlertTriangle}
          subtitle="Exceeds statutory SLA"
        />
        <StatCard
          title="AI Anomalies"
          value={stats?.anomalies?.toLocaleString()}
          icon={ShieldAlert}
          subtitle="Flagged by Spatial AI"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Claims Breakdown by State */}
        <div className="forest-card p-7 shadow-2xl relative overflow-hidden border border-slate-700/80">
          <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
            <div>
              <h3 className="font-display text-2xl text-white uppercase tracking-wide flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#06b6d4]" />
                State-Wise Claim Clearance
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">
                Approved vs Pending vs Rejected comparison across major states
              </p>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="state" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#06b6d4',
                    borderRadius: '1rem',
                    color: '#f8fafc',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="rejected" name="Rejected" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Distribution Pie */}
        <div className="forest-card p-7 shadow-2xl relative overflow-hidden border border-slate-700/80">
          <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
            <div>
              <h3 className="font-display text-2xl text-white uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#10b981]" />
                National Clearance Share
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">
                Proportion of claims approved, pending, and rejected
              </p>
            </div>
          </div>

          <div className="h-[320px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={110}
                  paddingAngle={6}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="#070c18" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#10b981',
                    borderRadius: '1rem',
                    color: '#f8fafc'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* State Progress Summary Table */}
      <div className="forest-card p-7 border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
          <div>
            <h3 className="font-display text-2xl text-white uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#06b6d4]" />
              State Executive Progress Summary
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">
              Detailed break-up of claims, delays, and land acreage mapped by state
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Total Claims</th>
                <th className="py-3 px-4">Approved</th>
                <th className="py-3 px-4">Pending</th>
                <th className="py-3 px-4">Delayed (&gt;180d)</th>
                <th className="py-3 px-4">Anomalies</th>
                <th className="py-3 px-4">Land Mapped (Acres)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {stateStats.map((row) => (
                <tr key={row.state} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{row.state}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{row.total?.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">{row.approved?.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-amber-400">{row.pending?.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-rose-400">{row.delayed?.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-[#06b6d4] font-bold">{row.anomalies?.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{(row.acreage || row.total * 3.4).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Details Modal */}
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

export default Dashboard;
