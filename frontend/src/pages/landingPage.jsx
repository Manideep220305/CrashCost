import React, { useState } from 'react';
import { 
  Upload, CheckCircle2, Send, 
  MapPin, User, ArrowLeft, Mic, Paperclip, 
  Settings, UserCircle, Maximize2, Sliders,
  Camera, Eye, ShieldCheck, History, Activity, Database, Server, ChevronRight, Zap
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import NoDamageCar from '../assets/NoDamageCarNobg.png';
import LightlyDamagedCar from '../assets/LightDamage.png';
import HighDamagedCar from '../assets/HeavyDamage.png';

const LandingPage = () => {
  const navigate = useNavigate(); // <-- THIS IS THE MISSING PIECE!

  const [damageLevel, setDamageLevel] = useState(0);
  const [activeAngle, setActiveAngle] = useState('Front');
  
  const carImages = [NoDamageCar, LightlyDamagedCar, HighDamagedCar];
  
  // Dynamic Chart Data
  const estimates = [0, 6779, 21500];
  const chartFillPercentages = [0, 35, 85]; 

  // Function to advance the simulation
  const triggerAnalysis = () => {
    setDamageLevel((prev) => (prev + 1) % 3);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#e9ecef] flex flex-col font-sans text-slate-800 selection:bg-[#10b981] selection:text-white">
      
      {/* ========================================= */}
      {/* 1. HERO & DASHBOARD WORKSPACE             */}
      {/* ========================================= */}
      <div className="p-4 lg:p-8 flex flex-col min-h-screen relative overflow-hidden">
        
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10b981]/10 blur-[120px] rounded-full pointer-events-none"></div>

        <header className="flex justify-between items-center w-full z-30 relative max-w-7xl 2xl:max-w-[1600px] mx-auto pointer-events-auto">
          <div className="w-12 h-12 flex items-center justify-center font-black text-3xl tracking-tighter text-slate-800">Q</div>
          
          <nav className="hidden md:flex bg-[#e9ecef] rounded-full p-1.5 gap-1 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
            {[
              { name: 'Live Scan', icon: <Camera size={14}/> },
              { name: 'History', icon: <History size={14}/> },
              { name: 'Policies', icon: <ShieldCheck size={14}/> }
            ].map((item) => (
              <button 
                key={item.name} 
                className={`px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
                  item.name === 'Live Scan' 
                    ? 'bg-[#e9ecef] text-slate-800 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]' 
                    : 'text-gray-500 hover:text-slate-700'
                }`}
              >
                {item.icon} {item.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 lg:gap-4">
            <button className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-600 bg-[#e9ecef] px-4 lg:px-5 py-2.5 rounded-full shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:scale-105 transition-transform">
              <MapPin size={14} className="text-[#10b981]" /> Hyderabad, Telangana, India
            </button>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-[#e9ecef] px-4 lg:px-5 py-2.5 rounded-full shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:scale-105 transition-transform"
            >
              <User size={14} /> Login
            </button>
          </div>
        </header>

        <main className="flex-1 w-full relative mt-8 lg:mt-12 mb-8 flex flex-col justify-center min-h-[450px] lg:min-h-[550px] max-w-7xl 2xl:max-w-[1600px] mx-auto">
          
          <div className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 flex-col gap-5 pointer-events-auto">
            <IconButton icon={<ArrowLeft size={20} />} />
            <div className="h-4"></div>
            <IconButton icon={<UserCircle size={20} />} />
            <IconButton icon={<Sliders size={20} />} />
          </div>

          <div className="absolute left-0 lg:left-24 top-0 z-20 pointer-events-auto">
            <h1 className="text-5xl lg:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 tracking-tighter leading-none mb-2 drop-shadow-sm">
              CrashCost
            </h1>
            <p className="text-[#10b981] text-sm lg:text-base mb-6 font-bold tracking-widest uppercase">
              AI Claim Intelligence
            </p>
            
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Select Angle</span>
              <div className="flex gap-2">
                {['Front', 'Left', 'Right', 'Rear'].map(angle => (
                  <button 
                    key={angle} 
                    onClick={() => setActiveAngle(angle)}
                    className={`px-4 h-8 lg:h-9 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                      angle === activeAngle 
                        ? 'bg-[#10b981] text-white shadow-md shadow-[#10b981]/30 scale-105' 
                        : 'bg-[#e9ecef] text-gray-500 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:scale-105'
                    }`}
                  >
                    {angle}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div 
            onClick={triggerAnalysis}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[45%] z-40 w-[100%] md:w-[95%] lg:w-[85%] xl:w-[80%] max-w-[1300px] cursor-pointer group hover:scale-[1.01] transition-transform duration-500 pointer-events-auto"
          >
            <img 
              src={carImages[damageLevel]} 
              alt="CrashCost Vehicle Analysis" 
              className="w-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)] mix-blend-darken transition-all duration-700 group-hover:drop-shadow-[0_35px_35px_rgba(16,185,129,0.2)]"
            />
          </div>

          <div className="absolute right-0 top-0 lg:top-4 z-50 w-[340px] lg:w-[380px] xl:w-[400px] bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 lg:p-7 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] transition-all pointer-events-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg leading-tight mb-1">CrashCost Engine</h3>
                <p className="text-[10px] lg:text-[11px] text-gray-500 leading-snug font-medium">Generate a quantified damage report<br/>and cost estimate from images.</p>
              </div>
              <button className="text-gray-400 hover:text-gray-800 p-1 rounded-full transition-colors">✕</button>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 mb-6">
              <Feature icon={<CheckCircle2 size={16} className="text-slate-800"/>} title="Gatekeeper:" desc="Vehicle Validation" />
              <Feature icon={<div className="w-4 h-4 rounded-full border-[2.5px] border-slate-800 border-t-transparent animate-spin"/>} title="Geometric" desc="Severity Calculation" />
              <Feature icon={<CheckCircle2 size={16} className="text-slate-800"/>} title="Damage &" desc="Part Segmentation" />
              <Feature icon={<Settings size={16} className="text-slate-800"/>} title="ML Cost" desc="Forecasting (XGBoost)" />
            </div>

            <div className="bg-white/60 backdrop-blur-md border border-white p-3 rounded-xl text-[11px] text-gray-600 mb-5 shadow-sm font-medium leading-relaxed">
              Scanning <strong>{activeAngle}</strong> quadrant. 
              {damageLevel === 0 ? " No structural damage detected yet." : " Detected structural paint abrasion and panel deformation."}
              <span className="animate-pulse font-black text-[#10b981] ml-1">|</span>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-white/60 backdrop-blur-md border border-white rounded-full flex items-center px-4 py-2 gap-2 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.03)] focus-within:ring-2 focus-within:ring-[#10b981]/50 transition-all">
                <Mic size={14} className="text-gray-400 cursor-pointer hover:text-[#10b981]" />
                <Paperclip size={14} className="text-gray-400 cursor-pointer hover:text-[#10b981]" />
                <input type="text" placeholder="Ask CrashCost..." className="bg-transparent border-none outline-none text-xs w-full font-semibold placeholder:text-gray-400 text-slate-800" />
              </div>
              
              <button 
                onClick={triggerAnalysis}
                className="bg-[#10b981] text-white px-5 rounded-full hover:bg-emerald-600 transition-all shadow-[0_8px_16px_-6px_#10b981] flex items-center justify-center gap-2 font-semibold text-xs cursor-pointer active:scale-95"
              >
                Send <Send size={12} />
              </button>
            </div>
          </div>
        </main>

        {/* 6-CARD DASHBOARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-30 relative max-w-7xl 2xl:max-w-[1600px] mx-auto w-full pb-8 pointer-events-auto">
          
          <BaseCard title="Assessment Upload Center">
            <div className="border border-dashed border-gray-300 bg-gray-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-[160px] hover:border-[#10b981]/50 transition-colors group cursor-pointer">
              <div className="mb-2 group-hover:scale-110 transition-transform"><Upload size={24} className="text-[#10b981]" /></div>
              <p className="text-xs text-slate-800 font-semibold">Drop images here or click to upload</p>
              <p className="text-[9px] text-gray-400 mt-1 uppercase font-medium">Required angles: Front, Rear, Sides</p>
              <button className="mt-4 bg-[#10b981] text-white px-6 py-2 rounded-full text-[11px] font-semibold hover:bg-emerald-600 transition-colors">
                Browse Files
              </button>
            </div>
          </BaseCard>

          <BaseCard title="AI Analysis Workflow Status">
            <div className="space-y-4 px-2 mt-2">
              <WorkflowStep num="1" text="Image Validation" state="done" />
              <WorkflowStep num="2" text="Geometric Severity" state={damageLevel > 0 ? "done" : "loading"} />
              <WorkflowStep num="3" text="Damage & Part Segmentation" state={damageLevel > 1 ? "done" : (damageLevel === 1 ? "loading" : "pending")} />
              <WorkflowStep num="4" text="Cost Forecasting" state={damageLevel === 2 ? "done" : "pending"} />
            </div>
          </BaseCard>

          <BaseCard title="Claim Value Breakdown">
            <div className="flex items-center gap-6 mt-4">
              <div className="relative w-24 h-24 lg:w-32 lg:h-32 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="12" fill="transparent" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="#10b981" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * chartFillPercentages[damageLevel]) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-in-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
                  <span className="text-[9px] font-semibold text-gray-500 leading-none">Estimate:</span>
                  <span className="text-sm font-bold text-slate-800 mt-1 transition-all duration-500">
                    ₹{estimates[damageLevel].toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 text-[11px] font-medium text-gray-600">
                <div className="flex items-center gap-2 cursor-default"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> Parts Replacement (50%)</div>
                <div className="flex items-center gap-2 cursor-default"><span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Labor Costs (30%)</div>
                <div className="flex items-center gap-2 cursor-default"><span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span> Other Costs (20%)</div>
              </div>
            </div>
            <div className="absolute bottom-6 right-6">
              <button className="bg-gray-50 hover:bg-[#10b981] hover:text-white text-gray-700 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wide border border-gray-200 transition-colors duration-300 shadow-sm">
                Export Claim PDF ✦
              </button>
            </div>
          </BaseCard>

          <BaseCard title="YOLOv11 & MobileNet Metrics">
            <div className="grid grid-cols-2 gap-4 mt-2 h-[160px] content-center">
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 hover:shadow-md transition-shadow">
                <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Confidence Score</div>
                <div className="text-2xl font-light text-slate-800">98.4<span className="text-sm text-emerald-500 font-bold">%</span></div>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Inference Time</div>
                <div className="text-2xl font-light text-slate-800">42<span className="text-sm text-gray-400 font-bold">ms</span></div>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-[11px] font-medium text-gray-500 mt-2">
                <Activity size={14} className="text-[#10b981]" /> Model weights loaded via GPU acceleration.
              </div>
            </div>
          </BaseCard>

          <BaseCard title="Recent Assessments">
            <div className="space-y-3 mt-4 w-full">
              {[
                { vin: 'VIN: ENE073...9', status: 'Completed', amt: '₹1,55k' },
                { vin: 'VIN: WBA341...2', status: 'Processing', amt: 'Pending' },
                { vin: 'VIN: JTM789...1', status: 'Flagged', amt: 'Manual Review' }
              ].map((scan, i) => (
                <div key={i} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3">
                    <Database size={14} className="text-[#10b981]" />
                    <span className="text-xs font-semibold text-slate-700">{scan.vin}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-[10px] font-bold ${scan.status === 'Completed' ? 'text-[#10b981]' : scan.status === 'Processing' ? 'text-amber-500' : 'text-red-500'}`}>{scan.status}</div>
                    <div className="text-[10px] text-gray-500">{scan.amt}</div>
                  </div>
                </div>
              ))}
            </div>
          </BaseCard>

          <BaseCard title="Node.js API Connection">
            <div className="flex flex-col h-[160px] justify-center mt-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]"></span>
                  </span>
                  <span className="text-xs font-bold text-slate-700">API Gateway Connected</span>
                </div>
                <span className="text-[10px] font-mono text-gray-400">Port 5000</span>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-4 text-green-400 font-mono text-[10px] leading-relaxed shadow-[inset_0_4px_6px_rgba(0,0,0,0.3)]">
                &gt; POST /api/v1/analyze-damage 200 OK <br/>
                &gt; Segmenting bounding boxes... <br/>
                &gt; Generating claim payload... <br/>
                <span className="text-gray-500 animate-pulse">Waiting for next request_</span>
              </div>
            </div>
          </BaseCard>

        </div>
      </div>

      {/* ========================================= */}
      {/* 4. LANDING PAGE EXPANSION (How it works)  */}
      {/* ========================================= */}
      <section className="w-full bg-white py-20 px-4 border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light text-slate-800 mb-4">How <span className="font-bold text-[#10b981]">CrashCost</span> Works</h2>
            <p className="text-gray-500">Powered by advanced Computer Vision to automate claims in seconds.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard icon={<Camera size={24}/>} title="1. Capture" desc="Upload multi-angle photos of the vehicle from the accident scene." />
            <StepCard icon={<Zap size={24}/>} title="2. Analyze" desc="Our YOLOv11 models instantly detect and segment panel damage." />
            <StepCard icon={<Server size={24}/>} title="3. Estimate" desc="Cost forecasting is generated via machine learning algorithms." />
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 5. CALL TO ACTION (CTA)                   */}
      {/* ========================================= */}
      <section className="w-full bg-slate-900 py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-light text-white mb-6">Ready to revolutionize your claims?</h2>
          <p className="text-slate-400 mb-10 text-sm lg:text-base">Join the FinTech revolution. Cut down manual assessment time by 90% with our automated AI pipeline.</p>
          <button className="bg-[#10b981] text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 transform flex items-center gap-2 mx-auto duration-300">
            Integrate API Now <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* ========================================= */}
      {/* 6. FOOTER                                 */}
      {/* ========================================= */}
      <footer className="w-full bg-slate-950 py-10 px-6 text-center lg:text-left border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-black text-slate-900">Q</div>
            <span className="text-white font-bold tracking-wide">CrashCost AI</span>
          </div>
          <p className="text-slate-500 text-xs">© 2026 CrashCost. Designed for modern FinTech hackathons.</p>
          <div className="flex gap-6 text-xs font-semibold text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

// ------------------------------------------------------------------
// REUSABLE UI COMPONENTS
// ------------------------------------------------------------------

const IconButton = ({ icon }) => (
  <button className="w-10 h-10 lg:w-12 lg:h-12 bg-[#e9ecef] flex items-center justify-center rounded-xl lg:rounded-2xl text-gray-500 hover:text-[#10b981] shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] transition-all hover:scale-105 active:scale-95">
    {icon}
  </button>
);

const Feature = ({ icon, title, desc }) => (
  <div className="flex items-start gap-2">
    <div className="mt-0.5">{icon}</div>
    <div>
      <div className="text-[11px] lg:text-xs font-bold text-slate-800 leading-tight">{title}</div>
      <div className="text-[9px] lg:text-[10px] text-gray-500 leading-tight mt-0.5">{desc}</div>
    </div>
  </div>
);

const BaseCard = ({ title, children }) => (
  <div className="bg-white/70 backdrop-blur-xl border border-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative flex flex-col hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-shadow duration-300">
    <button className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 transition-colors">
      <Maximize2 size={14} />
    </button>
    <h4 className="font-semibold text-sm mb-4 text-slate-700">{title}</h4>
    <div className="flex-1 relative">
      {children}
    </div>
  </div>
);

const WorkflowStep = ({ num, text, state }) => {
  let icon;
  if (state === 'done') {
    icon = <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center text-white"><CheckCircle2 size={12}/></div>;
  } else if (state === 'loading') {
    icon = <div className="w-5 h-5 rounded-full border-2 border-[#10b981] border-r-transparent animate-spin flex items-center justify-center"><div className="w-2 h-2 bg-[#10b981] rounded-full"></div></div>;
  } else {
    icon = <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">{num}</div>;
  }

  return (
    <div className={`flex items-center gap-4 transition-opacity ${state === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
      {icon}
      <span className={`text-xs ${state === 'pending' ? 'font-medium text-gray-500' : 'font-semibold text-slate-800'}`}>
        {num}. {text}
      </span>
    </div>
  );
};

const StepCard = ({ icon, title, desc }) => (
  <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group">
    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-[#10b981] group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;