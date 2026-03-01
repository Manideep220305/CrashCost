// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import Sidebar from '../components/Sidebar';
// import { 
//   ChevronRight, ChevronLeft, Upload, CheckCircle, 
//   ArrowLeft, Activity, Car, Shield, Info, 
//   DollarSign, Calendar, Zap, BarChart3, TrendingUp 
// } from 'lucide-react';

// // --- 1. MOCK STORE (Handles the form data and step logic) ---
// const useMockStore = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [claimData, setClaimData] = useState({
//     vehicleDetails: { vin: '', year: '', make: '', model: '', car_model_val: '', car_age: '' },
//     incidentDetails: { date: '', location: '', description: '' },
//     uploadedImages: []
//   });

//   const updateVehicleDetails = (data) => setClaimData(prev => ({ ...prev, vehicleDetails: { ...prev.vehicleDetails, ...data } }));
//   const updateIncidentDetails = (data) => setClaimData(prev => ({ ...prev, incidentDetails: { ...prev.incidentDetails, ...data } }));
  
//   const addImages = (files) => {
//     const newImages = files.map(file => ({
//       id: Math.random().toString(36),
//       name: file.name,
//       preview: URL.createObjectURL(file)
//     }));
//     setClaimData(prev => ({ ...prev, uploadedImages: [...prev.uploadedImages, ...newImages] }));
//   };

//   const removeImage = (id) => setClaimData(prev => ({ ...prev, uploadedImages: prev.uploadedImages.filter(img => img.id !== id) }));

//   return { currentStep, setCurrentStep, claimData, updateVehicleDetails, updateIncidentDetails, addImages, removeImage };
// };

// // --- 2. UI AESTHETIC COMPONENTS ---

// const InputGroup = ({ label, icon: Icon, ...props }) => (
//   <div className="flex flex-col gap-2">
//     <label className="text-xs font-black uppercase tracking-widest text-slate-600 ml-1">{label}</label>
//     <div className="relative group">
//       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#10b981] transition-colors">
//         <Icon size={18} />
//       </div>
//       <input 
//         {...props}
//         className="w-full bg-emerald-50/50 backdrop-blur-xl border border-emerald-200/50 rounded-2xl py-4 pl-12 pr-4 text-base font-bold text-slate-950 outline-none focus:ring-4 focus:ring-[#10b981]/20 focus:border-[#10b981]/50 transition-all placeholder:text-slate-400 shadow-sm"
//       />
//     </div>
//   </div>
// );

// // --- 3. STEP CONTENT COMPONENTS ---

// function VehicleDetailsStep({ store }) {
//   const { claimData, updateVehicleDetails } = store;
//   return (
//     <div className="space-y-10">
//       <div>
//         <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">Vehicle Identity</h2>
//         <p className="text-slate-600 text-base font-medium mt-2">Capture essential tabular data for XGBoost.</p>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <InputGroup label="VIN" icon={Shield} value={claimData.vehicleDetails.vin} onChange={(e) => updateVehicleDetails({ vin: e.target.value })} placeholder="Enter 17-digit VIN" />
//         <InputGroup label="Market Value (₹)" icon={DollarSign} type="number" value={claimData.vehicleDetails.car_model_val} onChange={(e) => updateVehicleDetails({ car_model_val: e.target.value })} placeholder="Current valuation" />
//         <InputGroup label="Vehicle Age" icon={Calendar} type="number" value={claimData.vehicleDetails.car_age} onChange={(e) => updateVehicleDetails({ car_age: e.target.value })} placeholder="Years in use" />
//         <InputGroup label="Model" icon={Car} value={claimData.vehicleDetails.model} onChange={(e) => updateVehicleDetails({ model: e.target.value })} placeholder="e.g. EX30" />
//       </div>
//     </div>
//   );
// }

