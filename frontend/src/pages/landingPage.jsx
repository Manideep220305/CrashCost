import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';
import { 
  Upload, CheckCircle2, Send, MapPin, User, ArrowLeft, Mic, Paperclip, 
  Settings, UserCircle, Maximize2, Sliders, Camera, Eye, ShieldCheck, 
  History, Activity, Database, Server, ChevronRight, Zap, 
  Cpu, BrainCircuit, Network, Sparkles 
} from 'lucide-react';

import NoDamageCar from '../assets/NoDamageCarNobg.png';
import LightlyDamagedCar from '../assets/LightDamage.png';
import HighDamagedCar from '../assets/HeavyDamage.png';

// --- REUSABLE 3D TILT CARD COMPONENT ---
const TiltCard = ({ title, desc, icon: Icon, color }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth physics for the tilt
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div style={{ perspective: 1000 }} className="h-full w-full">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full w-full rounded-3xl bg-white/70 backdrop-blur-xl border border-white p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] cursor-pointer"
      >
        {/* TransformZ creates the 3D pop-out effect on the content inside */}
        <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }} className="flex flex-col items-center text-center">
          <div className={`p-4 rounded-2xl mb-6 bg-gradient-to-br ${color} text-white shadow-xl`}>
             <Icon size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight mb-3">{title}</h3>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">{desc}</p>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const LandingPage = () => {
  const navigate = useNavigate();
  const [damageLevel, setDamageLevel] = useState(0);
  const [activeAngle, setActiveAngle] = useState('Front');
  
  const carImages = [NoDamageCar, LightlyDamagedCar, HighDamagedCar];
  const estimates = [0, 6779, 21500];
  const chartFillPercentages = [0, 35, 85]; 

  const triggerAnalysis = (e) => {
    if (e) e.stopPropagation(); 
    setDamageLevel((prev) => (prev + 1) % 3);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#e9ecef] flex flex-col font-sans text-slate-800 selection:bg-[#10b981] selection:text-white">
      
      {/* GLOBAL BACKGROUND MESH */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10b981]/10 blur-[120px] rounded-full pointer-events-none fixed"></div>

      {/* ========================================= */}
      {/* 1. HERO SECTION (Unchanged Z-Index fixed) */}
      {/* ========================================= */}
      <div className="p-4 lg:p-8 flex flex-col relative z-10">
        <header className="flex justify-between items-center w-full z-[100] relative max-w-7xl 2xl:max-w-[1600px] mx-auto">
          <div className="w-12 h-12 flex items-center justify-center font-black text-3xl tracking-tighter text-slate-800 cursor-pointer" onClick={() => navigate('/')}>Q</div>
          
          <nav className="hidden md:flex bg-[#e9ecef] rounded-full p-1.5 gap-1 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
            {['Live Scan', 'History', 'Policies'].map((item) => (
              <button key={item} className="px-6 py-2 rounded-full text-xs font-bold text-gray-500 hover:text-slate-700 transition-all">{item}</button>
            ))}
          </nav>

          <div className="flex items-center gap-3 lg:gap-4">
            <button className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-600 bg-[#e9ecef] px-4 py-2.5 rounded-full shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
              <MapPin size={14} className="text-[#10b981]" /> Hyderabad, India
            </button>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-[#e9ecef] px-4 py-2.5 rounded-full shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:scale-105 transition-all"
            >
              <User size={14} /> Login
            </button>
          </div>
        </header>

        <main className="w-full relative mt-8 lg:mt-12 mb-8 flex flex-col justify-center min-h-[450px] lg:min-h-[550px] max-w-7xl mx-auto">
          <div className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-[100] flex-col gap-5">
            <IconButton icon={<ArrowLeft size={20} />} />
            <div className="h-4"></div>
            <IconButton icon={<UserCircle size={20} />} />
            <IconButton icon={<Sliders size={20} />} />
          </div>

          <div className="absolute left-0 lg:left-24 top-0 z-[100] pointer-events-auto">
            <h1 className="text-5xl lg:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 tracking-tighter mb-2">CrashCost</h1>
            <p className="text-[#10b981] text-sm font-bold tracking-widest uppercase">AI Claim Intelligence</p>
            
            <div className="flex flex-col gap-2 mt-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Select Angle</span>
              <div className="flex gap-2">
                {['Front', 'Left', 'Right', 'Rear'].map(angle => (
                  <button 
                    key={angle} 
                    onClick={() => setActiveAngle(angle)}
                    className={`px-4 h-8 lg:h-9 flex items-center justify-center rounded-full text-xs font-bold transition-all ${angle === activeAngle ? 'bg-[#10b981] text-white shadow-md shadow-[#10b981]/30 scale-105' : 'bg-[#e9ecef] text-gray-500 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:scale-105'}`}
                  >
                    {angle}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* INTERACTIVE CAR */}
          <div 
            onClick={triggerAnalysis}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[45%] z-40 w-[100%] md:w-[95%] lg:w-[85%] xl:w-[80%] max-w-[1300px] cursor-pointer group hover:scale-[1.01] transition-transform duration-500 pointer-events-auto"
          >
            <img 
              src={carImages[damageLevel]} 
              className="w-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)] mix-blend-darken transition-all duration-700 group-hover:drop-shadow-[0_35px_35px_rgba(16,185,129,0.2)]"
            />
          </div>

          {/* FLOATING RIGHT SIDE WIDGETS */}
          <div className="absolute right-0 top-0 lg:top-4 z-[100] w-[340px] lg:w-[380px] flex flex-col gap-4 pointer-events-auto">
            
            {/* 1. Engine Card */}
            <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 shadow-xl">
               <h3 className="font-semibold text-gray-800 text-lg mb-1">CrashCost Engine</h3>
               <p className="text-[10px] text-gray-500 font-medium">Generate a quantified damage report.</p>
               <div className="bg-white/60 p-3 rounded-xl text-[11px] text-gray-600 my-4 shadow-sm">
                  Scanning <strong>{activeAngle}</strong>. {damageLevel === 0 ? "No damage detected." : "Structural abrasion detected."}
                  <span className="animate-pulse font-black text-[#10b981] ml-1">|</span>
               </div>
               <div className="flex gap-2">
                  <div className="flex-1 bg-white/60 backdrop-blur-md border border-white rounded-full flex items-center px-4 py-2 gap-2">
                    <Mic size={14} className="text-gray-400 cursor-pointer hover:text-[#10b981]" />
                    <input type="text" placeholder="Ask CrashCost..." className="bg-transparent border-none outline-none text-xs w-full font-semibold" />
                  </div>
                  <button onClick={triggerAnalysis} className="bg-[#10b981] text-white px-5 rounded-full hover:bg-emerald-600 font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                    Send <Send size={12} />
                  </button>
               </div>
            </div>

            {/* 2. Moved Claim Breakdown Card */}
            <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 shadow-xl hidden sm:block">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">Claim Breakdown</h3>
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="12" fill="transparent" />
                    <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * chartFillPercentages[damageLevel]) / 100} className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-slate-800">₹{estimates[damageLevel].toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="space-y-3 text-[10px] font-medium text-gray-600">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> Parts (50%)</div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Labor (30%)</div>
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* 6-CARD DASHBOARD GRID (Now updated with Telemetry) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-50 relative max-w-7xl mx-auto w-full pb-16 pointer-events-auto">
          <BaseCard title="Upload Center">
            <div className="border border-dashed border-gray-300 bg-gray-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-[160px] hover:border-[#10b981]/50 transition-colors cursor-pointer group">
              <Upload size={24} className="text-[#10b981] mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold">Drop images here</p>
              <button className="mt-4 bg-[#10b981] text-white px-6 py-2 rounded-full text-[11px] font-bold hover:bg-emerald-600 transition-colors">Browse</button>
            </div>
          </BaseCard>

          <BaseCard title="AI Workflow">
             <div className="space-y-4 px-2 mt-2">
                <WorkflowStep num="1" text="Image Validation" state="done" />
                <WorkflowStep num="2" text="Geometric Severity" state={damageLevel > 0 ? "done" : "loading"} />
                <WorkflowStep num="3" text="Part Segmentation" state={damageLevel > 1 ? "done" : "pending"} />
                <WorkflowStep num="4" text="Cost Forecasting" state={damageLevel === 2 ? "done" : "pending"} />
             </div>
          </BaseCard>

          <BaseCard title="Model Telemetry">
            <div className="flex flex-col justify-center h-full gap-4 mt-2">
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span className="text-gray-500">YOLOv11 Confidence</span>
                  <span className="text-[#10b981]">98.4%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#10b981] w-[98.4%] h-full rounded-full"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Inference</div>
                  <div className="text-xl font-light text-slate-800">42<span className="text-sm text-gray-400 font-bold">ms</span></div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Backend API</div>
                  <div className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Online
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      {/* ========================================= */}
      {/* 2. NEW SECTION: 3D CAPABILITY CARDS       */}
      {/* ========================================= */}
      <section className="w-full py-24 px-4 relative z-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-sm font-black text-[#10b981] tracking-[0.2em] uppercase mb-4">Under The Hood</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tighter">Enterprise-Grade AI</h3>
            <p className="text-slate-500 font-medium mt-4 max-w-2xl mx-auto">Our pipeline merges deterministic computer vision with predictive ML models to ensure zero hallucinations and absolute mathematical precision.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TiltCard 
              title="Gatekeeper (MobileNet)" 
              desc="A binary classification layer that instantly rejects bad angles or non-vehicle uploads, saving downstream GPU compute." 
              icon={Network} 
              color="from-blue-500 to-indigo-600"
            />
            <TiltCard 
              title="YOLOv11 Segmentation" 
              desc="Instance segmentation creates pixel-perfect polygon masks around dents and scratches to calculate the exact structural damage ratio." 
              icon={BrainCircuit} 
              color="from-[#10b981] to-emerald-600"
            />
            <TiltCard 
              title="XGBoost Estimator" 
              desc="Advanced regression models utilize historical insurance datasets to predict hyper-accurate part replacements and labor costs." 
              icon={Cpu} 
              color="from-amber-500 to-orange-600"
            />
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 3. REVAMPED: HOW IT WORKS (Animated Node) */}
      {/* ========================================= */}
      <section className="w-full bg-slate-900 py-32 px-4 relative z-50 overflow-hidden text-white border-y border-white/10">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-full bg-[#10b981]/5 blur-[150px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-light text-slate-300">The <span className="font-bold text-white">Automated</span> Workflow</h2>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-start gap-8 md:gap-0 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[2px] bg-slate-800 z-0">
               <motion.div 
                 initial={{ width: 0 }} 
                 whileInView={{ width: "100%" }} 
                 viewport={{ once: true }} 
                 transition={{ duration: 1.5, ease: "easeInOut" }}
                 className="h-full bg-gradient-to-r from-blue-500 via-[#10b981] to-emerald-400 shadow-[0_0_15px_#10b981]"
               ></motion.div>
            </div>

            {[
              { num: "01", title: "Capture Data", desc: "Upload 4-angle vehicle imagery via our secure API or dashboard.", icon: Camera },
              { num: "02", title: "Run Inference", desc: "Computer vision instantly isolates impact zones and maps severity.", icon: Sparkles },
              { num: "03", title: "Generate Report", desc: "Receive SHAP-explained cost estimates ready for adjuster approval.", icon: Server }
            ].map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.4 }}
                className="flex-1 flex flex-col items-center text-center relative z-10 px-6 group"
              >
                <div className="w-20 h-20 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center mb-6 group-hover:border-[#10b981] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-500">
                  <step.icon size={28} className="text-[#10b981]" />
                </div>
                <div className="text-[10px] font-black text-[#10b981] uppercase tracking-widest mb-2">Step {step.num}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 4. REVAMPED CTA (Glassmorphism + Mesh)    */}
      {/* ========================================= */}
      <section className="w-full py-32 px-4 relative z-50 overflow-hidden flex justify-center items-center">
        
        {/* Animated Background Mesh using pure CSS/Tailwind */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-[-20%] w-[70%] h-[100%] bg-gradient-to-tr from-blue-300 to-[#10b981] opacity-20 blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-0 right-[-20%] w-[70%] h-[100%] bg-gradient-to-bl from-emerald-400 to-indigo-300 opacity-20 blur-[100px]"></div>
        </div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl w-full bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[3rem] p-12 md:p-20 text-center relative z-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]"
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
             <div className="font-black text-3xl text-slate-800">Q</div>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tighter mb-6">Automate Your Claims Today.</h2>
          <p className="text-slate-600 md:text-lg mb-10 max-w-2xl mx-auto font-medium">Cut processing times from weeks to seconds. Integrate the CrashCost engine into your existing adjuster workflow.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-slate-900 text-white px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-black transition-all hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2"
            >
              Launch Dashboard <ArrowLeft className="rotate-180" size={16} />
            </button>
            <button className="bg-white/60 text-slate-800 border border-white px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white transition-all hover:scale-105 shadow-sm">
              Read Documentation
            </button>
          </div>
        </motion.div>
      </section>

      {/* ========================================= */}
      {/* 5. FOOTER                                 */}
      {/* ========================================= */}
      <footer className="w-full bg-[#e9ecef] py-10 px-8 text-center lg:text-left border-t border-slate-300/50 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center font-black text-white">Q</div>
            <span className="text-slate-900 font-black tracking-wide">CrashCost AI</span>
          </div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">© 2026 CrashCost. Engineered for Hackathons.</p>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span className="hover:text-[#10b981] cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-[#10b981] cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

// --- SMALL REUSABLE UI COMPONENTS ---
const IconButton = ({ icon }) => (
  <button className="w-10 h-10 bg-[#e9ecef] flex items-center justify-center rounded-xl text-gray-500 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:scale-105 transition-all">
    {icon}
  </button>
);

const BaseCard = ({ title, children }) => (
  <div className="bg-white/70 backdrop-blur-xl border border-white p-6 rounded-[1.5rem] shadow-sm flex flex-col h-full">
    <h4 className="font-semibold text-sm mb-4 text-slate-700">{title}</h4>
    {children}
  </div>
);

const WorkflowStep = ({ num, text, state }) => (
  <div className={`flex items-center gap-4 ${state === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${state === 'done' ? 'bg-[#10b981] text-white' : 'bg-gray-200'}`}>
      {state === 'done' ? '✓' : (state === 'loading' ? <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> : num)}
    </div>
    <span className="text-xs font-semibold">{text}</span>
  </div>
);

export default LandingPage;