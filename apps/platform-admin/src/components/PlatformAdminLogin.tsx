import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PlatformAdminLoginProps {
  onLoginSuccess: (user: { userId: string; name: string }) => void;
  theme?: 'light' | 'dark';
}

export const PlatformAdminLogin: React.FC<PlatformAdminLoginProps> = ({
  onLoginSuccess,
  theme = 'light'
}) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const cleanUser = userId.trim().toLowerCase();
      
      if ((cleanUser === 'ssrit' || cleanUser === 'ssrit@ssrone.ai') && password === 'Sumit@1320') {
        const userData = {
          userId: 'ssrit',
          name: 'SSR IT Master Operator',
          email: 'ssrit@ssrone.ai',
          role: 'Platform Superadmin'
        };
        localStorage.setItem('platform_admin_auth_user', JSON.stringify(userData));
        onLoginSuccess(userData);
      } else {
        setErrorMsg('Invalid credentials. Please enter valid User ID (ssrit) and Password (Sumit@1320).');
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleQuickFill = () => {
    setUserId('ssrit');
    setPassword('Sumit@1320');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-screen bg-[#FAF9F5] flex items-center justify-center p-6 text-slate-800 font-sans select-none relative overflow-hidden">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-900/5 flex flex-col gap-6 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-600 p-[1px] shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-white rounded-[15px] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-indigo-600" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-slate-950 tracking-tight">
              SSR IT INDUSTRY
            </h2>
            <p className="text-[11px] font-mono font-bold text-indigo-600 uppercase tracking-widest mt-0.5">
              Platform Governance Console • Superadmin Portal
            </p>
          </div>
        </div>

        {/* Demo Credentials Auto Fill Chip */}
        <div 
          onClick={handleQuickFill}
          title="Click to quick-fill fixed credentials"
          className="bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200/70 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all duration-200 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-black text-indigo-900 uppercase tracking-wider">
                SUPERADMIN CREDENTIALS
              </div>
              <div className="text-xs font-mono text-indigo-700 font-semibold mt-0.5">
                User ID: <strong className="text-slate-900 font-bold">ssrit</strong> | Pass: <strong className="text-slate-900 font-bold">Sumit@1320</strong>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-black uppercase bg-indigo-600 text-white px-2.5 py-1 rounded-xl shadow-2xs group-hover:bg-indigo-700 transition-colors">
            Auto Fill
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-500 block">
              Platform User ID *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. ssrit"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 rounded-xl placeholder:text-slate-400 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-500 block">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 rounded-xl placeholder:text-slate-400 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 mt-2 cursor-pointer transition-all duration-200 active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Platform Admin</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="text-center border-t border-slate-100 pt-3">
          <p className="text-[10px] text-slate-400 font-mono font-semibold">
            SSR ONE AI • SECURE HYBRID RLS MULTI-TENANT ARCHITECTURE
          </p>
        </div>
      </div>
    </div>
  );
};
