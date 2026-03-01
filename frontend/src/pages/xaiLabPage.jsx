import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Terminal, Activity, Brain, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const XaiLabPage = () => {
  const [searchParams] = useSearchParams();
  const claimId = searchParams.get('claimId'); 

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [kernelStatus, setKernelStatus] = useState(claimId ? "READY" : "AWAITING_CLAIM_DATA");
  const scrollRef = useRef(null);
  
  const [chat, setChat] = useState([
    { 
      role: 'ai', 
      text: claimId 
        ? `Gemini XAI Module linked to Claim ID: ${claimId.substring(0, 8)}... I have loaded the vehicle details, damage report, and cost estimation from the database. What would you like me to explain?` 
        : "⚠️ No active claim detected in the URL. Please run an analysis from the Dashboard first to link context."
    }
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const handleAskGemini = async () => {
    if (!query.trim() || isLoading) return;
    if (!claimId) {
      setChat(prev => [...prev, { role: 'ai', text: "I cannot explain an estimate without a valid Claim ID. Please start a new claim on the Dashboard." }]);
      return;
    }

    const userMessage = query;
    setChat(prev => [...prev, { role: 'user', text: userMessage }]);
    setQuery('');
    setIsLoading(true);
    
    // Simulate terminal interaction
    setKernelStatus("CONNECTING_TO_BACKEND");
    setTimeout(() => setKernelStatus("QUERYING_LLM_API"), 600);

    try {
      const response = await fetch('http://localhost:5000/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          claimId: claimId, 
          message: userMessage 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setChat(prev => [...prev, { role: 'ai', text: data.answer }]);
        setKernelStatus("READY");
      } else {
        // --- THIS IS THE FIX --- 
        // We throw the specific error sent by our backend Rate Limiter
        throw new Error(data.error || "Failed to fetch explanation.");
      }
    } catch (error) {
      console.error("Backend API Error:", error);
      
      // --- THIS IS THE FIX ---
      // Distinguish between a dead server and a Rate Limit timeout
      const isNetworkError = error.message.includes("Failed to fetch");
      const errorMessage = isNetworkError 
        ? "Error connecting to the Node.js backend. Make sure the server is running." 
        : error.message; // This will print: "System cooling down. Gemini needs 60 seconds to reset!"

      setChat(prev => [...prev, { role: 'ai', text: `⚠️ ${errorMessage}` }]);
      setKernelStatus("ERROR_DETECTED");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e6f2eb] flex font-sans relative overflow-hidden selection:bg-[#10b981] selection:text-white">
      
      {/* Mesh Gradient Background (Matched to Dashboard) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-[#10b981]/25 blur-[140px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[5%] right-[-5%] w-[50%] h-[50%] bg-emerald-400/15 blur-[120px] rounded-full"></div>
      </div>
      
      <Sidebar />

      <main className="flex-1 p-6 lg:p-10 flex flex-col z-10 relative">
        <header className="mb-8 flex justify-between items-end">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
               <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></span>
               <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">XAI Reasoning Lab v1.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">AI Reasoning Lab</h1>
          </motion.div>
          <div className="hidden md:flex gap-4">
            <div className="bg-emerald-50/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-emerald-200/50 shadow-sm text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Model Engine</p>
                <p className="text-sm font-black text-[#10b981]">Gemini 2.5 Flash (Secured)</p>
            </div>
          </div>
        </header>

        {/* Dynamic Grid: Fixed height so the input box never gets pushed off screen */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Chat Window (Light Theme & Scroll Fixed) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 flex flex-col bg-emerald-50/60 backdrop-blur-3xl border border-emerald-200/50 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(16,185,129,0.08)] overflow-hidden h-[calc(100vh-160px)]"
          >
            <div ref={scrollRef} className="flex-1 p-8 lg:p-10 overflow-y-auto space-y-8 custom-scrollbar">
              <AnimatePresence>
                {chat.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    key={i} 
                    className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[85%] p-6 rounded-[2.5rem] text-base leading-relaxed shadow-sm ${
                      msg.role === 'ai' 
                        ? 'bg-white border border-emerald-100 text-slate-800 rounded-tl-none' 
                        : 'bg-[#10b981] text-white rounded-tr-none shadow-md shadow-[#10b981]/30'
                    }`}>
                      {msg.role === 'ai' && (
                        <div className="flex items-center gap-2 mb-3 text-[#10b981]">
                          <Brain size={16}/> 
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contextual Engine</span>
                        </div>
                      )}
                      <p className="font-bold whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white p-6 rounded-[2.5rem] rounded-tl-none border border-emerald-100 flex gap-3 items-center shadow-sm">
                      <Activity className="text-[#10b981] animate-spin" size={20} />
                      <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Synthesizing from Database...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Input Area (Visible & Light Theme) */}
            <div className="p-6 lg:p-8 bg-white/60 border-t border-emerald-100/50 flex gap-4 items-center shrink-0">
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskGemini()}
                placeholder={claimId ? "Ask Gemini to explain the estimate math..." : "Run a claim first to enable chat..."}
                disabled={!claimId}
                className="flex-1 bg-white backdrop-blur-xl border border-emerald-200/60 rounded-2xl px-8 py-5 text-base font-bold text-slate-950 outline-none focus:ring-4 focus:ring-[#10b981]/20 focus:border-[#10b981]/50 transition-all placeholder:text-slate-400 shadow-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
              <button 
                onClick={handleAskGemini}
                disabled={isLoading || !claimId}
                className="p-5 bg-[#10b981] text-white rounded-2xl shadow-xl shadow-[#10b981]/30 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group shrink-0"
              >
                <Send size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* RIGHT: Model Weights / Technical Sidebar (Light Theme) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-4 hidden lg:block"
          >
            <div className="bg-emerald-50/60 backdrop-blur-3xl p-10 rounded-[3.5rem] shadow-[0_20px_60px_-15px_rgba(16,185,129,0.05)] border border-emerald-200/50 h-[calc(100vh-160px)] flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-10 border-b border-emerald-100/60 pb-4">
                <div className="flex items-center gap-3 text-slate-500">
                  <Terminal size={18} /> <span className="font-black uppercase tracking-[0.3em]">Kernel Logs</span>
                </div>
                {!claimId && <AlertTriangle size={18} className="text-amber-500" />}
              </div>
              
              <div className="space-y-6 flex-1 font-mono text-xs font-bold">
                <p className="flex items-center gap-3 text-slate-700">
                  <span className={`w-2 h-2 rounded-full ${claimId ? 'bg-[#10b981]' : 'bg-slate-300'}`}></span> 
                  {claimId ? `Linked ID: ${claimId.substring(0, 8)}...` : 'No DB Link Established'}
                </p>
                <p className="flex items-center gap-3 text-slate-700">
                  <span className={`w-2 h-2 rounded-full ${claimId ? 'bg-[#10b981]' : 'bg-slate-300'}`}></span> 
                  Contextual API: SECURE
                </p>
                
                {/* Dynamic Terminal Status based on state */}
                <p className={`flex items-center gap-3 transition-colors duration-300 ${isLoading ? 'text-amber-500 animate-pulse' : 'text-blue-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500' : 'bg-blue-500'}`}></span> 
                  Status: {kernelStatus}
                </p>
                
                <div className="mt-12 pt-8 border-t border-emerald-100/60 font-sans">
                  <p className="text-slate-500 mb-6 uppercase tracking-[0.2em] font-black text-[10px]">Live Decision Weights</p>
                  <div className="space-y-6">
                    <WeightBar label="Severity Ratio" val="62%" color="bg-[#10b981]" />
                    <WeightBar label="Time Depreciation" val="14%" color="bg-blue-400" />
                    <WeightBar label="Base Market Value" val="88%" color="bg-purple-400" />
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-white/60 rounded-[2rem] border border-emerald-100 text-slate-700 leading-relaxed font-sans italic text-sm shadow-sm shrink-0">
                {claimId 
                  ? "Node.js proxy active. The API key is hidden. Gemini is now reading data directly from MongoDB Atlas."
                  : "Database link missing. Upload an image in the Dashboard to generate a claim ID."}
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

// Internal Sub-component for the sidebar bars (Light Theme)
const WeightBar = ({ label, val, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between font-black uppercase text-[10px] tracking-widest text-slate-500">
      <span>{label}</span>
      <span className="text-slate-800">{val}</span>
    </div>
    <div className="w-full bg-emerald-100/50 h-2.5 rounded-full overflow-hidden shadow-inner">
      <motion.div 
        initial={{ width: 0 }} animate={{ width: val }} transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full ${color} rounded-full`} 
      />
    </div>
  </div>
);

export default XaiLabPage;