// function IncidentDetailsStep({ store }) {
//   const { claimData, updateIncidentDetails } = store;
//   return (
//     <div className="space-y-10">
//       <div>
//         <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">Incident Log</h2>
//         <p className="text-slate-600 text-base font-medium mt-2">Help the AI contextualize the impact.</p>
//       </div>
//       <div className="space-y-6">
//         <InputGroup label="Date of Occurrence" icon={Info} type="date" value={claimData.incidentDetails.date} onChange={(e) => updateIncidentDetails({ date: e.target.value })} />
//         <div className="flex flex-col gap-2">
//           <label className="text-xs font-black uppercase tracking-widest text-slate-600 ml-1">Contextual Description</label>
//           <textarea 
//             className="w-full bg-emerald-50/50 backdrop-blur-xl border border-emerald-200/50 rounded-2xl p-5 text-base font-bold text-slate-950 outline-none focus:ring-4 focus:ring-[#10b981]/20 focus:border-[#10b981]/50 transition-all h-36 resize-none shadow-sm placeholder:text-slate-400"
//             value={claimData.incidentDetails.description} 
//             onChange={(e) => updateIncidentDetails({ description: e.target.value })} 
//             placeholder="Briefly explain the nature of the collision..."
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// function ImageUploadStep({ store }) {
//   const { claimData, addImages, removeImage } = store;
//   return (
//     <div className="space-y-10">
//       <div>
//         <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">Visual Evidence</h2>
//         <p className="text-slate-600 text-base font-medium mt-2">Upload clear photos for YOLOv11 segmentation.</p>
//       </div>
//       <div className="border-2 border-dashed border-emerald-300/60 rounded-[2rem] p-12 text-center bg-emerald-50/40 backdrop-blur-sm group hover:border-[#10b981]/60 hover:bg-emerald-100/50 transition-all shadow-sm">
//         <Upload className="mx-auto h-12 w-12 text-slate-500 mb-5 group-hover:scale-110 group-hover:text-[#10b981] transition-all" />
//         <label className="cursor-pointer bg-slate-950 text-white px-10 py-4 rounded-full font-bold text-sm hover:bg-black transition-all shadow-xl inline-block">
//           Select Visuals
//           <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => addImages(Array.from(e.target.files))} />
//         </label>
//       </div>
//       <div className="flex gap-4 overflow-x-auto pb-4">
//         {claimData.uploadedImages.map(img => (
//           <div key={img.id} className="relative shrink-0 rounded-2xl overflow-hidden h-28 w-28 border-2 border-white shadow-md">
//             <img src={img.preview} className="w-full h-full object-cover" />
//             <button onClick={() => removeImage(img.id)} className="absolute inset-0 bg-red-500/90 opacity-0 hover:opacity-100 transition-opacity text-white text-xs font-black uppercase tracking-wider">Remove</button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function ReviewStep({ store }) {
//   const { claimData } = store;
//   return (
//     <div className="space-y-10">
//       <div>
//         <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">Validation</h2>
//         <p className="text-slate-600 text-base font-medium mt-2">Verify claim parameters before AI analysis.</p>
//       </div>
//       <div className="bg-emerald-50/50 backdrop-blur-xl border border-emerald-200/50 p-8 rounded-3xl space-y-6 shadow-sm">
//         <div className="flex justify-between items-center border-b border-emerald-100 pb-4">
//           <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Subject</span>
//           <span className="text-lg font-black text-slate-950">{claimData.vehicleDetails.year || '---'} {claimData.vehicleDetails.make || '---'} {claimData.vehicleDetails.model}</span>
//         </div>
//         <div className="flex justify-between items-center">
//           <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Evidence</span>
//           <span className="text-lg font-black text-slate-950">{claimData.uploadedImages.length} Visuals Attached</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// function SubmitStep() {
//   return (
//     <div className="space-y-8 text-center py-16">
//       <div className="w-24 h-24 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-200/50">
//         <CheckCircle className="w-12 h-12 text-[#10b981]" />
//       </div>
//       <h2 className="text-5xl font-black text-slate-950 tracking-tighter">Analysis Initiated</h2>
//       <p className="text-slate-600 font-medium max-w-sm mx-auto text-base">The CrashCost engine is processing your visuals. Results will appear shortly.</p>
//     </div>
//   );
// }

// // --- 4. MAIN PAGE COMPONENT ---
// export default function DashboardPage() {
//   const navigate = useNavigate();
//   const store = useMockStore(); 
//   const { currentStep, setCurrentStep } = store;
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [loadingText, setLoadingText] = useState("");

//   const steps = [
//     { id: 1, label: 'Vehicle', component: VehicleDetailsStep },
//     { id: 2, label: 'Incident', component: IncidentDetailsStep },
//     { id: 3, label: 'Visuals', component: ImageUploadStep },
//     { id: 4, label: 'Review', component: ReviewStep },
//     { id: 5, label: 'Analyze', component: SubmitStep },
//   ];

//   const StepComponent = steps[currentStep - 1].component;

//   const handleNext = () => {
//     if (currentStep === steps.length - 1) {
//       setIsProcessing(true);
//       setLoadingText("Initializing YOLOv11 Segmentation...");

