import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Radio, Shield, Lock, User, ArrowRight, Zap, CheckCircle2, ShieldAlert } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('nexus2026!');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    const res = await login(username, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  const quickLoginAs = (userRole, pwd) => {
    setUsername(userRole);
    setPassword(pwd);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-space-bg space-grid-bg relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyber-cyan/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyber-crimson/15 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-md rounded-2xl glass-panel-glow border border-space-border p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyber-cyan/20 to-cyber-blue/40 border border-cyber-cyan/50 shadow-glow-cyan mb-2">
            <Radio className="w-8 h-8 text-cyber-cyan animate-pulse" />
          </div>
          <h1 className="font-display font-black text-2xl bg-gradient-to-r from-white via-cyan-200 to-cyber-cyan bg-clip-text text-transparent">
            ORBITTRACE NEXUS
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Autonomous Cyber-Physical Digital Twin for Secure Space Constellations
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-cyber-crimson/60 text-cyber-crimson text-xs font-mono flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-bold uppercase">OPERATOR CALLSIGN / USERNAME</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-space-card/90 border border-space-border focus:border-cyber-cyan text-slate-100 placeholder-slate-600 outline-none transition-all"
                placeholder="admin"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold uppercase">SECURITY KEY / PASSWORD</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-space-card/90 border border-space-border focus:border-cyber-cyan text-slate-100 placeholder-slate-600 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyber-cyan via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-display font-black text-xs shadow-glow-cyan flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{loading ? 'AUTHENTICATING JWT...' : 'ENTER SPACE-SOC COMMAND'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Role Selectors for Pair Programming / Demo */}
        <div className="pt-4 border-t border-space-border/80 space-y-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider text-center">
            QUICK ACCESS DEMO ROLES
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
            <button
              onClick={() => quickLoginAs('admin', 'nexus2026!')}
              className={`p-2 rounded-lg border text-center transition-all ${
                username === 'admin'
                  ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold shadow-glow-cyan'
                  : 'bg-space-card border-space-border text-slate-400 hover:text-white'
              }`}
            >
              ADMIN
            </button>

            <button
              onClick={() => quickLoginAs('operator', 'operator2026!')}
              className={`p-2 rounded-lg border text-center transition-all ${
                username === 'operator'
                  ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold shadow-glow-cyan'
                  : 'bg-space-card border-space-border text-slate-400 hover:text-white'
              }`}
            >
              OPERATOR
            </button>

            <button
              onClick={() => quickLoginAs('analyst', 'analyst2026!')}
              className={`p-2 rounded-lg border text-center transition-all ${
                username === 'analyst'
                  ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold shadow-glow-cyan'
                  : 'bg-space-card border-space-border text-slate-400 hover:text-white'
              }`}
            >
              ANALYST
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="text-center text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>ZERO-TRUST DISTRIBUTED AUTHENTICATION ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
