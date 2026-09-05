import React, { useEffect, useState } from 'react';
import { getDashboardStats, getStateStats } from '../services/api';
import StatCard from '../components/StatCard';
import AlertCard from '../components/AlertCard';
import Loading from '../components/Loading';
import ClaimDetails from '../components/ClaimDetails';
import { getClaimDetails, analyzeClaim } from '../services/api';
import { FileText, CheckCircle2, Clock, XCircle, AlertTriangle, ShieldAlert, BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';

// Cyber Forest Vivid Chart Color Palette
const FOREST_COLORS = ['#52b788', '#e9c46a', '#e76f51', '#2a9d8f'];

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

  if (loading) return <Loading message="Loading Forest Rights Act Monitoring Intelligence..." />;

  const statusPieData = [
    { name: 'Approved', value: stats?.approved || 0 },
    { name: 'Pending', value: stats?.pending || 0 },
    { name: 'Rejected', value: stats?.rejected || 0 }
  ];

  return (
    <div className="space-y-8 pb-16 animate-reveal">
      {/* Hero Title Section */}
      <div className="forest-card p-8 md:p-10 border border-[#52b788]/30 flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-shimmer opacity-20 pointer-events-none" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#01472e] border border-[#52b788]/40 text-[10px] font-bold text-[#52b788] uppercase tracking-[0.3em] flex items-center gap-1.5 shadow-[0_0_15px_rgba(82,183,136,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-[#52b788]" /> Decision Support Engine
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-[#fefae0] tracking-normal uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-[#fefae0] via-[#e9edc9] to-[#52b788]">
            FRA Executive Dashboard
          </h1>
          <p className="text-xs text-[#a3b18a] font-medium tracking-[0.15em] uppercase">
            Forest Rights Act Monitoring • Land Discrepancy Audits • Spatial Insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#01472e] to-[#046c46] border border-[#52b788]/40 text-xs font-bold tracking-[0.2em] uppercase text-[#e9edc9] flex items-center gap-2 shadow-[0_0_20px_rgba(82,183,136,0.25)]">
            <AlertTriangle className="w-4 h-4 text-[#52b788]" />
            <span>Simulated Demo System</span>
          </div>
        </div>
      </div>

      {/* Top 6 Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Claims"
          value={stats?.total_claims?.toLocaleString()}
          icon={FileText}
          subtitle="Processed in database"
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
          title="Delayed"
          value={stats?.delayed?.toLocaleString()}
          icon={AlertTriangle}
          subtitle="> 180 days backlog"
        />
        <StatCard
          title="AI Anomalies"
          value={stats?.anomalies?.toLocaleString()}
          icon={ShieldAlert}
          subtitle="Flagged by Engine"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Claims Breakdown by State */}
        <div className="forest-card p-7 shadow-forest-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 border-b border-[#134934] pb-4">
            <div>
              <h3 className="font-display text-2xl text-[#fefae0] uppercase tracking-wide flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#52b788]" />
                State-Wise Claim Status
              </h3>
              <p className="text-[10px] text-[#a3b18a] uppercase tracking-[0.2em]">Comparative volume across monitoring states</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#134934" />
                <XAxis dataKey="state" stroke="#a3b18a" tick={{ fontSize: 11, fill: '#ccd5ae' }} />
                <YAxis stroke="#a3b18a" tick={{ fontSize: 11, fill: '#ccd5ae' }} />
                <Tooltip contentStyle={{ backgroundColor: '#042317', borderColor: '#52b788', borderRadius: '1rem', color: '#fefae0' }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, textTransform: 'uppercase', letterSpacing: '0.15em' }} />
                <Bar dataKey="approved" name="Approved" fill="#52b788" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#e9c46a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="rejected" name="Rejected" fill="#e76f51" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Distribution Donut */}
        <div className="forest-card p-7 shadow-forest-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 border-b border-[#134934] pb-4">
            <div>
              <h3 className="font-display text-2xl text-[#fefae0] uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#ccd5ae]" />
                Status Distribution Ratio
              </h3>
              <p className="text-[10px] text-[#a3b18a] uppercase tracking-[0.2em]">Overall proportion of claim disposition</p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={6}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={FOREST_COLORS[index % FOREST_COLORS.length]} stroke="#022317" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#063020', borderColor: '#a3b18a', borderRadius: '1rem', color: '#fefae0' }} />
                <Legend wrapperStyle={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3 & AI Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Anomalies by State */}
        <div className="lg:col-span-2 forest-card p-7 shadow-forest-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 border-b border-[#134934] pb-4">
            <div>
              <h3 className="font-display text-2xl text-[#fefae0] uppercase tracking-wide flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#ccd5ae]" />
                AI Anomaly & Delay Index by State
              </h3>
              <p className="text-[10px] text-[#a3b18a] uppercase tracking-[0.2em]">Spatial correlation of critical flags and backlogs</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#134934" />
                <XAxis dataKey="state" stroke="#a3b18a" tick={{ fontSize: 11, fill: '#ccd5ae' }} />
                <YAxis stroke="#a3b18a" tick={{ fontSize: 11, fill: '#ccd5ae' }} />
                <Tooltip contentStyle={{ backgroundColor: '#063020', borderColor: '#a3b18a', borderRadius: '1rem', color: '#fefae0' }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 5, textTransform: 'uppercase', letterSpacing: '0.15em' }} />
                <Bar dataKey="anomalies" name="Total Anomalies" fill="#ccd5ae" radius={[6, 6, 0, 0]} />
                <Bar dataKey="delayed" name="Delayed (>180d)" fill="#a3b18a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority AI Alerts Feed */}
        <div className="forest-card p-7 shadow-forest-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 border-b border-[#134934] pb-4">
              <h3 className="font-display text-2xl text-[#fefae0] uppercase tracking-wide flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#ccd5ae] animate-pulse" />
                Live Alerts
              </h3>
              <span className="px-3 py-0.5 rounded-full bg-[#01472e] text-[#ccd5ae] border border-[#a3b18a]/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                Top Feed
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {stats?.recent_alerts?.map((alert) => (
                <AlertCard key={alert.id} alert={alert} onSelect={handleOpenClaim} />
              ))}
            </div>
          </div>
        </div>
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

export default Dashboard;
