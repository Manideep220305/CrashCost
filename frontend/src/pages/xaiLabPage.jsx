// ============================================================
// XAI LAB PAGE — Explainable AI Chat Interface
// ============================================================
// This page lets users ask Gemini AI questions about their claims.
// It provides an interactive chat interface where users can:
//   - Select any of their past claims from a dropdown
//   - Ask questions about the AI's detections, costs, and reasoning
//   - Get detailed explanations powered by Gemini 2.5 Flash
//
// DATA FLOW:
//   1. On mount, fetch all user claims from /api/claims
//   2. User selects a claim (or one is pre-selected via URL ?claimId=)
//   3. User types a question
//   4. POST /api/explain { claimId, message } → Gemini generates answer
//   5. Response displayed in the chat window
//
// DEPENDENCIES:
//   - AuthContext for user identity
//   - framer-motion for animations
//   - lucide-react for icons
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Brain, Activity, Zap, BarChart3, Upload,
  ChevronDown, Loader2, MessageSquare, FileText
} from 'lucide-react';

const XaiLabPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialClaimId = searchParams.get('claimId');

  // ─── State ───
  const [claims, setClaims] = useState([]);              // User's claims for the selector
  const [selectedClaimId, setSelectedClaimId] = useState(initialClaimId || '');
  const [selectedClaim, setSelectedClaim] = useState(null);  // Full claim data
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const scrollRef = useRef(null);

  const [chat, setChat] = useState([{
    role: 'ai',
    text: initialClaimId
      ? `Gemini XAI Module linked to Claim ID: ${initialClaimId.substring(0, 8)}... I have loaded the vehicle details, damage report, and cost estimation from the database. What would you like me to explain?`
      : 'Welcome to the XAI Lab. Select a claim from the dropdown above to start exploring the AI\'s reasoning behind its damage assessment and cost estimates.'
  }]);

  // ─── Route protection ───
  if (!user) return <Navigate to="/" replace />;

  // ─── Auto-scroll chat to bottom ───
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  // ─── Fetch user's claims on mount ───
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_URL}/api/claims?userId=${user._id || user.id}`);
        const data = await res.json();
        setClaims(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch claims:', err);
      } finally {
        setClaimsLoading(false);
      }
    };
    fetchClaims();
  }, [user]);

  // ─── When a claim is selected, load its full data ───
  useEffect(() => {
    if (selectedClaimId) {
      const claim = claims.find(c => c._id === selectedClaimId);
      setSelectedClaim(claim || null);
    } else {
      setSelectedClaim(null);
    }
  }, [selectedClaimId, claims]);

  // ============================================================
  // ASK GEMINI — Send question + claim context to backend
  // ============================================================
  const handleAskGemini = async () => {
    if (!query.trim() || isLoading) return;
    if (!selectedClaimId) {
      setChat(prev => [...prev, {
        role: 'ai',
        text: '⚠️ Please select a claim first. I need the claim context to answer your question.'
      }]);
      return;
    }

    const userMessage = query;
    setChat(prev => [...prev, { role: 'user', text: userMessage }]);
    setQuery('');
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: selectedClaimId,
          message: userMessage
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setChat(prev => [...prev, { role: 'ai', text: data.answer }]);
      } else {
        throw new Error(data.error || 'Failed to fetch explanation.');
      }
    } catch (error) {
      console.error('XAI API Error:', error);
      const isNetworkError = error.message.includes('Failed to fetch');
      const errorMessage = isNetworkError
        ? 'Error connecting to the backend. Make sure the server is running.'
        : error.message;

      setChat(prev => [...prev, { role: 'ai', text: `⚠️ ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Build claim summary for the context panel ───
  const detections = selectedClaim?.aiReport?.detections || [];
  const totalEstimate = selectedClaim?.aiReport?.total_estimate || 0;

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

        {/* ─── Header (consistent with dashboard/analytics) ─── */}
        <header className="px-10 py-5 flex justify-between items-center border-b border-emerald-200/40 dark:border-white/5 bg-emerald-50/20 dark:bg-slate-900/40 backdrop-blur-sm shrink-0 transition-colors">
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
        <main className="flex-1 p-6 lg:p-10 flex flex-col overflow-hidden">

          {/* Title + Claim Selector Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 shrink-0">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tighter">XAI Reasoning Lab</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-sm">Ask Gemini to explain any AI assessment in detail</p>
            </div>

            {/* Claim Selector Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Claim Context:</span>
              <select
                value={selectedClaimId}
                onChange={(e) => {
                  setSelectedClaimId(e.target.value);
                  if (e.target.value) {
                    const claim = claims.find(c => c._id === e.target.value);
                    setChat(prev => [...prev, {
                      role: 'ai',
                      text: `Switched to claim: ${claim?.vehicleDetails?.brand || ''} ${claim?.vehicleDetails?.model || ''} — ₹${claim?.aiReport?.total_estimate?.toLocaleString('en-IN') || 0} estimate with ${claim?.aiReport?.detections?.length || 0} detections. What would you like me to explain?`
                    }]);
                  }
                }}
                className={`bg-white dark:bg-white/5 border border-emerald-200/50 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer min-w-[220px] ${selectedClaimId ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}
              >
                <option value="">Select a claim...</option>
                {claims.map(c => (
                  <option key={c._id} value={c._id} className="text-slate-900">
                    {c.vehicleDetails?.brand || c.vehicleDetails?.make || 'Vehicle'} {c.vehicleDetails?.model || ''} — ₹{(c.aiReport?.total_estimate || 0).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chat + Context Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">

            {/* ─── Chat Window ─── */}
            <div className="lg:col-span-8 flex flex-col bg-white/70 dark:bg-white/5 backdrop-blur-3xl border border-emerald-100/50 dark:border-white/10 rounded-[2rem] shadow-sm overflow-hidden transition-colors">

              {/* Messages Area */}
              <div ref={scrollRef} className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
                <AnimatePresence>
                  {chat.map((msg, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      key={i}
                      className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed ${msg.role === 'ai'
                        ? 'bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-slate-700 dark:text-slate-300 rounded-tl-sm'
                        : 'bg-emerald-500 text-white rounded-tr-sm shadow-md shadow-emerald-500/20'
                        }`}>
                        {msg.role === 'ai' && (
                          <div className="flex items-center gap-2 mb-2">
                            <Brain size={14} className="text-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Gemini AI</span>
                          </div>
                        )}
                        <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="bg-emerald-50/70 dark:bg-emerald-500/10 p-5 rounded-2xl rounded-tl-sm border border-emerald-100 dark:border-emerald-500/20 flex gap-3 items-center">
                        <Loader2 className="text-emerald-500 animate-spin" size={18} />
                        <span className="text-slate-500 text-xs font-bold">Gemini is thinking...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Suggested Questions */}
              {selectedClaimId && chat.length <= 2 && (
                <div className="px-6 lg:px-8 pb-2 flex flex-wrap gap-2 shrink-0">
                  {[
                    'Why is the repair cost this high?',
                    'Explain the damage detection process',
                    'Break down the cost estimate',
                    'What SHAP features drive the price?',
                    'Is this damage repairable or replace?',
                  ].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(q)}
                      className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 lg:p-6 border-t border-emerald-100/50 dark:border-white/10 flex gap-3 items-center shrink-0">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskGemini()}
                  placeholder={selectedClaimId ? 'Ask about the damage, cost, or AI reasoning...' : 'Select a claim above to start asking...'}
                  disabled={!selectedClaimId}
                  className="flex-1 bg-white dark:bg-white/5 border border-emerald-200/50 dark:border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleAskGemini}
                  disabled={isLoading || !selectedClaimId}
                  className="p-3.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:shadow-emerald-500/50 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>

            {/* ─── Right Panel: Claim Context ─── */}
            <div className="lg:col-span-4 hidden lg:flex flex-col gap-4 overflow-y-auto">

              {/* Claim Details Card */}
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-3xl p-6 rounded-[2rem] shadow-sm border border-emerald-100/50 dark:border-white/10 transition-colors">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                  <FileText size={14} /> Claim Context
                </h3>

                {!selectedClaim ? (
                  <p className="text-sm text-slate-400 font-medium">No claim selected. Choose one from the dropdown above.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {selectedClaim.vehicleDetails?.brand || ''} {selectedClaim.vehicleDetails?.model || ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tier</span>
                      <span className="text-sm font-black text-slate-900 capitalize">{selectedClaim.vehicleDetails?.tier || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Segment</span>
                      <span className="text-sm font-black text-slate-900 capitalize">{selectedClaim.vehicleDetails?.segment || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</span>
                      <span className="text-sm font-black text-slate-900 capitalize">{selectedClaim.vehicleDetails?.damageLocation || '—'}</span>
                    </div>
                    <div className="border-t border-emerald-100/50 pt-4 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Estimate</span>
                      <span className="text-lg font-black text-emerald-600">₹{totalEstimate.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Detections Card */}
              {selectedClaim && detections.length > 0 && (
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-3xl p-6 rounded-[2rem] shadow-sm border border-emerald-100/50 dark:border-white/10 flex-1 transition-colors">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                    Detections ({detections.length})
                  </h3>
                  <div className="space-y-3">
                    {detections.map((det, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-xl border border-transparent dark:border-emerald-500/10">
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white">{det.label?.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                            {det.severity} · {(det.confidence * 100).toFixed(0)}% conf
                          </p>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white">₹{det.price?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Help Card */}
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-3xl p-6 rounded-[2rem] shadow-sm border border-emerald-100/50 dark:border-white/10 shrink-0 transition-colors">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2">
                  <MessageSquare size={14} /> What to Ask
                </h3>
                <div className="space-y-2">
                  {[
                    'Why was this classified as SEVERE?',
                    'What are SHAP cost drivers?',
                    'Compare front vs side damage costs',
                    'Is the AI confident here?',
                  ].map((tip, i) => (
                    <p key={i} className="text-xs text-slate-500 font-medium flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      {tip}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};


export default XaiLabPage;