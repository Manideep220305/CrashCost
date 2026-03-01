import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShieldCheck, AlertCircle, Clock, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

// --- MOCK DATA FOR INTERACTIVITY ---
const dataSets = {
  '7D': [
    { name: 'Bumper', claims: 15 }, { name: 'Door', claims: 8 }, 
    { name: 'Hood', claims: 3 }, { name: 'Fender', claims: 10 }, { name: 'Light', claims: 6 }
  ],
  '30D': [
    { name: 'Bumper', claims: 45 }, { name: 'Door', claims: 32 }, 
    { name: 'Hood', claims: 12 }, { name: 'Fender', claims: 25 }, { name: 'Light', claims: 18 }
  ],
  'YTD': [
    { name: 'Bumper', claims: 340 }, { name: 'Door', claims: 215 }, 
    { name: 'Hood', claims: 98 }, { name: 'Fender', claims: 180 }, { name: 'Light', claims: 145 }
  ]
};

const recentClaims = [
  { id: 'CLM-8829', vehicle: '2024 Volvo EX30', aiConf: '98.4%', status: 'Auto-Approved', amount: '₹14,500', time: '12 mins ago', icon: CheckCircle2, color: 'text-emerald-500' },
  { id: 'CLM-8828', vehicle: '2021 BMW 3 Series', aiConf: '72.1%', status: 'Adjuster Review', amount: '₹85,000', time: '1 hr ago', icon: AlertCircle, color: 'text-amber-500' },
  { id: 'CLM-8827', vehicle: '2023 Tesla Model Y', aiConf: '99.1%', status: 'Auto-Approved', amount: '₹22,000', time: '3 hrs ago', icon: CheckCircle2, color: 'text-emerald-500' },
  { id: 'CLM-8826', vehicle: '2019 Honda Civic', aiConf: '45.0%', status: 'Rejected (Blurry)', amount: '---', time: '5 hrs ago', icon: XCircle, color: 'text-red-500' },
];

const COLORS = ['#10b981', '#3b82f6', '#6366f1', '#f59e0b', '#ef4444'];

const AnalyticsPage = () => {
  const [timeframe, setTimeframe] = useState('30D');
  const activeData = dataSets[timeframe];

  return (
    <div className="min-h-screen bg-[#e6f2eb] flex relative overflow-hidden font-sans selection:bg-[#10b981] selection:text-white">
      
      {/* Mesh Gradient Background (Matches Dashboard) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-[#10b981]/25 blur-[140px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[5%] right-[-5%] w-[50%] h-[50%] bg-emerald-400/15 blur-[120px] rounded-full"></div>
      </div>

      <Sidebar />

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto z-10 relative custom-scrollbar">
        
        {/* HEADER & FILTERS */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
               <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></span>
               <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Live Telemetry</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">Claims Analytics</h1>
            <p className="text-slate-600 font-medium mt-2 text-base">Fleet-wide damage distribution and AI performance metrics.</p>
          </motion.div>

          {/* Interactive Timeframe Toggle */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex bg-emerald-100/50 backdrop-blur-md p-1.5 rounded-2xl border border-emerald-200/50 shadow-sm">
            {['7D', '30D', 'YTD'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                  timeframe === tf 
                    ? 'bg-white text-[#10b981] shadow-md' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </motion.div>
        </header>

        {/* TOP STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={ShieldCheck} label="Total Validated" val={timeframe === '7D' ? '142' : timeframe === '30D' ? '1,284' : '14,592'} sub="98.2% AI Confidence" color="text-[#10b981]" delay={0.1} />
          <StatCard icon={AlertCircle} label="Flagged for Review" val={timeframe === '7D' ? '8' : timeframe === '30D' ? '42' : '315'} sub="Requires Adjuster" color="text-amber-500" delay={0.2} />
          <StatCard icon={Clock} label="Avg. Settlement" val="2.4m" sub="90% reduction vs manual" color="text-blue-500" delay={0.3} />
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Bar Chart Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-emerald-50/60 backdrop-blur-2xl border border-emerald-200/50 p-8 rounded-[3rem] shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-600 uppercase text-xs tracking-[0.2em]">Damage by Part Type</h3>
              <div className="p-2 bg-emerald-100 rounded-lg text-[#10b981]"><TrendingUp size={16}/></div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 800, fill: '#64748b'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 800, fill: '#64748b'}} />
                  <Tooltip cursor={{fill: '#d1fae5', opacity: 0.4}} contentStyle={{borderRadius: '16px', border: '1px solid #a7f3d0', boxShadow: '0 20px 40px -10px rgba(16,185,129,0.1)', fontWeight: 'bold'}} />
                  <Bar dataKey="claims" fill="#10b981" radius={[8, 8, 0, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-emerald-50/60 backdrop-blur-2xl border border-emerald-200/50 p-8 rounded-[3rem] shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-black text-slate-600 uppercase text-xs tracking-[0.2em] mb-8">Severity Distribution</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={activeData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="claims" animationDuration={1000}>
                    {activeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', fontWeight: 'bold'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* RECENT ASSESSMENTS TABLE (New Interactive Element) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-emerald-50/60 backdrop-blur-2xl border border-emerald-200/50 p-8 rounded-[3rem] shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-600 uppercase text-xs tracking-[0.2em]">Recent AI Assessments</h3>
            <button className="text-xs font-black text-[#10b981] hover:text-emerald-700 uppercase tracking-widest transition-colors">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentClaims.map((claim, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white/60 border border-emerald-100 rounded-2xl hover:border-[#10b981]/40 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className={`p-3 rounded-xl bg-white shadow-sm ${claim.color}`}>
                    <claim.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-950">{claim.id} <span className="text-slate-400 font-bold ml-2 hidden sm:inline">— {claim.vehicle}</span></p>
                    <p className="text-xs font-bold text-slate-500 mt-1">{claim.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 md:gap-12 ml-14 md:ml-0">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">AI Match</p>
                    <p className="text-sm font-black text-slate-800">{claim.aiConf}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                    <p className={`text-sm font-black ${claim.color}`}>{claim.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Estimate</p>
                    <p className="text-sm font-black text-slate-950">{claim.amount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </main>
    </div>
  );
};

// Reusable animated Stat Card
const StatCard = ({ icon: Icon, label, val, sub, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-emerald-50/60 backdrop-blur-2xl border border-emerald-200/50 p-8 rounded-[3rem] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
  >
    <div className={`p-4 rounded-2xl inline-block bg-white shadow-sm mb-6 group-hover:scale-110 transition-transform ${color}`}>
      <Icon size={28} />
    </div>
    <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
    <p className="text-4xl font-black text-slate-950 my-2 tracking-tight">{val}</p>
    <p className="text-sm font-bold text-slate-600">{sub}</p>
  </motion.div>
);

export default AnalyticsPage;