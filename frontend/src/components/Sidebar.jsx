import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, BrainCircuit, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Intake' },
    { icon: History, path: '/analytics', label: 'History' },
    { icon: BrainCircuit, path: '/xai-lab', label: 'XAI Lab' },
  ];

  return (
    <aside className="hidden lg:flex w-20 flex-col items-center py-8 bg-white/40 backdrop-blur-2xl border-r border-white/60 z-[200] sticky top-0 h-screen">
      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black mb-12 shadow-lg cursor-pointer" onClick={() => navigate('/')}>Q</div>
      <div className="flex flex-col gap-6">
        {menuItems.map((item) => (
          <div 
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`p-3 rounded-xl cursor-pointer transition-all group relative ${
              location.pathname === item.path ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/30' : 'text-slate-400 hover:bg-white/50 hover:text-slate-600'
            }`}
          >
            <item.icon size={20} />
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-auto p-3 text-slate-400 hover:text-red-500 cursor-pointer transition-colors">
        <LogOut size={20} />
      </div>
    </aside>
  );
};

export default Sidebar;