//       // Dynamic 10-second processing sequence
//       setTimeout(() => setLoadingText("Applying OpenCV Edge Detection & Math..."), 2000);
//       setTimeout(() => setLoadingText("Running XGBoost Cost Estimation..."), 4000);
//       setTimeout(() => setLoadingText("Generating Gemini XAI Reasoning..."), 6000);
//       setTimeout(() => setLoadingText("Verifying against Global Insurance DB..."), 8000);

//       setTimeout(() => {
//         setIsProcessing(false);
//         setCurrentStep(currentStep + 1);
//       }, 10000); 
//     } else if (currentStep < steps.length) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const handleBack = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#e6f2eb] flex relative overflow-hidden font-sans">
      
//       {/* Mesh Gradient Background (Enhanced Green Tint) */}
//       <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-[#10b981]/25 blur-[140px] rounded-full animate-pulse"></div>
//         <div className="absolute bottom-[5%] right-[-5%] w-[50%] h-[50%] bg-emerald-400/15 blur-[120px] rounded-full"></div>
//       </div>

//       <Sidebar />

//       <div className="flex-1 flex flex-col z-10 relative h-screen overflow-hidden">
//         {/* Navbar */}
//         <header className="px-10 py-6 flex justify-between items-center border-b border-emerald-200/40 bg-emerald-50/20 backdrop-blur-sm">
//           <button 
//             onClick={() => navigate('/')} 
//             className="flex items-center gap-2 text-slate-600 font-black text-xs uppercase tracking-widest hover:text-[#10b981] transition-all group"
//           >
//             <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Exit to Home
//           </button>
//           <div className="flex items-center gap-5">
//              <div className="text-right hidden sm:block">
//                 <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">Authenticated</p>
//                 <p className="text-base font-black text-slate-950">Manideep Katta</p>
//              </div>
//              <div className="w-12 h-12 rounded-full bg-white border-2 border-emerald-200 shadow-sm flex items-center justify-center font-black text-slate-800 text-lg">M</div>
//           </div>
//         </header>

//         {/* Main Content Area: THREE-COLUMN GRID */}
//         <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-10 p-6 lg:p-10 overflow-y-auto">
          
//           {/* CENTER: THE WIZARD (Span 8 out of 12 columns) */}
//           <div className="xl:col-span-8 flex flex-col items-center">
            
//             {/* Step Progress Header */}
//             <div className="w-full max-w-4xl mb-14 relative px-6">
//               <div className="absolute top-1/2 left-0 w-full h-[3px] bg-emerald-200/60 -translate-y-[15px] z-0 rounded-full"></div>
//               <div 
//                 className="absolute top-1/2 left-0 h-[3px] bg-[#10b981] -translate-y-[15px] z-0 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_#10b981]" 
//                 style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
//               ></div>
//               <div className="flex justify-between w-full">
//                 {steps.map((step) => (
//                   <div key={step.id} className="relative z-10 flex flex-col items-center">
//                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 shadow-md ${
//                       currentStep >= step.id ? 'bg-[#10b981] text-white scale-110' : 'bg-white text-slate-400 border-2 border-emerald-100'
//                     }`}>
//                       {currentStep > step.id ? '✓' : step.id}
//                     </div>
//                     <span className={`text-[10px] font-black uppercase mt-4 tracking-wider transition-colors duration-500 absolute top-full whitespace-nowrap ${currentStep >= step.id ? 'text-slate-950' : 'text-slate-400'}`}>{step.label}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Glassmorphic Wizard Card */}
//             <div className="w-full max-w-4xl bg-emerald-50/50 backdrop-blur-3xl border border-emerald-200/50 rounded-[3rem] p-10 md:p-14 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.08)] min-h-[520px] flex flex-col justify-between">
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={isProcessing ? 'processing' : currentStep}
//                   initial={{ opacity: 0, y: 15 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -15 }}
//                   transition={{ duration: 0.5 }}
//                 >
//                   {isProcessing ? (
//                     <div className="flex flex-col items-center justify-center py-32 text-center">
//                       <div className="w-28 h-28 rounded-full border-4 border-[#10b981]/20 border-t-[#10b981] animate-spin flex items-center justify-center mb-8">
//                         <Activity className="text-[#10b981]" size={32} />
//                       </div>
//                       <h2 className="text-3xl font-black text-slate-950 tracking-tighter">Processing Data...</h2>
                      
