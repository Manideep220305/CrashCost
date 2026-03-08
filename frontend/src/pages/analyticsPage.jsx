// ============================================================
// ANALYTICS PAGE — Real Data Claim History & Analytics
// ============================================================
// This page fetches REAL claim data from MongoDB and displays:
//   1. Stat cards (total claims, avg confidence, total cost)
//   2. Recharts: damage type bar chart + severity pie chart
//   3. Interactive claim history table with:
//      - "View Report" → expands full AI analysis inline
//      - "Ask AI" → chat with Gemini about a specific claim
//   4. Empty state when user has no claims yet
//
// DATA FLOW:
//   Component mounts → GET /api/claims?userId=<user._id>
//   → Parse response → Compute stats → Render charts + table
//
// DEPENDENCIES:
//   - recharts (BarChart, PieChart) for data visualization
//   - framer-motion for animations
//   - AuthContext for user identity
//   - lucide-react for icons
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  ShieldCheck, TrendingUp, DollarSign, ChevronDown, ChevronUp,
  MessageSquare, Send, X, Loader2, FileText, AlertCircle,
  Zap, BarChart3, Brain, Upload, AlertTriangle
} from 'lucide-react';

// ─── Color palette for Recharts charts ───
const CHART_COLORS = ['#10b981', '#3b82f6', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// ─── Severity color mapping ───
const SEVERITY_COLORS = {
  'MINOR': '#10b981',
  'MODERATE': '#f59e0b',
  'SEVERE': '#ef4444'
};


// ============================================================
// MAIN COMPONENT
// ============================================================
const AnalyticsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // ─── State ───
  const [claims, setClaims] = useState([]);          // All user's claims from MongoDB
  const [loading, setLoading] = useState(true);      // Loading state for API call
  const [expandedClaim, setExpandedClaim] = useState(null);  // Which claim's report is expanded
  const [aiChatClaim, setAiChatClaim] = useState(null);      // Which claim has AI chat open
  const [aiQuestion, setAiQuestion] = useState('');           // Current AI question text
  const [aiAnswer, setAiAnswer] = useState('');               // Gemini's response
  const [aiLoading, setAiLoading] = useState(false);          // AI chat loading state

  // ─── Route protection ───
  if (!user) return <Navigate to="/" replace />;

  // ─── Fetch claims on mount ───
  // We pass userId as a query param so the backend only returns
  // claims belonging to the currently logged-in user.
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_URL}/api/claims?userId=${user._id || user.id}`);
        const data = await res.json();
        setClaims(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch claims:', err);
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, [user]);

  // ============================================================
  // COMPUTED STATS — Derived from real claim data
  // ============================================================
  // These are NOT hardcoded. They're computed fresh from whatever
  // claims the user has submitted through the dashboard.

  const totalClaims = claims.length;

  // Average AI confidence across ALL detections in ALL claims
  const allDetections = claims.flatMap(c => c.aiReport?.detections || []);
  const avgConfidence = allDetections.length > 0
    ? (allDetections.reduce((sum, d) => sum + (d.confidence || 0), 0) / allDetections.length * 100).toFixed(1)
    : '0.0';

  // Total estimated repair cost across all claims
  const totalCost = claims.reduce((sum, c) => sum + (c.aiReport?.total_estimate || 0), 0);

  // ─── Chart Data: Damage Type Distribution ───
  // Count how many times each damage type (DENT, SCRATCH, etc.) appears
  const damageTypeCounts = {};
  allDetections.forEach(d => {
    const label = d.label || 'UNKNOWN';
    damageTypeCounts[label] = (damageTypeCounts[label] || 0) + 1;
  });
  const damageChartData = Object.entries(damageTypeCounts)
    .map(([name, count]) => ({ name: name.replace(/_/g, ' '), count }))
    .sort((a, b) => b.count - a.count);

  // ─── Chart Data: Severity Distribution ───
  // Count MINOR / MODERATE / SEVERE across all detections
  const severityCounts = {};
  allDetections.forEach(d => {
    const sev = d.severity || 'UNKNOWN';
    severityCounts[sev] = (severityCounts[sev] || 0) + 1;
  });
  const severityChartData = Object.entries(severityCounts)
    .map(([name, value]) => ({ name, value }));

  // ============================================================
  // ASK AI — Send a question about a specific claim to Gemini
  // ============================================================
  const handleAskAI = async () => {
    if (!aiQuestion.trim() || !aiChatClaim) return;
    setAiLoading(true);
    setAiAnswer('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: aiChatClaim, message: aiQuestion })
      });
      const data = await res.json();
      setAiAnswer(data.answer || 'No response from AI.');
    } catch (err) {
      setAiAnswer('Failed to connect to AI. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex relative overflow-hidden font-sans transition-colors duration-300">

      {/* Wavy Green Aurora */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[45%] rounded-[50%] bg-gradient-to-r from-emerald-400/30 via-emerald-300/20 to-teal-400/25 dark:from-emerald-500/35 dark:via-emerald-400/25 dark:to-teal-500/30 blur-[80px] animate-aurora-wave"></div>
        <div className="absolute bottom-[-15%] left-[-10%] w-[130%] h-[40%] rounded-[50%] bg-gradient-to-r from-teal-300/20 via-emerald-400/25 to-emerald-300/15 dark:from-teal-500/25 dark:via-emerald-500/30 dark:to-emerald-400/20 blur-[90px] animate-aurora-wave-reverse"></div>
        <div className="absolute top-[30%] left-[10%] w-[60%] h-[30%] rounded-[50%] bg-emerald-400/10 dark:bg-emerald-500/15 blur-[100px] animate-aurora"></div>
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col z-10 relative h-screen overflow-hidden">

        {/* ─── Header (matches dashboard) ─── */}
        <header className="px-10 py-5 flex justify-between items-center border-b border-emerald-200/40 dark:border-white/5 bg-emerald-50/20 dark:bg-slate-900/40 backdrop-blur-sm transition-colors">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 group-hover:scale-110 transition-all duration-300">
                <Zap size={16} className="text-white" />
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">CrashCost</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: 'New Claim', path: '/dashboard', icon: Upload },
                { label: 'History', path: '/analytics', icon: BarChart3 },
                { label: 'XAI Lab', path: '/xai-lab', icon: Brain },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${location.pathname === item.path
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-white/5'
                    }`}
                >
                  <item.icon size={14} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">Authenticated</p>
              <p className="text-base font-black text-slate-950 dark:text-white">{user?.name || 'User'}</p>
            </div>
            <div className="w-11 h-11 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center font-black text-white text-base">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">

          {/* Page Title */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tighter">Claim History</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-base">
              {totalClaims > 0
                ? `${totalClaims} claim${totalClaims > 1 ? 's' : ''} submitted · Analytics computed from real AI assessments`
                : 'Submit your first claim from the dashboard to see analytics here'
              }
            </p>
          </motion.div>

          {/* ─── Loading State ─── */}
          {loading && (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="animate-spin text-emerald-500" size={40} />
            </div>
          )}

          {/* ─── Empty State ─── */}
          {!loading && totalClaims === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8">
                <FileText className="text-emerald-500" size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-950 tracking-tighter mb-3">No Claims Yet</h2>
              <p className="text-slate-500 font-medium max-w-md mb-8">
                Submit a damage assessment from the dashboard. Your claim history, AI analytics, and cost breakdowns will appear here.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-emerald-500 text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/30 transition-all active:scale-95"
              >
                Submit First Claim
              </button>
            </motion.div>
          )}

          {/* ─── Main Content (only when we have claims) ─── */}
          {!loading && totalClaims > 0 && (
            <>
              {/* ─── STAT CARDS ROW ─── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard
                  icon={ShieldCheck}
                  label="Total Claims"
                  val={totalClaims}
                  sub={`${allDetections.length} total damage detections`}
                  color="text-emerald-500"
                  delay={0.1}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Avg AI Confidence"
                  val={`${avgConfidence}%`}
                  sub="Across all detections"
                  color="text-blue-500"
                  delay={0.2}
                />
                <StatCard
                  icon={DollarSign}
                  label="Total Estimated Cost"
                  val={`₹${totalCost.toLocaleString('en-IN')}`}
                  sub="Sum of all claim estimates"
                  color="text-amber-500"
                  delay={0.3}
                />
              </div>

              {/* ─── CHARTS ROW ─── */}
              {allDetections.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

                  {/* Bar Chart: Damage Type Distribution */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-emerald-100/50 dark:border-white/10 p-8 rounded-[2rem] shadow-sm"
                  >
                    <h3 className="font-black text-slate-600 uppercase text-xs tracking-[0.2em] mb-8">Damage Type Distribution</h3>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={damageChartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                            dy={10}
                          />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }} />
                          <Tooltip
                            cursor={{ fill: '#d1fae5', opacity: 0.3 }}
                            contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                          />
                          <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} animationDuration={1000} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Pie Chart: Severity Distribution */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-emerald-100/50 dark:border-white/10 p-8 rounded-[2rem] shadow-sm"
                  >
                    <h3 className="font-black text-slate-600 uppercase text-xs tracking-[0.2em] mb-8">Severity Distribution</h3>
                    <div className="h-72 w-full flex items-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={severityChartData}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={6}
                            dataKey="value"
                            animationDuration={1000}
                          >
                            {severityChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={SEVERITY_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]}
                                stroke="transparent"
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Legend */}
                      <div className="flex flex-col gap-3 ml-4 min-w-[120px]">
                        {severityChartData.map((entry, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: SEVERITY_COLORS[entry.name] || CHART_COLORS[i] }}
                            />
                            <span className="text-xs font-bold text-slate-600">{entry.name}</span>
                            <span className="text-xs font-black text-slate-900 ml-auto">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* ─── CLAIM HISTORY TABLE ─── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-emerald-100/50 dark:border-white/10 p-8 rounded-[2rem] shadow-sm transition-colors"
              >
                <h3 className="font-black text-slate-600 dark:text-slate-400 uppercase text-xs tracking-[0.2em] mb-8">
                  All Assessments ({totalClaims})
                </h3>

                <div className="space-y-4">
                  {claims.map((claim) => {
                    const isExpanded = expandedClaim === claim._id;
                    const detections = claim.aiReport?.detections || [];
                    const topConfidence = detections.length > 0
                      ? Math.max(...detections.map(d => d.confidence || 0)) * 100
                      : 0;

                    return (
                      <div key={claim._id} className="border border-emerald-100/60 dark:border-white/10 rounded-2xl overflow-hidden transition-all hover:border-emerald-300/60 dark:hover:border-emerald-500/30">

                        {/* Claim Summary Row */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white/60 dark:bg-white/5">
                          <div className="flex items-center gap-4 mb-3 md:mb-0">
                            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-500 shadow-sm">
                              <ShieldCheck size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-950 dark:text-white">
                                {claim.vehicleDetails?.brand || claim.vehicleDetails?.make || 'Vehicle'}{' '}
                                {claim.vehicleDetails?.model || ''}
                                <span className="text-slate-400 font-bold ml-2 text-xs">
                                  {claim.vehicleDetails?.tier ? `· ${claim.vehicleDetails.tier}` : ''}
                                </span>
                              </p>
                              <p className="text-xs font-medium text-slate-400 mt-0.5">
                                {new Date(claim.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 md:gap-10 ml-14 md:ml-0">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Detections</p>
                              <p className="text-sm font-black text-slate-800 dark:text-slate-200">{detections.length}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Confidence</p>
                              <p className="text-sm font-black text-slate-800 dark:text-slate-200">{topConfidence.toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Estimate</p>
                              <p className="text-sm font-black text-slate-950 dark:text-white">₹{(claim.aiReport?.total_estimate || 0).toLocaleString('en-IN')}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* View Report Button */}
                              <button
                                onClick={() => setExpandedClaim(isExpanded ? null : claim._id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${isExpanded
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                                  }`}
                              >
                                <FileText size={13} />
                                Report
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </button>

                              {/* Ask AI Button */}
                              <button
                                onClick={() => {
                                  setAiChatClaim(aiChatClaim === claim._id ? null : claim._id);
                                  setAiAnswer('');
                                  setAiQuestion('');
                                }}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${aiChatClaim === claim._id
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20'
                                  }`}
                              >
                                <MessageSquare size={13} />
                                Ask AI
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* ─── Expanded Report Panel ─── */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 bg-emerald-50/40 dark:bg-emerald-500/5 border-t border-emerald-100/50 dark:border-emerald-500/10 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">AI Detection Report</h4>
                                  <span className="text-xs font-bold text-slate-400">
                                    Range: ₹{(claim.aiReport?.estimate_range?.[0] || 0).toLocaleString('en-IN')} – ₹{(claim.aiReport?.estimate_range?.[1] || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>

                                {detections.length === 0 ? (
                                  <p className="text-sm text-slate-500">No damage detected in this assessment.</p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {detections.map((det, idx) => (
                                      <div key={idx} className="bg-white dark:bg-white/5 rounded-xl p-4 border border-emerald-100/50 dark:border-white/10 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="flex flex-col gap-1.5">
                                            <span className="text-sm font-black text-slate-900 dark:text-white">{det.label?.replace(/_/g, ' ')}</span>
                                            {det.ratio >= 0.40 && ['CRACK', 'GLASS SHATTER', 'LAMP_BROKEN', 'DENT'].includes(det.label) && (
                                              <span className="bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-red-200 dark:border-red-500/30 w-fit flex items-center gap-1">
                                                <AlertTriangle size={10} /> Panel Replacement
                                              </span>
                                            )}
                                          </div>
                                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${det.severity === 'SEVERE' ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                                            det.severity === 'MODERATE' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                              'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                            }`}>
                                            {det.severity}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{det.summary}</p>
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-slate-400 font-bold">
                                            Confidence: {(det.confidence * 100).toFixed(1)}% · {det.surface_detected}
                                          </span>
                                          <span className="font-black text-slate-900 dark:text-white">₹{det.price?.toLocaleString('en-IN')}</span>
                                        </div>
                                        {det.drivers && det.drivers.length > 0 && (
                                          <div className="mt-2 flex gap-1.5 flex-wrap">
                                            {det.drivers.map((driver, di) => (
                                              <span key={di} className="text-[9px] font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                                                {driver}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* ─── AI Chat Panel ─── */}
                        <AnimatePresence>
                          {aiChatClaim === claim._id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 bg-blue-50/40 dark:bg-blue-500/5 border-t border-blue-100/50 dark:border-blue-500/10">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                                    <Brain size={14} /> Ask AI About This Claim
                                  </h4>
                                  <button onClick={() => setAiChatClaim(null)} className="text-slate-400 hover:text-slate-600">
                                    <X size={16} />
                                  </button>
                                </div>

                                {/* Quick question suggestions */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {[
                                    'Why is the cost this high?',
                                    'Break down the estimate',
                                    'Is this damage repairable?',
                                    'Explain the confidence score'
                                  ].map((q, i) => (
                                    <button
                                      key={i}
                                      onClick={() => setAiQuestion(q)}
                                      className="text-[10px] font-bold bg-white dark:bg-white/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/20 transition-colors"
                                    >
                                      {q}
                                    </button>
                                  ))}
                                </div>

                                {/* Chat input */}
                                <div className="flex gap-3">
                                  <input
                                    type="text"
                                    value={aiQuestion}
                                    onChange={(e) => setAiQuestion(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                                    placeholder="Ask anything about this claim..."
                                    className="flex-1 bg-white dark:bg-white/5 border border-blue-200/50 dark:border-blue-500/20 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 transition-all"
                                  />
                                  <button
                                    onClick={handleAskAI}
                                    disabled={aiLoading || !aiQuestion.trim()}
                                    className="bg-blue-500 text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2"
                                  >
                                    {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    Send
                                  </button>
                                </div>

                                {/* AI Response */}
                                {aiAnswer && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 bg-white dark:bg-white/5 border border-blue-100/50 dark:border-blue-500/20 rounded-xl p-5"
                                  >
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Gemini AI Response</p>
                                    <div className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                                      {aiAnswer}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}

        </main>
      </div>
    </div>
  );
};


// ============================================================
// STAT CARD — Reusable animated statistic display
// ============================================================
// Used for the top-row metrics (Total Claims, Avg Confidence, etc.)
// Each card fades in with a staggered delay for a polished entrance.
const StatCard = ({ icon: Icon, label, val, sub, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-emerald-100/50 dark:border-white/10 p-8 rounded-[2rem] shadow-sm hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all group"
  >
    <div className={`p-4 rounded-2xl inline-block bg-emerald-50 dark:bg-emerald-500/10 shadow-sm mb-6 group-hover:scale-110 transition-transform ${color}`}>
      <Icon size={28} />
    </div>
    <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
    <p className="text-4xl font-black text-slate-950 dark:text-white my-2 tracking-tight">{val}</p>
    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{sub}</p>
  </motion.div>
);


export default AnalyticsPage;