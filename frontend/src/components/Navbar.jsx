// ============================================================
// TUBELIGHT NAVBAR — Floating, centered tabs with animated active indicator
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Zap, Home, Info, Play, LogIn, UserPlus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

const Navbar = ({ onLoginClick, onRegisterClick }) => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();

    const [activeTab, setActiveTab] = useState('Home');

    const navItems = [
        { name: 'Home', icon: Home, action: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveTab('Home'); } },
        { name: 'How It', icon: Info, action: () => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); setActiveTab('How It'); } },
        { name: 'Demo', icon: Play, action: () => { navigate('/dashboard'); setActiveTab('Demo'); } },
        { name: 'Theme', icon: isDark ? Sun : Moon, action: toggleTheme, isThemeToggle: true },
    ];

    return (
        <>
            {/* ============================== */}
            {/* TOP BAR: Logo & Auth Buttons   */}
            {/* ============================== */}
            <div className="fixed top-0 left-0 right-0 z-[190] p-4 flex justify-between items-center pointer-events-none">
                {/* Logo */}
                <button
                    onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveTab('Home'); }}
                    className="pointer-events-auto flex items-center gap-2 font-black text-slate-800 dark:text-white tracking-tighter text-lg hover:scale-105 transition-transform bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/50 dark:border-white/10 shadow-lg shadow-black/5"
                >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <Zap size={14} className="text-white" />
                    </div>
                    <span className="hidden sm:inline">CrashCost</span>
                    <span className="sm:hidden">CC</span>
                </button>

                {/* Auth Buttons */}
                <div className="pointer-events-auto flex items-center gap-1.5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-1.5 rounded-full border border-white/50 dark:border-white/10 shadow-lg shadow-black/5">
                    <button
                        onClick={onLoginClick}
                        className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition-all flex items-center gap-1.5"
                    >
                        <LogIn size={14} className="sm:hidden" />
                        <span className="hidden sm:inline">Login</span>
                    </button>
                    <button
                        onClick={onRegisterClick}
                        className="px-4 py-2 rounded-full text-xs font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-1.5"
                    >
                        <UserPlus size={14} className="sm:hidden" />
                        <span className="hidden sm:inline">Register</span>
                    </button>
                </div>
            </div>

            {/* ============================== */}
            {/* TUBELIGHT NAVBAR               */}
            {/* ============================== */}
            <div className="fixed bottom-6 sm:bottom-auto sm:top-6 left-1/2 -translate-x-1/2 z-[200]">
                <div className="flex items-center gap-1 sm:gap-2 bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-white/10 backdrop-blur-2xl py-1.5 px-1.5 rounded-full shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.name && !item.isThemeToggle;

                        return (
                            <button
                                key={item.name}
                                onClick={item.action}
                                className={cn(
                                    "relative cursor-pointer text-sm font-bold px-4 sm:px-6 py-2.5 rounded-full transition-colors flex items-center gap-2",
                                    "text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400",
                                    isActive && "bg-slate-100/80 dark:bg-white/10 text-emerald-600 dark:text-emerald-400"
                                )}
                            >
                                <span className="hidden md:inline">{item.name}</span>
                                <span className="md:hidden">
                                    <Icon size={18} strokeWidth={2.5} />
                                </span>

                                {isActive && (
                                    <motion.div
                                        layoutId="lamp"
                                        className="absolute inset-0 w-full bg-emerald-500/5 rounded-full -z-10"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30,
                                        }}
                                    >
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500 rounded-t-full">
                                            <div className="absolute w-12 h-6 bg-emerald-500/20 rounded-full blur-md -top-2 -left-2" />
                                            <div className="absolute w-8 h-6 bg-emerald-500/20 rounded-full blur-md -top-1" />
                                            <div className="absolute w-4 h-4 bg-emerald-500/20 rounded-full blur-sm top-0 left-2" />
                                        </div>
                                    </motion.div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </>
    );
};

export default Navbar;