//                       {/* Dynamic Loading Sequence */}
//                       <motion.p 
//                         key={loadingText}
//                         initial={{ opacity: 0, y: 5 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-3"
//                       >
//                         {loadingText}
//                       </motion.p>

//                     </div>
//                   ) : (
//                     <StepComponent store={store} />
//                   )}
//                 </motion.div>
//               </AnimatePresence>

//               {/* Fixed Navigation Buttons */}
//               {!isProcessing && currentStep < steps.length && (
//                 <div className="flex justify-between mt-16 items-center">
//                   <button 
//                     onClick={handleBack} 
//                     className={`flex items-center gap-2 px-6 py-4 font-black text-xs uppercase tracking-widest transition-all ${
//                       currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-slate-950'
//                     }`}
//                   >
//                     <ChevronLeft size={18} /> Previous Step
//                   </button>

//                   <button 
//                     onClick={handleNext} 
//                     className="bg-[#10b981] text-white px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-600 shadow-xl shadow-[#10b981]/30 transition-all active:scale-95 group"
//                   >
//                     {currentStep === steps.length - 1 ? 'Analyze Claims' : 'Continue'} 
//                     <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* RIGHT: ANALYTICS PREVIEW PANEL (Lighter & Higher Contrast) */}
//           <div className="xl:col-span-4 hidden xl:flex flex-col gap-8 sticky top-4">
            
//             {/* Real-time Status Card */}
//             <div className="bg-emerald-50/60 backdrop-blur-3xl p-8 rounded-[3rem] shadow-sm border border-emerald-200/50 space-y-6">
//               <div className="flex items-center gap-3 text-[#10b981] font-black uppercase text-xs tracking-[0.2em] mb-4"><Activity size={18} /> Live System Status</div>
//               <div className="space-y-5">
//                 <StatusItem label="Inference Engine" status="Active" color="text-emerald-600" />
//                 <StatusItem label="Gemini Lab Link" status="Standby" color="text-amber-500" />
//                 <StatusItem label="Database Sync" status="Healthy" color="text-blue-500" />
//               </div>
//             </div>

//             {/* Quick Analytics Card */}
//             <div className="bg-emerald-50/60 backdrop-blur-3xl p-8 rounded-[3rem] shadow-sm border border-emerald-200/50 flex-1 flex flex-col">
//               <div className="flex items-center gap-3 text-slate-500 font-black uppercase text-xs tracking-[0.2em] mb-8"><BarChart3 size={18} /> Fleet Overview</div>
              
//               <div className="space-y-8 flex-1">
//                 <MiniStat label="Avg Confidence" val="94.2%" icon={Zap} />
//                 <MiniStat label="Daily Claims" val="24" icon={TrendingUp} />
                
//                 <div className="pt-8 mt-4 border-t border-emerald-100">
//                   <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 text-center">Inference Latency</p>
//                   <div className="flex items-end justify-center gap-2 h-20">
//                     {[40, 70, 45, 90, 65, 30, 85].map((h, i) => (
//                       <motion.div 
//                         key={i} 
//                         initial={{ height: 0 }} 
//                         animate={{ height: `${h}%` }} 
//                         className="w-3 bg-[#10b981]/30 rounded-full hover:bg-[#10b981] transition-colors"
//                       />
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               <button onClick={() => navigate('/analytics')} className="mt-8 w-full py-5 bg-white/80 border border-emerald-200/50 shadow-sm rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:text-[#10b981] hover:border-[#10b981]/50 transition-all">
//                 View Full History
//               </button>
//             </div>

//           </div>

//         </main>
//       </div>
//     </div>
//   );
// }

// // Helper components for the Analytics Preview Panel
// const StatusItem = ({ label, status, color }) => (
//   <div className="flex justify-between items-center border-b border-emerald-100/60 pb-3 last:border-0">
//     <span className="text-sm font-bold text-slate-600">{label}</span>
//     <span className={`text-xs font-black uppercase tracking-widest ${color}`}>{status}</span>
//   </div>
// );

// const MiniStat = ({ label, val, icon: Icon }) => (
//   <div className="flex items-center gap-5">
//     <div className="p-4 bg-emerald-100/60 rounded-2xl text-[#10b981]"><Icon size={22} /></div>
//     <div>
//       <p className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none mb-2">{label}</p>
//       <p className="text-2xl font-black text-slate-950">{val}</p>
//     </div>
//   </div>
// );
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { 
  ChevronRight, ChevronLeft, Upload, CheckCircle, 
  ArrowLeft, Activity, Car, Shield, Info, 
  DollarSign, Calendar, Zap, BarChart3, TrendingUp, Brain 
} from 'lucide-react';

