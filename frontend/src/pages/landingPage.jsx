import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Upload, CheckCircle2, Send, Mic,
  Camera, Sparkles, Server, ChevronRight, Zap,
  Cpu, BrainCircuit, Network, MousePointerClick,
  ArrowRight, Shield, BarChart3, Clock, XCircle, Globe, Lock, FileText
} from 'lucide-react';

// Your existing images — kept exactly as-is
import NoDamageCar from '../assets/NoDamageCarNobg.png';
import LightlyDamagedCar from '../assets/LightDamage.png';
import HighDamagedCar from '../assets/HeavyDamage.png';

// New premium components
import { useTheme } from '../context/ThemeContext';
import AuroraBackground from '../components/AuroraBackground';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import { GlowingEffect } from '../components/ui/glowing-effect';
import { cn } from '../lib/utils';

// ============================================================
// GLOWING EFFECT GRID ITEM — Aceternity UI pattern
// ============================================================
const GridItem = ({ area, icon, title, description }) => {
  return (
    <li className={cn("min-h-[14rem] list-none", area)}>
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-white/30 dark:border-white/10 p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/50 dark:border-white/5 p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(16,185,129,0.15)] md:p-6 transition-all duration-300">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-xl border-[0.75px] border-white/50 dark:border-white/10 bg-white/80 dark:bg-white/10 p-3 shadow-inner">
              <div className="text-emerald-500">
                {icon}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl leading-[1.375rem] font-black font-sans tracking-tight md:text-2xl md:leading-[1.875rem] text-balance text-slate-800 dark:text-white">
                {title}
              </h3>
              <h2 className="font-sans text-sm leading-relaxed md:text-sm font-medium text-slate-500 dark:text-slate-400">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

// ============================================================
// SCROLL REVEAL — Wraps any element with fade-up on scroll
// ============================================================
const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================================
// REUSABLE 3D TILT CARD — Your original, enhanced with dark mode
// ============================================================
const TiltCard = ({ title, desc, icon: Icon, color }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX / rect.width - 0.5);
    y.set(e.clientY / rect.height - 0.5);
  };

  return (
    <div style={{ perspective: 1000 }} className="h-full w-full">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { x.set(0); y.set(0); }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full w-full rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/70 dark:border-white/10 p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] cursor-pointer hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.15)] transition-shadow duration-500"
      >
        <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }} className="flex flex-col items-center text-center">
          <div className={`p-4 rounded-2xl mb-6 bg-gradient-to-br ${color} text-white shadow-xl`}>
            <Icon size={28} />
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight mb-3">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{desc}</p>
        </div>
      </motion.div>
    </div>
  );
};


