import React from 'react';
import { useConstellation } from '../context/ConstellationContext';
import { ShieldAlert, AlertTriangle, CheckCircle2, ShieldCheck, Zap, Lock, Unlock } from 'lucide-react';

export const ThreatAlertPanel = () => {
  const { activeThreats, resolveThreat, isolateSatellite } = useConstellation();

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950 text-cyber-crimson border-cyber-crimson animate-pulse';
      case 'HIGH':
        return 'bg-orange-950 text-orange-400 border-orange-500';
      case 'MEDIUM':
        return 'bg-amber-950 text-cyber-amber border-cyber-amber';
      default:
        return 'bg-blue-950 text-cyan-400 border-cyan-500';
    }
  };

  return (
    <div className="p-4 rounded-2xl glass-panel border border-space-border/80 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyber-crimson" />
          <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
            CORRELATED THREAT FEED
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-space-card border border-space-border text-slate-400">
          {activeThreats?.length || 0} ACTIVE
        </span>
      </div>

      <div className="space-y-2.5 overflow-y-auto max-h-[320px] pr-1">
        {activeThreats && activeThreats.length > 0 ? (
          activeThreats.map((threat) => (
            <div
              key={threat.id}
              className="p-3 rounded-xl bg-space-card/80 border border-space-border hover:border-space-border/80 transition-all text-xs font-mono"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getSeverityBadge(threat.severity)}`}>
                    {threat.severity}
                  </span>
                  <span className="text-white font-bold">{threat.satellite_id}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  CONFIDENCE: <span className="text-cyber-cyan font-bold">{threat.confidence}%</span>
                </span>
              </div>

              <p className="text-slate-300 text-[11px] mb-2 leading-relaxed">{threat.message}</p>

              <div className="flex items-center justify-between pt-1.5 border-t border-space-border/50 text-[10px]">
                <span className="text-slate-500">{new Date(threat.timestamp).toLocaleTimeString()}</span>

                <div className="flex items-center gap-2">
                  {threat.satellite_id !== 'CONSTELLATION_WIDE' && (
                    <button
                      onClick={() => isolateSatellite(threat.satellite_id)}
                      className="px-2 py-0.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-cyber-crimson font-bold flex items-center gap-1 transition-all"
                    >
                      <Lock className="w-3 h-3" /> ISOLATE
                    </button>
                  )}
                  <button
                    onClick={() => resolveThreat(threat.id)}
                    className="px-2 py-0.5 rounded bg-space-hover hover:bg-space-card border border-space-border text-slate-300 hover:text-white transition-all"
                  >
                    RESOLVE
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 font-mono">
            <ShieldCheck className="w-10 h-10 text-cyber-emerald/40 mb-2" />
            <div className="text-xs text-slate-300 font-bold">NO ACTIVE SECURITY THREATS</div>
            <div className="text-[10px]">Continuous behavioral correlation monitoring 8 spacecraft</div>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-space-border/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>Correlation Engine: ACTIVE</span>
        <span className="text-cyber-cyan">Multi-Signal Rule Aggregator</span>
      </div>
    </div>
  );
};