// --- 1. MOCK STORE (Handles the form data and step logic) ---
const useMockStore = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [claimData, setClaimData] = useState({
    vehicleDetails: { vin: '', year: '', make: '', model: '', car_model_val: '', car_age: '' },
    incidentDetails: { date: '', location: '', description: '' },
    uploadedImages: []
  });
  
  const [reportResult, setReportResult] = useState(null); 
  const [currentClaimId, setCurrentClaimId] = useState(null);

  const updateVehicleDetails = (data) => setClaimData(prev => ({ ...prev, vehicleDetails: { ...prev.vehicleDetails, ...data } }));
  const updateIncidentDetails = (data) => setClaimData(prev => ({ ...prev, incidentDetails: { ...prev.incidentDetails, ...data } }));
  
  const addImages = (files) => {
    const newImages = files.map(file => ({
      id: Math.random().toString(36),
      name: file.name,
      preview: URL.createObjectURL(file),
      rawFile: file 
    }));
    setClaimData(prev => ({ ...prev, uploadedImages: [...prev.uploadedImages, ...newImages] }));
  };

  const removeImage = (id) => setClaimData(prev => ({ ...prev, uploadedImages: prev.uploadedImages.filter(img => img.id !== id) }));

  return { currentStep, setCurrentStep, claimData, updateVehicleDetails, updateIncidentDetails, addImages, removeImage, reportResult, setReportResult, currentClaimId, setCurrentClaimId };
};

// --- 2. UI AESTHETIC COMPONENTS ---

const InputGroup = ({ label, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-black uppercase tracking-widest text-slate-600 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#10b981] transition-colors">
        <Icon size={18} />
      </div>
      <input 
        {...props}
        className="w-full bg-emerald-50/50 backdrop-blur-xl border border-emerald-200/50 rounded-2xl py-4 pl-12 pr-4 text-base font-bold text-slate-950 outline-none focus:ring-4 focus:ring-[#10b981]/20 focus:border-[#10b981]/50 transition-all placeholder:text-slate-400 shadow-sm"
      />
    </div>
  </div>
);

// --- 3. STEP CONTENT COMPONENTS ---

function VehicleDetailsStep({ store }) {
  const { claimData, updateVehicleDetails } = store;
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">Vehicle Identity</h2>
        <p className="text-slate-600 text-base font-medium mt-2">Capture essential tabular data for XGBoost.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup label="VIN" icon={Shield} value={claimData.vehicleDetails.vin} onChange={(e) => updateVehicleDetails({ vin: e.target.value })} placeholder="Enter 17-digit VIN" />
        <InputGroup label="Market Value (₹)" icon={DollarSign} type="number" value={claimData.vehicleDetails.car_model_val} onChange={(e) => updateVehicleDetails({ car_model_val: e.target.value })} placeholder="Current valuation" />
        <InputGroup label="Vehicle Age" icon={Calendar} type="number" value={claimData.vehicleDetails.car_age} onChange={(e) => updateVehicleDetails({ car_age: e.target.value })} placeholder="Years in use" />
        <InputGroup label="Model" icon={Car} value={claimData.vehicleDetails.model} onChange={(e) => updateVehicleDetails({ model: e.target.value })} placeholder="e.g. EX30" />
      </div>
    </div>
  );
}

