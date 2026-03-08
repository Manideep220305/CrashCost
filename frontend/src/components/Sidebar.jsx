// ============================================================
// SIDEBAR — Shared navigation component across all inner pages
// ============================================================
// Displays on the left side of dashboard, analytics, and XAI Lab.
// Contains: logo, nav icons with tooltips, theme toggle, and logout.
// Supports dark mode via Tailwind's dark: variant classes.
// ============================================================

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, BrainCircuit, LogOut, Zap, Moon, Sun, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Intake' },
    { icon: History, path: '/analytics', label: 'History' },
    { icon: BrainCircuit, path: '/xai-lab', label: 'XAI Lab' },
    { icon: FileText, path: '/insurance-101', label: 'Guide' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="hidden lg:flex w-20 flex-col items-center py-8 bg-white/40 dark:bg-slate-900/60 backdrop-blur-2xl border-r border-white/60 dark:border-white/5 z-[200] sticky top-0 h-screen transition-colors duration-300">
      <div
        className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white mb-12 shadow-lg shadow-emerald-500/30 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <Zap size={20} />
      </div>
      <div className="flex flex-col gap-6">
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`p-3 rounded-xl cursor-pointer transition-all group relative ${
              location.pathname === item.path
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'text-slate-400 dark:text-slate-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <item.icon size={20} />
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Theme Toggle */}
      <div
        onClick={toggleTheme}
        className="mt-auto mb-4 p-3 text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 cursor-pointer transition-colors group relative"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
        <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      </div>

      {/* Logout */}
      <div
        onClick={handleLogout}
        className="p-3 text-slate-400 dark:text-slate-500 hover:text-red-500 cursor-pointer transition-colors group relative"
      >
        <LogOut size={20} />
        <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          Logout
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;