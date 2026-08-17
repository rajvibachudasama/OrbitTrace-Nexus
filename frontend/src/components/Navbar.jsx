import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConstellation } from '../context/ConstellationContext';
import { Shield, Radio, Activity, AlertTriangle, RefreshCw, User, LogOut, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { isConnected, fleetSummary, riskSummary, resetFleet, activeAttacks } = useConstellation();
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getRiskBadge = () => {
    const level = riskSummary?.risk_level || 'LOW';
    if (level === 'CRITICAL') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-950/80 text-cyber-crimson border border-cyber-crimson/50 animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" /> CRITICAL THREAT
        </span>
      );
    }
    if (level === 'HIGH') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-950/80 text-cyber-amber border border-cyber-amber/50">
          <AlertTriangle className="w-3.5 h-3.5" /> HIGH RISK
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-950/80 text-cyber-emerald border border-cyber-emerald/50">
        <CheckCircle2 className="w-3.5 h-3.5" /> FLEET SECURE
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 glass-panel border-b border-space-border/80 px-6 flex items-center justify-between">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-cyan/20 to-cyber-blue/40 border border-cyber-cyan/50 shadow-glow-cyan">
          <Radio className="w-5 h-5 text-cyber-cyan animate-pulse" />
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-cyber-emerald' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-cyber-emerald' : 'bg-amber-500'}`}></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-lg bg-gradient-to-r from-white via-cyan-200 to-cyber-cyan bg-clip-text text-transparent">
              ORBITTRACE NEXUS
            </h1>
            <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
              SPACE-SOC
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Autonomous Cyber-Physical Constellation Twin</p>
        </div>
      </div>

      {/* Center Mission HUD */}
      <div className="hidden lg:flex items-center gap-6 font-mono text-xs">
        {/* UTC Clock */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-card/80 border border-space-border text-slate-300">
          <Activity className="w-4 h-4 text-cyber-cyan animate-pulse" />
          <span>{utcTime || 'SYNCING UTC CLOCK...'}</span>
        </div>

        {/* Threat Level */}
        {getRiskBadge()}

        {/* Active Attack Counter */}
        {activeAttacks?.length > 0 && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyber-crimson/20 text-cyber-crimson border border-cyber-crimson animate-bounce">
            <Zap className="w-3.5 h-3.5" /> {activeAttacks.length} ACTIVE ATTACK{activeAttacks.length > 1 ? 'S' : ''}
          </span>
        )}
      </div>

      {/* Right Controls & User Profile */}
      <div className="flex items-center gap-3">
        {/* Reset Fleet Button */}
        <button
          onClick={resetFleet}
          title="Reset Constellation to Nominal State"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-card hover:bg-space-hover border border-space-border hover:border-cyber-cyan/40 text-xs font-mono text-slate-300 hover:text-cyber-cyan transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">RESET FLEET</span>
        </button>

        {/* User Role Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-card border border-space-border">
          <div className="w-6 h-6 rounded-full bg-cyber-cyan/20 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan text-xs font-bold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-slate-200">{user?.username || 'Operator'}</div>
            <div className="text-[9px] font-mono text-cyber-cyan uppercase">{user?.role || 'OPERATOR'}</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="Sign out of Space-SOC"
          className="p-2 rounded-lg bg-space-card hover:bg-red-950/40 border border-space-border hover:border-cyber-crimson/40 text-slate-400 hover:text-cyber-crimson transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