function IncidentDetailsStep({ store }) {
  const { claimData, updateIncidentDetails } = store;
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">Incident Log</h2>
        <p className="text-slate-600 text-base font-medium mt-2">Help the AI contextualize the impact.</p>
      </div>
      <div className="space-y-6">
        <InputGroup label="Date of Occurrence" icon={Info} type="date" value={claimData.incidentDetails.date} onChange={(e) => updateIncidentDetails({ date: e.target.value })} />
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-600 ml-1">Contextual Description</label>
          <textarea 
            className="w-full bg-emerald-50/50 backdrop-blur-xl border border-emerald-200/50 rounded-2xl p-5 text-base font-bold text-slate-950 outline-none focus:ring-4 focus:ring-[#10b981]/20 focus:border-[#10b981]/50 transition-all h-36 resize-none shadow-sm placeholder:text-slate-400"
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
    <div className="space-y-10">
      <div>
        <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">Visual Evidence</h2>
        <p className="text-slate-600 text-base font-medium mt-2">Upload clear photos for YOLOv11 segmentation.</p>
      </div>
      <div className="border-2 border-dashed border-emerald-300/60 rounded-[2rem] p-12 text-center bg-emerald-50/40 backdrop-blur-sm group hover:border-[#10b981]/60 hover:bg-emerald-100/50 transition-all shadow-sm">
        <Upload className="mx-auto h-12 w-12 text-slate-500 mb-5 group-hover:scale-110 group-hover:text-[#10b981] transition-all" />
        <label className="cursor-pointer bg-slate-950 text-white px-10 py-4 rounded-full font-bold text-sm hover:bg-black transition-all shadow-xl inline-block">
          Select Visuals
          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => addImages(Array.from(e.target.files))} />
        </label>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {claimData.uploadedImages.map(img => (
          <div key={img.id} className="relative shrink-0 rounded-2xl overflow-hidden h-28 w-28 border-2 border-white shadow-md">
            <img src={img.preview} className="w-full h-full object-cover" />
            <button onClick={() => removeImage(img.id)} className="absolute inset-0 bg-red-500/90 opacity-0 hover:opacity-100 transition-opacity text-white text-xs font-black uppercase tracking-wider">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewStep({ store }) {
  const { claimData } = store;
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">Validation</h2>
        <p className="text-slate-600 text-base font-medium mt-2">Verify claim parameters before AI analysis.</p>
      </div>
      <div className="bg-emerald-50/50 backdrop-blur-xl border border-emerald-200/50 p-8 rounded-3xl space-y-6 shadow-sm">
        <div className="flex justify-between items-center border-b border-emerald-100 pb-4">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Subject</span>
          <span className="text-lg font-black text-slate-950">{claimData.vehicleDetails.year || '---'} {claimData.vehicleDetails.make || '---'} {claimData.vehicleDetails.model}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Evidence</span>
          <span className="text-lg font-black text-slate-950">{claimData.uploadedImages.length} Visuals Attached</span>
        </div>
      </div>
    </div>
  );
}

function SubmitStep() {
  return (
    <div className="space-y-8 text-center py-16">
      <div className="w-24 h-24 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-200/50">
        <CheckCircle className="w-12 h-12 text-[#10b981]" />
      </div>
      <h2 className="text-5xl font-black text-slate-950 tracking-tighter">Analysis Initiated</h2>
      <p className="text-slate-600 font-medium max-w-sm mx-auto text-base">The CrashCost engine is processing your visuals. Results will appear shortly.</p>
    </div>
  );
}

function AssessmentReport({ data, onReset, store }) {
  const { report, claimId } = data;

  const displayConfidence = Array.isArray(report?.confidence) 
    ? report.confidence[0] 
    : report?.confidence || "0.00";

  const displayDamageRatio = Array.isArray(report?.damage_ratio)
    ? report.damage_ratio[0]
    : report?.damage_ratio || "0%";

  const realCost = report?.total_cost;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="space-y-8"
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black text-slate-950 tracking-tighter">AI Assessment</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
            Report ID: {claimId?.substring(0, 12) || 'CC-NEW'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Estimate</p>
          <p className="text-5xl font-black text-slate-950 tracking-tighter">
            ₹{realCost ? realCost.toLocaleString() : "---"}
          </p>
        </div>
      </div>

      {store.claimData.uploadedImages.length > 0 && (
        <div className="w-full h-48 rounded-[2rem] overflow-hidden border-2 border-emerald-100/50 relative group shadow-sm">
          <img 
            src={store.claimData.uploadedImages[0].preview} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt="Analyzed Evidence"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap size={14} /> YOLOv11 Segmentation Complete
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/50">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">AI Confidence</p>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-black text-slate-950">{displayConfidence}</p>
            <div className="flex-1 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
               <div className="h-full bg-[#10b981]" style={{ width: `${displayConfidence * 100}%` }}></div>
            </div>
          </div>
        </div>
        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Damage Ratio</p>
          <p className="text-2xl font-black text-slate-950">{displayDamageRatio}</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detected Damage</p>
        {(report?.part_name || []).map((part, i) => (
          <div key={i} className="flex justify-between items-center p-4 bg-white/60 border border-emerald-100/30 rounded-2xl shadow-sm">
            <span className="text-sm font-bold text-slate-800 uppercase">{part}</span>
            <span className="text-xs font-black text-emerald-600 uppercase">
              {report?.damage_type?.[i] || "Damaged"}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          onClick={() => window.location.href=`/xai-lab?claimId=${claimId}`} 
          className="flex-1 bg-slate-950 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
        >
          <Brain size={16} /> Explain Logic
        </button>
        <button 
          onClick={onReset}
          className="flex-1 border-2 border-emerald-100 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all"
        >
          New Claim
        </button>
      </div>
    </motion.div>
  );
}

// --- 4. MAIN PAGE COMPONENT ---
export default function DashboardPage() {
  const navigate = useNavigate();
  const store = useMockStore(); 
  
  const { currentStep, setCurrentStep, claimData, setReportResult, setCurrentClaimId } = store; 
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const steps = [
    { id: 1, label: 'Vehicle', component: VehicleDetailsStep },
    { id: 2, label: 'Incident', component: IncidentDetailsStep },
    { id: 3, label: 'Visuals', component: ImageUploadStep },
    { id: 4, label: 'Review', component: ReviewStep },
    { id: 5, label: 'Analyze', component: (props) => 
        props.store.reportResult ? 
        // THIS IS THE FIX: Packaging the report and the DB ID together so XAI gets the claimId
        <AssessmentReport 
          data={{ report: props.store.reportResult, claimId: props.store.currentClaimId }} 
          onReset={() => window.location.reload()} 
          store={props.store} 
        /> : 
        <SubmitStep /> 
    },
  ];

  const StepComponent = steps[currentStep - 1].component;

  const handleAnalyze = async () => {
    setIsProcessing(true);
    setLoadingText("Initializing YOLOv11 Segmentation...");

    setTimeout(() => setLoadingText("Applying OpenCV Edge Detection & Math..."), 2000);
    setTimeout(() => setLoadingText("Running XGBoost Cost Estimation..."), 4000);
    setTimeout(() => setLoadingText("Generating Gemini XAI Reasoning..."), 6000);
    setTimeout(() => setLoadingText("Verifying against Global Insurance DB..."), 8000);

    try {
      const formData = new FormData();
      if (claimData.uploadedImages.length > 0) {
        formData.append('image', claimData.uploadedImages[0].rawFile);
      }

      formData.append('vehicleDetails', JSON.stringify(claimData.vehicleDetails));
      formData.append('incidentDetails', JSON.stringify(claimData.incidentDetails));

      const response = await fetch('http://localhost:5000/api/segment-car', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      console.log("--- [DEBUG] Server Response Received ---");
      console.log(data); 

      if (data.success) {
        setReportResult(data.report); 
        setCurrentClaimId(data.claimId); 
        setIsProcessing(false);
        setCurrentStep(5); 
      } else {
        alert("Analysis failed: " + data.details);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Network error connecting to backend.");
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleAnalyze(); 
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#e6f2eb] flex relative overflow-hidden font-sans">
      
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-[#10b981]/25 blur-[140px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[5%] right-[-5%] w-[50%] h-[50%] bg-emerald-400/15 blur-[120px] rounded-full"></div>
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col z-10 relative h-screen overflow-hidden">
        <header className="px-10 py-6 flex justify-between items-center border-b border-emerald-200/40 bg-emerald-50/20 backdrop-blur-sm">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-slate-600 font-black text-xs uppercase tracking-widest hover:text-[#10b981] transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Exit to Home
          </button>
          <div className="flex items-center gap-5">
             <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">Authenticated</p>
                <p className="text-base font-black text-slate-950">Sai Manideep Katta</p>
             </div>
             <div className="w-12 h-12 rounded-full bg-white border-2 border-emerald-200 shadow-sm flex items-center justify-center font-black text-slate-800 text-lg">M</div>
          </div>
        </header>

        <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-10 p-6 lg:p-10 overflow-y-auto">
          
          <div className="xl:col-span-8 flex flex-col items-center">
            
            <div className="w-full max-w-4xl mb-14 relative px-6">
              <div className="absolute top-1/2 left-0 w-full h-[3px] bg-emerald-200/60 -translate-y-[15px] z-0 rounded-full"></div>
              <div 
                className="absolute top-1/2 left-0 h-[3px] bg-[#10b981] -translate-y-[15px] z-0 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_#10b981]" 
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              ></div>
              <div className="flex justify-between w-full">
                {steps.map((step) => (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 shadow-md ${
                      currentStep >= step.id ? 'bg-[#10b981] text-white scale-110' : 'bg-white text-slate-400 border-2 border-emerald-100'
                    }`}>
                      {currentStep > step.id ? '✓' : step.id}
                    </div>
                    <span className={`text-[10px] font-black uppercase mt-4 tracking-wider transition-colors duration-500 absolute top-full whitespace-nowrap ${currentStep >= step.id ? 'text-slate-950' : 'text-slate-400'}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-4xl bg-emerald-50/50 backdrop-blur-3xl border border-emerald-200/50 rounded-[3rem] p-10 md:p-14 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.08)] min-h-[520px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isProcessing ? 'processing' : currentStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5 }}
                >
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                      <div className="w-28 h-28 rounded-full border-4 border-[#10b981]/20 border-t-[#10b981] animate-spin flex items-center justify-center mb-8">
                        <Activity className="text-[#10b981]" size={32} />
                      </div>
                      <h2 className="text-3xl font-black text-slate-950 tracking-tighter">Processing Data...</h2>
                      
                      <motion.p 
                        key={loadingText}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-3"
                      >
                        {loadingText}
                      </motion.p>

                    </div>
                  ) : (
                    <StepComponent store={store} />
                  )}
                </motion.div>
              </AnimatePresence>

              {!isProcessing && currentStep < steps.length && (
                <div className="flex justify-between mt-16 items-center">
                  <button 
                    onClick={handleBack} 
                    className={`flex items-center gap-2 px-6 py-4 font-black text-xs uppercase tracking-widest transition-all ${
                      currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-slate-950'
                    }`}
                  >
                    <ChevronLeft size={18} /> Previous Step
                  </button>

                  <button 
                    onClick={handleNext} 
                    className="bg-[#10b981] text-white px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-600 shadow-xl shadow-[#10b981]/30 transition-all active:scale-95 group"
                  >
                    {currentStep === steps.length - 1 ? 'Analyze Claims' : 'Continue'} 
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-4 hidden xl:flex flex-col gap-8 sticky top-4">
            
            <div className="bg-emerald-50/60 backdrop-blur-3xl p-8 rounded-[3rem] shadow-sm border border-emerald-200/50 space-y-6">
              <div className="flex items-center gap-3 text-[#10b981] font-black uppercase text-xs tracking-[0.2em] mb-4"><Activity size={18} /> Live System Status</div>
              <div className="space-y-5">
                <StatusItem label="Inference Engine" status="Active" color="text-emerald-600" />
                <StatusItem label="Gemini Lab Link" status="Standby" color="text-amber-500" />
                <StatusItem label="Database Sync" status="Healthy" color="text-blue-500" />
              </div>
            </div>

            <div className="bg-emerald-50/60 backdrop-blur-3xl p-8 rounded-[3rem] shadow-sm border border-emerald-200/50 flex-1 flex flex-col">
              <div className="flex items-center gap-3 text-slate-500 font-black uppercase text-xs tracking-[0.2em] mb-8"><BarChart3 size={18} /> Fleet Overview</div>
              
              <div className="space-y-8 flex-1">
                <MiniStat label="Avg Confidence" val="94.2%" icon={Zap} />
                <MiniStat label="Daily Claims" val="24" icon={TrendingUp} />
                
                <div className="pt-8 mt-4 border-t border-emerald-100">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 text-center">Inference Latency</p>
                  <div className="flex items-end justify-center gap-2 h-20">
                    {[40, 70, 45, 90, 65, 30, 85].map((h, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ height: 0 }} 
                        animate={{ height: `${h}%` }} 
                        className="w-3 bg-[#10b981]/30 rounded-full hover:bg-[#10b981] transition-colors"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => navigate('/analytics')} className="mt-8 w-full py-5 bg-white/80 border border-emerald-200/50 shadow-sm rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:text-[#10b981] hover:border-[#10b981]/50 transition-all">
                View Full History
              </button>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

// Helper components for the Analytics Preview Panel
const StatusItem = ({ label, status, color }) => (
  <div className="flex justify-between items-center border-b border-emerald-100/60 pb-3 last:border-0">
    <span className="text-sm font-bold text-slate-600">{label}</span>
    <span className={`text-xs font-black uppercase tracking-widest ${color}`}>{status}</span>
  </div>
);

const MiniStat = ({ label, val, icon: Icon }) => (
  <div className="flex items-center gap-5">
    <div className="p-4 bg-emerald-100/60 rounded-2xl text-[#10b981]"><Icon size={22} /></div>
    <div>
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none mb-2">{label}</p>
      <p className="text-2xl font-black text-slate-950">{val}</p>
    </div>
  </div>
);