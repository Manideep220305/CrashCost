import React, { useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  ChevronRight, ChevronLeft, Upload, CheckCircle,
  ArrowLeft, Activity, Car, Shield, Info,
  DollarSign, Calendar, Zap, BarChart3, TrendingUp, Brain, AlertTriangle
} from 'lucide-react';

// --- 1. MOCK STORE (Handles the form data and step logic) ---
const useMockStore = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [claimData, setClaimData] = useState({
    vehicleDetails: { vin: '', year: '', make: '', model: '', car_model_val: '', car_age: '', brand: '', tier: '', segment: '', damageLocation: '' },
    incidentDetails: { date: '', description: '' },
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

  const resetClaim = () => {
    setCurrentStep(1);
    setReportResult(null);
    setCurrentClaimId(null);
    setClaimData({
      vehicleDetails: { vin: '', year: '', make: '', model: '', car_model_val: '', car_age: '', brand: '', tier: '', segment: '', damageLocation: '' },
      incidentDetails: { date: '', description: '' },
      uploadedImages: []
    });
  };

  return { currentStep, setCurrentStep, claimData, updateVehicleDetails, updateIncidentDetails, addImages, removeImage, reportResult, setReportResult, currentClaimId, setCurrentClaimId, resetClaim };
};

// --- 2. UI AESTHETIC COMPONENTS ---

const InputGroup = ({ label, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-[#10b981] transition-colors">
        <Icon size={18} />
      </div>
      <input
        {...props}
        className="w-full bg-emerald-50/50 dark:bg-white/5 backdrop-blur-xl border border-emerald-200/50 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-base font-bold text-slate-950 dark:text-white outline-none focus:ring-4 focus:ring-[#10b981]/20 focus:border-[#10b981]/50 transition-all placeholder:text-slate-400 shadow-sm"
      />
    </div>
  </div>
);

// --- 3. STEP CONTENT COMPONENTS ---

// Custom dropdown component matching the InputGroup style
const SelectGroup = ({ label, icon: Icon, options, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-[#10b981] transition-colors">
        <Icon size={18} />
      </div>
      <select
        {...props}
        className={`w-full bg-emerald-50/50 dark:bg-white/5 backdrop-blur-xl border border-emerald-200/50 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-base font-bold outline-none focus:ring-4 focus:ring-[#10b981]/20 focus:border-[#10b981]/50 transition-all shadow-sm appearance-none cursor-pointer ${props.value ? 'text-slate-950 dark:text-white' : 'text-slate-400'}`}
      >
        <option value="" disabled>Select {label}...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="text-slate-950">{opt.label}</option>
        ))}
      </select>
    </div>
  </div>
);

function VehicleDetailsStep({ store }) {
  const { claimData, updateVehicleDetails } = store;
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tighter">Vehicle Identity</h2>
        <p className="text-slate-600 dark:text-slate-400 text-base font-medium mt-2">Capture essential vehicle data for the CrashCost AI Engine.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup label="Brand / Make" icon={Car} value={claimData.vehicleDetails.brand} onChange={(e) => updateVehicleDetails({ brand: e.target.value, make: e.target.value })} placeholder="e.g. Maruti, Hyundai, Tata" />
        <InputGroup label="Model" icon={Car} value={claimData.vehicleDetails.model} onChange={(e) => updateVehicleDetails({ model: e.target.value })} placeholder="e.g. Swift, i20, Nexon" />
        <SelectGroup label="Vehicle Tier" icon={Shield} value={claimData.vehicleDetails.tier} onChange={(e) => updateVehicleDetails({ tier: e.target.value })} options={[
          { value: 'budget', label: 'Budget (Alto, Kwid, Wagon R)' },
          { value: 'mid', label: 'Mid (Swift, i20, Baleno)' },
          { value: 'premium', label: 'Premium (Creta, Seltos, City)' },
          { value: 'luxury', label: 'Luxury (BMW, Mercedes, Audi)' }
        ]} />
        <SelectGroup label="Segment" icon={Car} value={claimData.vehicleDetails.segment} onChange={(e) => updateVehicleDetails({ segment: e.target.value })} options={[
          { value: 'hatchback', label: 'Hatchback' },
          { value: 'sedan', label: 'Sedan' },
          { value: 'suv', label: 'SUV' },
          { value: 'compact_suv', label: 'Compact SUV' }
        ]} />
        <InputGroup label="Vehicle Age (years)" icon={Calendar} type="number" value={claimData.vehicleDetails.car_age} onChange={(e) => updateVehicleDetails({ car_age: e.target.value })} placeholder="e.g. 5" />
        <SelectGroup label="Damage Location" icon={Info} value={claimData.vehicleDetails.damageLocation} onChange={(e) => updateVehicleDetails({ damageLocation: e.target.value })} options={[
          { value: 'front', label: 'Front' },
          { value: 'rear', label: 'Rear' },
          { value: 'side', label: 'Side' },
          { value: 'top', label: 'Top / Roof' }
        ]} />
        <InputGroup label="VIN (Optional)" icon={Shield} value={claimData.vehicleDetails.vin} onChange={(e) => updateVehicleDetails({ vin: e.target.value })} placeholder="17-digit Vehicle ID" />
        <InputGroup label="Market Value ₹ (Optional)" icon={DollarSign} type="number" value={claimData.vehicleDetails.car_model_val} onChange={(e) => updateVehicleDetails({ car_model_val: e.target.value })} placeholder="Current valuation" />
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

// Severity color helper
const severityColor = (severity) => {
  switch (severity) {
    case 'SEVERE': return 'text-red-600 bg-red-50 border-red-200';
    case 'MODERATE': return 'text-amber-600 bg-amber-50 border-amber-200';
    default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  }
};

function AssessmentReport({ data, onReset, store, navigate }) {
  const { report, claimId } = data;

  // New API returns: { total_estimate, estimate_range, detections, context }
  const totalEstimate = report?.total_estimate || 0;

  // Custom Frontend Actuarial Bounds
  // If price < 50k: ±15%. If price > 50k: ±8%.
  const percentageBound = totalEstimate < 50000 ? 0.15 : 0.08;
  const estimateRange = [
    Math.round(totalEstimate * (1 - percentageBound)),
    Math.round(totalEstimate * (1 + percentageBound))
  ];

  const detections = report?.detections || [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      {/* Header: Title + Total Cost */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black text-slate-950 tracking-tighter">AI Assessment</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
            Report ID: {claimId?.substring(0, 12) || 'CC-NEW'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Estimated Repair Range</p>
          <p className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">
            ₹{estimateRange[0]?.toLocaleString()} – ₹{estimateRange[1]?.toLocaleString()}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">
            Baseline Calculation: ₹{totalEstimate.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Uploaded Image Preview */}
      {store.claimData.uploadedImages.length > 0 && (
        <div className="w-full rounded-[2rem] overflow-hidden border-2 border-emerald-100/50 relative shadow-sm group bg-slate-950">
          <div className="relative w-full transition-transform duration-700 group-hover:scale-[1.02]">
            <img
              src={store.claimData.uploadedImages[0].preview}
              className="w-full h-auto block opacity-90"
              alt="Analyzed Evidence"
            />
            {/* Draw Bounding Boxes dynamically using JSON image_size */}
            {report?.image_size && detections.map(det => {
              if (!det.bbox) return null;
              const top = (det.bbox.y1 / report.image_size.height) * 100;
              const left = (det.bbox.x1 / report.image_size.width) * 100;
              const boxHeight = ((det.bbox.y2 - det.bbox.y1) / report.image_size.height) * 100;
              const boxWidth = ((det.bbox.x2 - det.bbox.x1) / report.image_size.width) * 100;
              return (
                <div
                  key={det.id}
                  className="absolute border-[3px] shadow-[0_0_20px_rgba(0,0,0,0.3)] pointer-events-none z-10 box-border"
                  style={{
                    top: `${top}%`, left: `${left}%`, width: `${boxWidth}%`, height: `${boxHeight}%`,
                    borderColor: det.severity === 'SEVERE' ? '#ef4444' : det.severity === 'MODERATE' ? '#f59e0b' : '#10b981',
                    backgroundColor: det.severity === 'SEVERE' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'
                  }}
                >
                  <span className={`absolute -top-7 left-[-3px] text-white text-[9px] font-black px-2 py-1.5 rounded-sm uppercase tracking-widest shadow-lg flex items-center gap-1 ${det.severity === 'SEVERE' ? 'bg-red-500' : det.severity === 'MODERATE' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}>
                    {det.label} ({det.severity}) - {(det.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent pt-12 pb-4 px-6 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap size={14} /> YOLOv11 + CLIP Mask Generated
            </p>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100/50 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Detections</p>
          <p className="text-2xl font-black text-slate-950">{detections.length}</p>
        </div>
        <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100/50 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Confidence</p>
          <p className="text-2xl font-black text-slate-950">
            {detections.length > 0 ? Math.round(detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length * 100) : 0}%
          </p>
        </div>
        <div className="bg-purple-50/50 p-5 rounded-3xl border border-purple-100/50 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Location</p>
          <p className="text-lg font-black text-slate-950 capitalize">{report?.context?.location || '—'}</p>
        </div>
      </div>

      {/* Detection Cards */}
      <div className="space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Damage Detections</p>
        {detections.map((det) => (
          <motion.div
            key={det.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: det.id * 0.1 }}
            className="p-5 bg-white/70 dark:bg-white/5 border border-emerald-100/40 dark:border-white/10 rounded-3xl shadow-sm space-y-3 transition-colors"
          >
            {/* Detection Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${severityColor(det.severity)}`}>
                  {det.severity}
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase">{det.label}</span>
                {det.ratio >= 0.40 && ['CRACK', 'GLASS SHATTER', 'LAMP_BROKEN', 'DENT'].includes(det.label) && (
                  <span className="bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-red-200 dark:border-red-500/30 flex items-center gap-1">
                    <AlertTriangle size={10} /> Panel Replacement Recommended
                  </span>
                )}
              </div>
              <span className="text-xl font-black text-slate-950 dark:text-white">₹{det.price?.toLocaleString()}</span>
            </div>

            {/* Summary */}
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{det.summary}</p>

            {/* Meta Row */}
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              <span>Confidence: {Math.round(det.confidence * 100)}%</span>
              <span>Surface: {det.surface_detected}</span>
              <span>Ratio: {Math.round(det.ratio * 100)}%</span>
            </div>

            {/* Cost Drivers */}
            <div className="flex gap-2 flex-wrap">
              {(det.drivers || []).map((driver, i) => (
                <span key={i} className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-500/20">
                  {driver}
                </span>
              ))}
            </div>
          </motion.div>
        ))}

        {detections.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400 font-bold">No damage detected in this image.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={() => navigate(`/xai-lab?claimId=${claimId}`)}
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
  const location = useLocation();
  const { user, logout } = useAuth();
  const store = useMockStore();

  // Route protection: redirect to landing if not logged in
  if (!user) return <Navigate to="/" replace />;

  const { currentStep, setCurrentStep, claimData, setReportResult, setCurrentClaimId } = store;
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const steps = [
    { id: 1, label: 'Vehicle', component: VehicleDetailsStep },
    { id: 2, label: 'Incident', component: IncidentDetailsStep },
    { id: 3, label: 'Visuals', component: ImageUploadStep },
    { id: 4, label: 'Review', component: ReviewStep },
    {
      id: 5, label: 'Analyze', component: (props) =>
        props.store.reportResult ?
          // THIS IS THE FIX: Packaging the report and the DB ID together so XAI gets the claimId
          <AssessmentReport
            data={{ report: props.store.reportResult, claimId: props.store.currentClaimId }}
            onReset={() => store.resetClaim()}
            store={props.store}
            navigate={navigate}
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

      // Get the JWT token from localStorage for auth
      const token = localStorage.getItem('token');

      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/segment-car`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`  // Send JWT so backend knows who's submitting
        },
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex relative overflow-hidden font-sans transition-colors duration-300">

      {/* Wavy Green Aurora */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Primary wave — sweeps left to right */}
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[45%] rounded-[50%] bg-gradient-to-r from-emerald-400/30 via-emerald-300/20 to-teal-400/25 dark:from-emerald-500/35 dark:via-emerald-400/25 dark:to-teal-500/30 blur-[80px] animate-aurora-wave"></div>
        {/* Secondary wave — sweeps right to left (counter-phase) */}
        <div className="absolute bottom-[-15%] left-[-10%] w-[130%] h-[40%] rounded-[50%] bg-gradient-to-r from-teal-300/20 via-emerald-400/25 to-emerald-300/15 dark:from-teal-500/25 dark:via-emerald-500/30 dark:to-emerald-400/20 blur-[90px] animate-aurora-wave-reverse"></div>
        {/* Subtle accent glow — center drift */}
        <div className="absolute top-[30%] left-[10%] w-[60%] h-[30%] rounded-[50%] bg-emerald-400/10 dark:bg-emerald-500/15 blur-[100px] animate-aurora"></div>
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col z-10 relative h-screen overflow-hidden">
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
                { label: 'New Claim', path: '/dashboard', icon: Upload, onClick: () => store.resetClaim() },
                { label: 'History', path: '/analytics', icon: BarChart3 },
                { label: 'XAI Lab', path: '/xai-lab', icon: Brain },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => item.onClick ? item.onClick() : navigate(item.path)}
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
            <div className="w-11 h-11 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center font-black text-white text-base">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          </div>
        </header>

        <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-10 p-6 lg:p-10 overflow-y-auto">

          <div className="xl:col-span-8 flex flex-col items-center">

            <div className="w-full max-w-4xl mb-14 mt-6 relative px-6">
              {/* Background track line — centered on step circles */}
              <div className="absolute top-5 left-6 right-6 h-[3px] bg-emerald-200/60 dark:bg-emerald-800/40 z-0 rounded-full"></div>
              {/* Active progress line */}
              <div
                className="absolute top-5 left-6 h-[3px] bg-[#10b981] z-0 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_#10b981]"
                style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - ${currentStep === steps.length ? 0 : 0}px)` }}
              ></div>
              <div className="flex justify-between w-full relative">
                {steps.map((step) => (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 shadow-md ${currentStep >= step.id ? 'bg-[#10b981] text-white scale-110 shadow-emerald-500/40' : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-emerald-100 dark:border-slate-700'
                      }`}>
                      {currentStep > step.id ? '✓' : step.id}
                    </div>
                    <span className={`text-[10px] font-black uppercase mt-3 tracking-wider transition-colors duration-500 whitespace-nowrap ${currentStep >= step.id ? 'text-slate-950 dark:text-white' : 'text-slate-400'}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-4xl bg-emerald-50/50 dark:bg-white/5 backdrop-blur-3xl border border-emerald-200/50 dark:border-white/10 rounded-[3rem] p-10 md:p-14 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.08)] min-h-[520px] flex flex-col justify-between transition-colors">
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
                    className={`flex items-center gap-2 px-6 py-4 font-black text-xs uppercase tracking-widest transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
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

          {/* RIGHT PANEL: Contextual Step Guide */}
          <div className="xl:col-span-4 hidden xl:flex flex-col gap-6 sticky top-4">

            {/* Current Step Info */}
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-3xl p-8 rounded-[2rem] shadow-sm border border-emerald-100/50 dark:border-white/10 transition-colors">
              <div className="flex items-center gap-3 text-[#10b981] font-black uppercase text-xs tracking-[0.2em] mb-5">
                <Info size={16} /> Step {currentStep} of {steps.length}
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight mb-2">
                {['Vehicle Details', 'Incident Info', 'Upload Photos', 'Review & Confirm', 'AI Analysis'][currentStep - 1]}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {[
                  'Enter your vehicle\'s brand, model, tier, and segment. This data feeds into our XGBoost cost estimation model for accurate pricing.',
                  'Provide the date and a brief description of the incident. This context helps the AI understand the nature and severity of damage.',
                  'Upload clear photos of the damaged vehicle. Our YOLOv11 model will segment and identify each damaged area automatically.',
                  'Review all the information you\'ve entered before submitting. Make sure the vehicle details and photos are accurate.',
                  'Your claim is being processed by our AI pipeline — YOLO detection, cost estimation, and explainable AI reasoning.'
                ][currentStep - 1]}
              </p>
            </div>

            {/* Tips Card (Compact, non-scrollable) */}
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-3xl p-6 rounded-[2rem] shadow-sm border border-emerald-100/50 dark:border-white/10 transition-colors">
              <div className="flex items-center gap-3 text-slate-500 font-black uppercase text-xs tracking-[0.2em] mb-4">
                <Zap size={16} className="text-amber-500 animate-pulse" /> Quick Tips
              </div>
              <div className="space-y-3">
                {[
                  { tip: 'Vehicle tier affects repair cost — luxury parts cost significantly more', show: [1] },
                  { tip: 'Older vehicles may have higher labor costs due to discontinued parts', show: [1] },
                  { tip: 'Accurate brand & model helps match OEM part pricing databases', show: [1] },
                  { tip: 'SUVs and sedans have different body panel costs — select the right segment', show: [1] },
                  { tip: 'Damage location (front vs side) changes the repair complexity significantly', show: [1] },
                  { tip: 'Detailed descriptions help our AI generate better explanations', show: [2] },
                  { tip: 'Include weather / road conditions if relevant to the incident', show: [2] },
                  { tip: 'Mentioning the speed of impact helps severity classification', show: [2] },
                  { tip: 'Exact dates help correlate with historical pricing data', show: [2] },
                  { tip: 'Note if airbags deployed — this indicates structural damage', show: [2] },
                  { tip: 'Use well-lit photos for better AI detection accuracy', show: [3] },
                  { tip: 'Close-up shots of damage areas improve cost estimates', show: [3] },
                  { tip: 'Include photos from multiple angles if possible', show: [3] },
                  { tip: 'Avoid blurry images — YOLO needs clear edges for segmentation', show: [3] },
                  { tip: 'A wide shot + close-ups gives the most accurate results', show: [3] },
                  { tip: 'Double-check vehicle details match the uploaded photos', show: [4] },
                  { tip: 'Ensure all required fields are filled for best analysis', show: [4] },
                  { tip: 'You can go back to edit any step before submitting', show: [4] },
                  { tip: 'Missing images will reduce the accuracy of damage detection', show: [4] },
                  { tip: 'Review takes a moment — our AI pipeline runs 3 models in sequence', show: [4] },
                  { tip: 'After analysis, visit XAI Lab for detailed SHAP reasoning', show: [5] },
                  { tip: 'Cost estimates include part + labor + paint breakdown', show: [5] },
                  { tip: 'Detection confidence above 85% indicates high reliability', show: [5] },
                  { tip: 'You can file a new claim anytime from the results page', show: [5] },
                  { tip: 'Claim history is saved and accessible from the Analytics page', show: [5] },
                ].filter(t => t.show.includes(currentStep)).map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-snug">{t.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Policies Widget (Light theme) */}
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-3xl p-6 rounded-[2rem] shadow-sm border border-emerald-100/50 dark:border-white/10 transition-colors hidden xl:block relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-400/20 transition-all"></div>
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300 font-black uppercase text-[10px] tracking-[0.2em]">
                  <Shield size={14} className="text-emerald-500" /> Active Policies
                </div>
                <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/30">Verified</span>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="bg-emerald-50/50 dark:bg-white/5 border border-emerald-100/50 dark:border-white/10 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <p className="text-slate-900 dark:text-white text-xs font-bold leading-none mb-1">Comprehensive Auto</p>
                    <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Pol. #IV-8820X</p>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                </div>
                <div className="bg-emerald-50/50 dark:bg-white/5 border border-emerald-100/50 dark:border-white/10 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <p className="text-slate-900 dark:text-white text-xs font-bold leading-none mb-1">Zero Depreciation</p>
                    <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Add-on Active</p>
                  </div>
                  <CheckCircle size={14} className="text-emerald-500" />
                </div>
              </div>
            </div>

            {/* View History Button */}
            <button onClick={() => navigate('/analytics')} className="w-full py-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-500/20 shadow-sm rounded-2xl text-xs font-black uppercase tracking-widest text-[#10b981] hover:bg-emerald-500 hover:text-white hover:border-[#10b981] hover:shadow-lg hover:shadow-emerald-500/20 transition-all group shrink-0">
              <span className="flex items-center justify-center gap-2">View Claim Analytics <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" /></span>
            </button>

          </div>

        </main>
      </div>
    </div>
  );
}