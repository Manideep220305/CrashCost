import React from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  AlertCircle,
  FileText,
  Info,
  CheckCircle2,
  Car,
  Globe,
  Upload,
  BarChart3,
  Brain,
  Zap,
} from 'lucide-react';

// Simple fade/slide-in wrapper for sections
const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

const InsuranceGuidePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Route protection
  if (!user) return <Navigate to="/" replace />;

  const fundamentals = [
    {
      icon: ShieldCheck,
      title: 'Third-Party vs Comprehensive',
      points: [
        'Third-party cover pays for damage you cause to other people, their cars, and property.',
        'Comprehensive adds protection for your own car (accidents, fire, theft, natural events) on top of third-party.',
        'In many countries, third-party liability is legally mandatory; comprehensive is strongly recommended but optional.',
      ],
    },
    {
      icon: Car,
      title: 'What Your Policy Actually Covers',
      points: [
        'A policy is a contract – it only pays for risks that are listed as “covered”.',
        'Common inclusions: accidental damage, fire, theft, natural disasters, riots, and sometimes personal accident cover.',
        'Common exclusions: driving without a license, drunk driving, intentional damage, commercial use under a private policy.',
      ],
    },
    {
      icon: FileText,
      title: 'IDV / Sum Insured',
      points: [
        'Your “sum insured” or Insured Declared Value (IDV) is the max amount the insurer will pay if the car is a total loss.',
        'Higher IDV usually means higher premium but better payout; extremely low IDV saves premium but can underpay claims.',
        'IDV typically reduces every year as the vehicle depreciates – review it at each renewal.',
      ],
    },
  ];

  const moneyConcepts = [
    {
      title: 'Deductible / Excess',
      desc: 'The part of each claim you must pay from your pocket before insurance pays the rest.',
      details: [
        'Example: If your deductible is ₹5,000 and repair cost is ₹25,000, insurer may pay around ₹20,000.',
        'A higher deductible lowers your premium but increases what you pay at claim time.',
      ],
    },
    {
      title: 'No-Claim Bonus (NCB)',
      desc: 'Reward for claim-free years – reduces your renewal premium.',
      details: [
        'NCB usually steps up every consecutive claim-free year, up to a maximum slab.',
        'Making even a small claim can reset your NCB; sometimes it is cheaper to pay minor repairs yourself.',
      ],
    },
    {
      title: 'Add-ons & Riders',
      desc: 'Optional extras that plug gaps in the base policy.',
      details: [
        'Popular add-ons: zero-depreciation cover, roadside assistance, engine protect, consumables cover, return-to-invoice.',
        'Only choose add-ons that match how you actually use the car (age, usage, region).',
      ],
    },
  ];

  const goodHabits = [
    'Always read the “Exclusions” section – that’s where most surprises hide.',
    'Keep photos of your car (inside and outside) in normal condition; they help if there is a dispute later.',
    'After an accident, ensure safety first, then capture clear photos and note time, location, and any witnesses.',
    'Inform your insurer promptly – many policies have time limits for intimation of a claim.',
    'Never admit legal fault at the scene; share facts only and let insurers and authorities determine liability.',
    'Do not sign blank forms or repair invoices you don’t understand; ask for explanations in simple language.',
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-emerald-500/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[5%] right-[-5%] w-[50%] h-[50%] bg-emerald-400/8 blur-[120px] rounded-full" />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col z-10 relative h-screen overflow-hidden">
        {/* Header – matches other inner pages */}
        <header className="px-10 py-5 flex justify-between items-center border-b border-emerald-200/40 dark:border-white/5 bg-emerald-50/20 dark:bg-slate-900/40 backdrop-blur-sm transition-colors">
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Zap size={16} className="text-white" />
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                CrashCost
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: 'New Claim', path: '/dashboard', icon: Upload },
                { label: 'History', path: '/analytics', icon: BarChart3 },
                { label: 'XAI Lab', path: '/xai-lab', icon: Brain },
                { label: 'Insurance 101', path: '/insurance-101', icon: FileText },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    location.pathname === item.path
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
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">
                Authenticated
              </p>
              <p className="text-base font-black text-slate-950 dark:text-white">
                {user?.name || 'User'}
              </p>
            </div>
            <div className="w-11 h-11 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center font-black text-white text-base">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {/* Title + disclaimer */}
          <Reveal>
            <div className="max-w-4xl mb-10">
              <h1 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tighter mb-3">
                Insurance 101 – Stay Claim-Ready
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-base mb-4">
                This page gives a simple, non-legal overview of common car insurance concepts so
                you can make smarter decisions before and after a claim.
              </p>
              <div className="flex items-start gap-3 text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/40 rounded-xl px-4 py-3 max-w-xl">
                <AlertCircle size={16} className="mt-[2px]" />
                <p className="leading-relaxed">
                  Laws and rules are different in every country and even state. This is **not**
                  legal advice – always check your policy wording and local regulations.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
            {/* Left column – fundamentals */}
            <div className="lg:col-span-2 space-y-8">
              <Reveal delay={0.05}>
                <section className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-emerald-100/60 dark:border-white/10 rounded-[2rem] p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                        Foundations
                      </p>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        Core Building Blocks
                      </h2>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {fundamentals.map((card, idx) => (
                      <div
                        key={card.title}
                        className="border border-emerald-100/70 dark:border-emerald-500/20 rounded-2xl p-5 bg-emerald-50/40 dark:bg-emerald-500/5"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-slate-900/60 flex items-center justify-center text-emerald-500">
                            <card.icon size={18} />
                          </div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                            {card.title}
                          </h3>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                          {card.points.map((pt) => (
                            <li key={pt} className="flex items-start gap-2">
                              <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>

              <Reveal delay={0.1}>
                <section className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 rounded-[2rem] p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center">
                      <Info size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Money Concepts
                      </p>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        Premium, Payout & Smart Choices
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {moneyConcepts.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/60 p-5 flex flex-col"
                      >
                        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-3">
                          {item.desc}
                        </p>
                        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium flex-1">
                          {item.details.map((d) => (
                            <li key={d} className="flex items-start gap-2">
                              <CheckCircle2
                                size={14}
                                className="mt-[2px] text-emerald-500 shrink-0"
                              />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            </div>

            {/* Right column – quick checklist */}
            <Reveal delay={0.15}>
              <aside className="space-y-6">
                <section className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-emerald-100/70 dark:border-emerald-500/20 rounded-[2rem] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Car size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                        Before You Drive
                      </p>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                        Quick Legal Checklist
                      </h3>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <li className="flex gap-2">
                      <CheckCircle2 size={14} className="mt-[2px] text-emerald-500" />
                      <span>Keep a valid driving license and registration in the car.</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 size={14} className="mt-[2px] text-emerald-500" />
                      <span>
                        Ensure mandatory third-party cover is active – many regions treat driving
                        without it as a serious offence.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 size={14} className="mt-[2px] text-emerald-500" />
                      <span>Know your insurer’s helpline number and claim intimation process.</span>
                    </li>
                  </ul>
                </section>

                <section className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-[2rem] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center">
                      <Globe size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Good Habits
                      </p>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                        To Protect Future Claims
                      </h3>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {goodHabits.map((tip) => (
                      <li key={tip} className="flex gap-2">
                        <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </aside>
            </Reveal>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InsuranceGuidePage;