// ============================================================
// MAIN LANDING PAGE
// ============================================================
const LandingPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // Auth modal state
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Your original interactive car state — kept exactly as-is
  const [damageLevel, setDamageLevel] = useState(0);
  const carImages = [NoDamageCar, LightlyDamagedCar, HighDamagedCar];
  const estimates = [0, 6779, 21500];
  const chartFillPercentages = [0, 35, 85];

  const triggerAnalysis = (e) => {
    if (e) e.stopPropagation();
    setDamageLevel((prev) => (prev + 1) % 3);
  };

  const openLogin = () => { setAuthMode('login'); setAuthOpen(true); };
  const openRegister = () => { setAuthMode('register'); setAuthOpen(true); };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f0f4f0] dark:bg-slate-950 flex flex-col font-sans text-slate-800 dark:text-white selection:bg-emerald-500 selection:text-white transition-colors duration-500">

      {/* Three.js Aurora + CSS Gradients */}
      <AuroraBackground isDark={isDark} />

      {/* Floating Navbar */}
      <Navbar onLoginClick={openLogin} onRegisterClick={openRegister} />

      {/* Auth Modal (Login / Register) */}
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} mode={authMode} />

      {/* ===================================== */}
      {/* 1. HERO SECTION                       */}
      {/* ===================================== */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center px-4 lg:px-8 pt-24">
        <div className="max-w-7xl mx-auto w-full relative">

          {/* Hero Text */}
          <Reveal>
            <div className="relative z-[100] max-w-xl lg:max-w-[480px] mt-8 lg:-mt-16">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">AI-Powered Damage Assessment</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 tracking-tighter mb-4 leading-[0.95]">
                CrashCost
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium max-w-md leading-relaxed">
                Upload a photo. Get an instant, AI-powered repair estimate with SHAP-explained cost breakdowns.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="group flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-500 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all"
                >
                  Try Demo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/70 dark:border-white/10 font-black text-sm uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10 hover:scale-105 transition-all"
                >
                  How It Works
                </button>
              </div>

              {/* SLEEK COST SUMMARY BAR */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-12 w-full max-w-[500px] pointer-events-auto"
              >
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">

                  <div className="flex items-center gap-4 pl-2 w-full sm:w-auto">
                    <div className={cn(
                      "w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors duration-500",
                      damageLevel === 0 ? "bg-emerald-500/10 text-emerald-500" :
                        damageLevel === 1 ? "bg-amber-500/10 text-amber-500" :
                          "bg-red-500/10 text-red-500"
                    )}>
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-0.5">Estimated Repair Cost</p>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {damageLevel === 0 ? "No structural issues detected." :
                          damageLevel === 1 ? "Minor abrasions & panel dents." :
                            "Severe impact requiring replacement."}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-black/20 rounded-2xl px-6 py-2 border border-white/50 dark:border-white/5 text-center sm:text-right w-full sm:w-auto min-w-[140px]">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Total</p>
                    <div className="flex items-center justify-center sm:justify-end font-black text-2xl text-slate-800 dark:text-white tabular-nums tracking-tighter">
                      <span className="text-sm mr-1 text-slate-400 font-bold">₹</span>
                      <motion.span
                        key={estimates[damageLevel]}
                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="inline-block"
                      >
                        {estimates[damageLevel].toLocaleString('en-IN')}
                      </motion.span>
                    </div>
                  </div>

                </div>
              </motion.div>

            </div>
          </Reveal>

          {/* INTERACTIVE CAR — Your original, enhanced */}
          <div
            onClick={triggerAnalysis}
            className="absolute left-1/2 top-[55%] lg:top-[55%] lg:left-[75%] -translate-x-1/2 -translate-y-1/2 z-40 w-[110%] md:w-[90%] lg:w-[70%] max-w-[1200px] cursor-pointer group pointer-events-auto"
          >
            <motion.img
              key={damageLevel}
              initial={{ opacity: 0.8, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={carImages[damageLevel]}
              className="w-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_35px_50px_rgba(16,185,129,0.15)] mix-blend-darken dark:mix-blend-normal transition-all duration-700 group-hover:scale-[1.02]"
              alt="Interactive car damage demo"
            />
          </div>

          {/* "Click the car" Floating Hint */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 -translate-x-1/2 bottom-4 lg:bottom-8 z-[100] flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg cursor-pointer pointer-events-auto"
            onClick={triggerAnalysis}
          >
            <MousePointerClick size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Click the car to simulate damage
            </span>
          </motion.div>


        </div>
      </section>

      {/* ===================================== */}
      {/* 2. STATS BAR — Quick metrics           */}
      {/* ===================================== */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Accuracy', val: '94.8%', icon: Shield },
            { label: 'Inference', val: '< 5s', icon: Clock },
            { label: 'Detections', val: '7 Classes', icon: Cpu },
            { label: 'SHAP-Driven', val: 'XAI Ready', icon: BarChart3 },
          ].map((stat, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-5 text-center hover:scale-105 hover:shadow-lg transition-all duration-300">
                <stat.icon size={20} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-xl font-black text-slate-900 dark:text-white">{stat.val}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===================================== */}
      {/* 3. CAPABILITY CARDS — Your 3D tilt cards */}
      {/* ===================================== */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-sm font-black text-emerald-500 tracking-[0.2em] uppercase mb-4">Under The Hood</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white tracking-tighter">Enterprise-Grade AI</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-4 max-w-2xl mx-auto">Our pipeline merges deterministic computer vision with predictive ML models to ensure zero hallucinations and mathematical precision.</p>
          </Reveal>


          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GridItem
              area=""
              icon={<Network className="h-4 w-4" />}
              title="MobileNet Gatekeeper"
              description="Binary classification layer that instantly rejects bad angles or non-vehicle uploads, saving downstream GPU compute."
            />
            <GridItem
              area=""
              icon={<Cpu className="h-4 w-4" />}
              title="CatBoost Estimator"
              description="Gradient-boosted regression trained on Indian insurance datasets for hyper-accurate repair cost prediction."
            />
            <GridItem
              area=""
              icon={<BrainCircuit className="h-4 w-4" />}
              title="YOLOv11 Segmentation"
              description="Instance segmentation creates pixel-perfect polygon masks around dents and scratches to calculate the exact structural damage ratio."
            />
            <GridItem
              area=""
              icon={<Sparkles className="h-4 w-4" />}
              title="CLIP Surface Classifier"
              description="Vision-language model identifies damaged surface material (metal, glass, plastic) for accurate part-specific pricing."
            />
            <GridItem
              area=""
              icon={<BarChart3 className="h-4 w-4" />}
              title="SHAP Explainability"
              description="Every cost estimate comes with transparent, explainable AI-driven reasoning and cost driver breakdowns."
            />
            <GridItem
              area=""
              icon={<Shield className="h-4 w-4" />}
              title="Claims Vault"
              description="MongoDB-backed secure storage for all claims and audit trails."
            />
          </ul>
        </div>
      </section>

      {/* ===================================== */}
      {/* 4. HOW IT WORKS — Your animated nodes    */}
      {/* ===================================== */}
      <section id="how-it-works" className="relative z-10 w-full bg-slate-900 dark:bg-slate-950 py-32 px-4 overflow-hidden text-white border-y border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal className="text-center mb-20">
            <h2 className="text-4xl font-light text-slate-300">The <span className="font-bold text-white">Automated</span> Workflow</h2>
          </Reveal>

          <div className="flex flex-col md:flex-row justify-center items-start gap-8 md:gap-0 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[2px] bg-slate-800 z-0">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-emerald-400 shadow-[0_0_15px_#10b981]"
              />
            </div>

            {[
              { num: "01", title: "Capture Data", desc: "Upload vehicle imagery via our secure dashboard.", icon: Camera },
              { num: "02", title: "Run Inference", desc: "YOLO + CLIP instantly isolates impact zones and maps severity.", icon: Sparkles },
              { num: "03", title: "Generate Report", desc: "Receive SHAP-explained cost estimates ready for adjuster approval.", icon: Server }
            ].map((step, index) => (
              <Reveal key={index} delay={index * 0.3} className="flex-1 flex flex-col items-center text-center relative z-10 px-6 group">
                <div className="w-20 h-20 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center mb-6 group-hover:border-emerald-500 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-500">
                  <step.icon size={28} className="text-emerald-500" />
                </div>
                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Step {step.num}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================== */}
      {/* 5. VS COMPARISON SECTION              */}
      {/* ===================================== */}
      <section className="relative z-10 w-full bg-slate-50 dark:bg-slate-900/50 py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
              Why Upgrade to <span className="text-emerald-500">CrashCost AI</span>?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-4 max-w-2xl mx-auto">
              Stop relying on manual inspections and opaque pricing. See the difference our engine makes.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Legacy Card */}
            <Reveal delay={0.1}>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 md:p-12 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Clock className="text-slate-500 dark:text-slate-400" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">Legacy Adjusting</h3>
                </div>

                <ul className="space-y-6 flex-grow">
                  {[
                    { text: "7-14 Days processing time", icon: XCircle, color: "text-red-500" },
                    { text: "Manual physical inspections", icon: XCircle, color: "text-red-500" },
                    { text: "Inconsistent, subjective pricing", icon: XCircle, color: "text-red-500" },
                    { text: "High overhead costs per claim", icon: XCircle, color: "text-red-500" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <item.icon className={`shrink-0 mt-0.5 ${item.color}`} size={20} />
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* AI Card */}
            <Reveal delay={0.2}>
              <div className="relative bg-slate-900 dark:bg-slate-950 border border-emerald-500/30 rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-emerald-500/10 h-full flex flex-col overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />

                <div className="relative z-10 flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <Zap className="text-emerald-500" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">CrashCost AI Engine</h3>
                </div>

                <ul className="relative z-10 space-y-6 flex-grow">
                  {[
                    { text: "Under 60 seconds processing", icon: CheckCircle2, color: "text-emerald-400" },
                    { text: "Automated photo analysis via App", icon: CheckCircle2, color: "text-emerald-400" },
                    { text: "Data-driven, objective pricing", icon: CheckCircle2, color: "text-emerald-400" },
                    { text: "Instantly scalable infrastructure", icon: CheckCircle2, color: "text-emerald-400" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <item.icon className={`shrink-0 mt-0.5 ${item.color}`} size={20} />
                      <span className="text-slate-300 font-medium">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================================== */}
      {/* 6. CTA — Your glassmorphism CTA          */}
      {/* ===================================== */}
      <section className="relative z-10 py-32 px-4 overflow-hidden flex justify-center items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-[-20%] w-[70%] h-[100%] bg-gradient-to-tr from-blue-300 to-emerald-500 opacity-10 dark:opacity-5 blur-[100px] animate-aurora" />
          <div className="absolute bottom-0 right-[-20%] w-[70%] h-[100%] bg-gradient-to-bl from-emerald-400 to-indigo-300 opacity-10 dark:opacity-5 blur-[100px]" />
        </div>

        <Reveal>
          <div className="max-w-4xl w-full bg-white/50 dark:bg-white/5 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[3rem] p-12 md:p-20 text-center relative z-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] mt-12">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/30">
              <Zap size={24} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tighter mb-6">Automate Your Claims Today.</h2>
            <p className="text-slate-500 dark:text-slate-400 md:text-lg mb-10 max-w-2xl mx-auto font-medium">Cut processing times from weeks to seconds. Integrate the CrashCost engine into your existing adjuster workflow.</p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="group bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 hover:shadow-2xl transition-all flex items-center justify-center gap-2"
              >
                Launch Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={openRegister}
                className="bg-white/60 dark:bg-white/5 text-slate-800 dark:text-white border border-white/70 dark:border-white/10 px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white dark:hover:bg-white/10 hover:scale-105 transition-all shadow-sm"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===================================== */}
      {/* 7. ENHANCED FOOTER                      */}
      {/* ===================================== */}
      <footer className="relative z-10 w-full bg-slate-100 dark:bg-slate-950 py-20 px-4 border-t border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Zap size={20} className="text-white fill-white" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">CrashCost</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mb-8 leading-relaxed">
              The industry-leading AI damage assessment engine for modern auto insurers and fleet managers. Next-generation computer vision meets predictive intelligence.
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:text-emerald-500 hover:border-emerald-500 transition-colors">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:text-emerald-500 hover:border-emerald-500 transition-colors">
                <Lock size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:text-emerald-500 hover:border-emerald-500 transition-colors">
                <FileText size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-emerald-500 font-medium transition-colors">Computer Vision API</a></li>
              <li><a href="#" className="text-slate-500 hover:text-emerald-500 font-medium transition-colors">Adjuster Dashboard</a></li>
              <li><a href="#" className="text-slate-500 hover:text-emerald-500 font-medium transition-colors">Mobile SDK</a></li>
              <li><a href="#" className="text-slate-500 hover:text-emerald-500 font-medium transition-colors">Pricing Models</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-emerald-500 font-medium transition-colors">About Us</a></li>
              <li><a href="#" className="text-slate-500 hover:text-emerald-500 font-medium transition-colors">Careers</a></li>
              <li><a href="#" className="text-slate-500 hover:text-emerald-500 font-medium transition-colors">Security</a></li>
              <li><a href="#" className="text-slate-500 hover:text-emerald-500 font-medium transition-colors">Contact Sales</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            © {new Date().getFullYear()} CrashCost Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="hover:text-emerald-500 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-emerald-500 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-emerald-500 cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>Launch App</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;