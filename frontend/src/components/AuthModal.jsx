// ============================================================
// AUTH MODAL — Login & Register dialogs (UI only, no backend yet)
// ============================================================
// Uses Radix Dialog for accessible modals with shadcn-inspired styling.
// Backend auth will be added later — this is just the UI shell.
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ open, onOpenChange, mode = 'login' }) => {
    const [activeMode, setActiveMode] = useState(mode);
    const navigate = useNavigate();
    const { login, register, error: authError, setError: setAuthError } = useAuth();

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset mode when modal opens
    React.useEffect(() => {
        if (open) {
            setActiveMode(mode);
            setAuthError(null);
            setName('');
            setEmail('');
            setPassword('');
        }
    }, [open, mode, setAuthError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAuthError(null);

        let result;
        if (activeMode === 'login') {
            result = await login(email, password);
        } else {
            result = await register(name, email, password);
        }

        setIsSubmitting(false);

        if (result.success) {
            onOpenChange(false); // Close Modal
            navigate('/dashboard'); // Route to protected page
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {open && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm"
                            />
                        </Dialog.Overlay>

                        <Dialog.Content asChild>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
                                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                                exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="fixed top-1/2 left-1/2 z-[301] w-[90%] max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] border border-white/50 dark:border-white/10 shadow-2xl p-8 focus:outline-none"
                            >
                                {/* Close Button */}
                                <Dialog.Close asChild>
                                    <button className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-400">
                                        <X size={16} />
                                    </button>
                                </Dialog.Close>

                                {/* Logo */}
                                <div className="flex justify-center mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <Zap size={24} className="text-white" />
                                    </div>
                                </div>

                                {/* Tab Toggle */}
                                <div className="flex bg-slate-100 dark:bg-white/5 rounded-2xl p-1 mb-6">
                                    {['login', 'register'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => {
                                                setActiveMode(m);
                                                setAuthError(null);
                                            }}
                                            className={cn(
                                                "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                                activeMode === m
                                                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            )}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>

                                {/* Form Fields */}
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    {authError && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-xs font-bold flex items-center gap-2 mb-4">
                                            <AlertCircle size={14} className="shrink-0" />
                                            {authError}
                                        </div>
                                    )}
                                    <div className="space-y-3">
                                        {activeMode === 'register' && (
                                            <div className="relative">
                                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    required={activeMode === 'register'}
                                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all placeholder:text-slate-400"
                                                />
                                            </div>
                                        )}
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="password"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full mt-6 py-4 rounded-xl bg-emerald-500 disabled:bg-emerald-500/50 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
                                    >
                                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                        {isSubmitting
                                            ? 'Processing...'
                                            : activeMode === 'login' ? 'Sign In' : 'Create Account'}
                                    </button>
                                </form>

                                <div className="text-center text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest">
                                    {activeMode === 'login' ? 'No account? ' : 'Already registered? '}
                                    <span
                                        onClick={() => setActiveMode(activeMode === 'login' ? 'register' : 'login')}
                                        className="text-emerald-500 cursor-pointer hover:underline"
                                    >
                                        {activeMode === 'login' ? 'Register' : 'Login'}
                                    </span>
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
};

export default AuthModal;
