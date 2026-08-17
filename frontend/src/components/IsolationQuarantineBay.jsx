import React from 'react';
import { useConstellation } from '../context/ConstellationContext';
import { ShieldAlert, Unlock, RefreshCw, Key, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const IsolationQuarantineBay = () => {
  const { satellites, recoverSatellite, resetSatellite } = useConstellation();
  const isolatedSats = satellites.filter((s) => s.is_isolated || s.security_state === 'ISOLATED');

  return (
    <div className="p-4 rounded-2xl glass-panel border border-space-border/80 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyber-crimson" />
          <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
            QUARANTINE & ISOLATION BAY
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 border border-cyber-crimson text-cyber-crimson font-bold">
          {isolatedSats.length} ISOLATED
        </span>
      </div>

      <div className="space-y-2.5 overflow-y-auto max-h-[280px] pr-1">
        {isolatedSats.length > 0 ? (
          isolatedSats.map((sat) => (
            <div
              key={sat.id}
              className="p-3 rounded-xl bg-red-950/40 border border-cyber-crimson/50 text-xs font-mono space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyber-crimson animate-ping" />
                  <span className="font-bold text-white text-sm">{sat.id}</span>
                  <span className="text-slate-400 text-[10px]">({sat.name})</span>
                </div>
                <span className="text-cyber-crimson font-bold">TRUST: {Math.round(sat.trust_score)}%</span>
              </div>

              <div className="text-[11px] text-slate-300 bg-space-card/80 p-2 rounded-lg border border-space-border/60">
                <div className="text-slate-400 text-[9px] uppercase font-bold mb-0.5">ISOLATION STATUS</div>
                <div>All ISL links severed. Spacecraft payload placed in SAFE_HOLD. Dynamic routing bypassed.</div>
              </div>

              {/* Level 5 Recovery Trigger */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[9px] text-slate-400 font-mono">Response Level: 4 (ISOLATED)</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => recoverSatellite(sat.id)}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[10px] flex items-center gap-1.5 shadow-lg transition-all"
                  >
                    <Unlock className="w-3 h-3" /> LEVEL 5 RE-KEY & RECOVER
                  </button>
                  <button
                    onClick={() => resetSatellite(sat.id)}
                    className="p-1 rounded bg-space-card hover:bg-space-hover border border-space-border text-slate-400 hover:text-white transition-all"
                    title="Instant Reset"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 font-mono">
            <ShieldCheck className="w-8 h-8 text-cyber-emerald/40 mb-2" />
            <div className="text-xs text-slate-300 font-bold">ALL SATELLITES NOMINAL</div>
            <div className="text-[10px]">No isolated or quarantined spacecraft in constellation</div>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-space-border/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>Autonomous Isolation Policy: ACTIVE</span>
        <span className="text-cyber-cyan">Automatic Route Failover</span>
      </div>
    </div>
  );
};
