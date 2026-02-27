import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronLeft, Upload, 
  CheckCircle, ArrowLeft, Activity,
  Car, Shield, Info, LayoutDashboard, History, Settings as SettingsIcon, LogOut
} from 'lucide-react';

// --- MOCK STORE ---
const useMockStore = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [claimData, setClaimData] = useState({
    vehicleDetails: { vin: '', year: '', make: '', model: '', color: '', mileage: '' },
    incidentDetails: { date: '', location: '', description: '', drivingConditions: '' },
    uploadedImages: []
  });

  const updateVehicleDetails = (data) => setClaimData(prev => ({ ...prev, vehicleDetails: { ...prev.vehicleDetails, ...data } }));
  const updateIncidentDetails = (data) => setClaimData(prev => ({ ...prev, incidentDetails: { ...prev.incidentDetails, ...data } }));
  const addImages = (files) => {
    const newImages = files.map(file => ({
      id: Math.random().toString(36),
      name: file.name,
      preview: URL.createObjectURL(file)
    }));
    setClaimData(prev => ({ ...prev, uploadedImages: [...prev.uploadedImages, ...newImages] }));
  };
  const removeImage = (id) => setClaimData(prev => ({ ...prev, uploadedImages: prev.uploadedImages.filter(img => img.id !== id) }));

  return { currentStep, setCurrentStep, claimData, updateVehicleDetails, updateIncidentDetails, addImages, removeImage };
};

// --- AESTHETIC COMPONENTS ---

const NavItem = ({ icon: Icon, active }) => (
  <div className={`p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/30' : 'text-slate-400 hover:bg-white/50 hover:text-slate-600'}`}>
    <Icon size={20} />
  </div>
);

const InputGroup = ({ label, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500/70 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#10b981] transition-colors">
        <Icon size={16} />
      </div>
      <input 
        {...props}
        className="w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-[#10b981]/10 focus:border-[#10b981]/40 transition-all placeholder:text-slate-300 shadow-sm"
      />
    </div>
  </div>
);

// --- STEP COMPONENTS ---

function VehicleDetailsStep({ store }) {
  const { claimData, updateVehicleDetails } = store;
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Vehicle Identity</h2>
        <p className="text-slate-500 text-sm font-medium">Specify the car associated with this claim.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputGroup label="VIN" icon={Shield} value={claimData.vehicleDetails.vin} onChange={(e) => updateVehicleDetails({ vin: e.target.value })} placeholder="Enter 17-digit VIN" />
        <InputGroup label="Model Year" icon={Info} type="number" value={claimData.vehicleDetails.year} onChange={(e) => updateVehicleDetails({ year: e.target.value })} placeholder="e.g. 2024" />
        <InputGroup label="Make" icon={Car} value={claimData.vehicleDetails.make} onChange={(e) => updateVehicleDetails({ make: e.target.value })} placeholder="e.g. Volvo" />
        <InputGroup label="Model" icon={Activity} value={claimData.vehicleDetails.model} onChange={(e) => updateVehicleDetails({ model: e.target.value })} placeholder="e.g. EX30" />
      </div>
    </div>
  );
}

function IncidentDetailsStep({ store }) {
  const { claimData, updateIncidentDetails } = store;
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Incident Log</h2>
        <p className="text-slate-500 text-sm font-medium">Help the AI contextualize the impact.</p>
      </div>
      <div className="space-y-5">
        <InputGroup label="Date of Occurrence" icon={Info} type="date" value={claimData.incidentDetails.date} onChange={(e) => updateIncidentDetails({ date: e.target.value })} />
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500/70 ml-1">Contextual Description</label>
          <textarea 
            className="w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl p-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-[#10b981]/10 focus:border-[#10b981]/40 transition-all h-32 resize-none shadow-sm"
            value={claimData.incidentDetails.description} 
            onChange={(e) => updateIncidentDetails({ description: e.target.value })} 
            placeholder="Briefly explain the nature of the collision..."
          />
        </div>
      </div>
    </div>
  );
}

function ImageUploadStep({ store }) {
  const { claimData, addImages, removeImage } = store;
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Visual Evidence</h2>
        <p className="text-slate-500 text-sm font-medium">Upload clear photos for YOLOv11 segmentation.</p>
      </div>
      <div className="border-2 border-dashed border-slate-300/50 rounded-[2rem] p-10 text-center bg-white/20 backdrop-blur-sm group hover:border-[#10b981]/40 transition-all shadow-inner">
        <Upload className="mx-auto h-10 w-10 text-slate-400 mb-4 group-hover:scale-110 group-hover:text-[#10b981] transition-all" />
        <label className="cursor-pointer bg-slate-900 text-white px-8 py-3 rounded-full font-bold text-xs hover:bg-black transition-all shadow-lg inline-block">
          Select Visuals
          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => addImages(Array.from(e.target.files))} />
        </label>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-4 tracking-widest">Supports JPG, PNG up to 10MB</p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {claimData.uploadedImages.map(img => (
          <div key={img.id} className="relative shrink-0 rounded-2xl overflow-hidden h-24 w-24 border-2 border-white shadow-md">
            <img src={img.preview} className="w-full h-full object-cover" />
            <button onClick={() => removeImage(img.id)} className="absolute inset-0 bg-red-500/80 opacity-0 hover:opacity-100 transition-opacity text-white text-[10px] font-black uppercase">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewStep({ store }) {
  const { claimData } = store;
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Validation</h2>
        <p className="text-slate-500 text-sm font-medium">Verify claim parameters before AI analysis.</p>
      </div>
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl space-y-4 shadow-sm">
        <div className="flex justify-between border-b border-black/5 pb-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</span>
          <span className="text-sm font-black text-slate-800">{claimData.vehicleDetails.year || '---'} {claimData.vehicleDetails.make || '---'} {claimData.vehicleDetails.model}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidence</span>
          <span className="text-sm font-black text-slate-800">{claimData.uploadedImages.length} Visuals Attached</span>
        </div>
      </div>
    </div>
  );
}

function SubmitStep() {
  return (
    <div className="space-y-6 text-center py-10">
      <div className="w-20 h-20 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle className="w-10 h-10 text-[#10b981]" />
      </div>
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Analysis Initiated</h2>
      <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm">The CrashCost engine is processing your visuals for structural damage. Results will appear in your history shortly.</p>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const store = useMockStore(); 
  const { currentStep, setCurrentStep } = store;
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { id: 1, label: 'Vehicle', component: VehicleDetailsStep },
    { id: 2, label: 'Incident', component: IncidentDetailsStep },
    { id: 3, label: 'Visuals', component: ImageUploadStep },
    { id: 4, label: 'Review', component: ReviewStep },
    { id: 5, label: 'Analyze', component: SubmitStep },
  ];

  const StepComponent = steps[currentStep - 1].component;

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep(currentStep + 1);
      }, 2500); 
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  return (
    <div className="min-h-screen bg-[#f3f5f7] flex relative overflow-hidden font-sans">
      
      {/* --- NEW ANIMATED BACKGROUND --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#10b981]/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-blue-400/10 blur-[100px] rounded-full"></div>
        <div className="absolute top-[20%] right-[15%] w-[30%] h-[30%] bg-purple-400/5 blur-[100px] rounded-full"></div>
      </div>

      {/* Sidebar (Desktop Only) */}
      <aside className="hidden lg:flex w-20 flex-col items-center py-8 bg-white/40 backdrop-blur-2xl border-r border-white/60 z-10 relative">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black mb-12 shadow-lg">Q</div>
        <div className="flex flex-col gap-6">
          <NavItem icon={LayoutDashboard} active />
          <NavItem icon={History} />
          <NavItem icon={SettingsIcon} />
        </div>
        <div className="mt-auto">
          <NavItem icon={LogOut} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col z-10 relative">
        
        {/* Top Header Section */}
        <header className="px-8 py-6 flex justify-between items-center">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-[#10b981] transition-all group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Exit to Home
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Authenticated</p>
              <p className="text-sm font-bold text-slate-800">Adjuster Session</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-md bg-gradient-to-tr from-slate-200 to-white flex items-center justify-center font-bold text-slate-600">S</div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            
            {/* Dynamic Progress Indicator */}
            <div className="flex justify-between items-center mb-12 relative px-4">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -translate-y-[15px] z-0"></div>
              <div 
                className="absolute top-1/2 left-0 h-[2px] bg-[#10b981] -translate-y-[15px] z-0 transition-all duration-1000 ease-out" 
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              ></div>
              {steps.map((step) => (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] transition-all duration-500 shadow-sm ${
                    currentStep >= step.id ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20 scale-110' : 'bg-white text-slate-300 border border-white'
                  }`}>
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <span className={`text-[9px] font-black uppercase mt-3 tracking-tighter transition-colors duration-500 ${currentStep >= step.id ? 'text-slate-800' : 'text-slate-300'}`}>{step.label}</span>
                </div>
              ))}
            </div>

            {/* Main Glass Wizard Card */}
            <div className="bg-white/50 backdrop-blur-3xl border border-white/80 rounded-[3rem] p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] min-h-[480px] flex flex-col justify-between transition-all hover:shadow-[0_45px_90px_-20px_rgba(0,0,0,0.08)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isProcessing ? 'processing' : currentStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                >
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="relative mb-8">
                        <div className="w-24 h-24 rounded-full border-4 border-[#10b981]/10 border-t-[#10b981] animate-spin"></div>
                        <Activity className="absolute inset-0 m-auto text-[#10b981]" size={28} />
                      </div>
                      <h2 className="text-2xl font-black tracking-tight mb-2">Analyzing Visuals...</h2>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Executing Model Inference</p>
                    </div>
                  ) : (
                    <StepComponent store={store} />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              {!isProcessing && currentStep < steps.length && (
                <div className="flex justify-between mt-12 items-center">
                  <button 
                    onClick={handleBack} 
                    disabled={currentStep === 1} 
                    className="flex items-center gap-2 px-4 py-2 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button 
                    onClick={handleNext} 
                    className="bg-[#10b981] text-white px-10 py-4 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 shadow-2xl shadow-[#10b981]/40 transition-all active:scale-95 group"
                  >
                    {currentStep === steps.length - 1 ? 'Analyze Damage' : 'Continue'} 
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
            
            <p className="text-center mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">CrashCost AI Engine v1.02.4</p>
          </div>
        </main>
      </div>
    </div>
  );
}