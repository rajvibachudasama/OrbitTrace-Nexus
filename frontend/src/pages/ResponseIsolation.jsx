import React from 'react';
import { useConstellation } from '../context/ConstellationContext';
import { IsolationQuarantineBay } from '../components/IsolationQuarantineBay';
import { ShieldAlert, ShieldCheck, Lock, Unlock, Zap, RefreshCw, Key, ArrowRight } from 'lucide-react';

export const ResponseIsolation = () => {
  const { satellites, isolateSatellite, recoverSatellite, resetSatellite } = useConstellation();

  const responseLevels = [
    { level: 0, title: 'Level 0 — Monitor', desc: '1 Hz nominal telemetry sampling. Normal constellation routing.' },
    { level: 1, title: 'Level 1 — Observe', desc: 'Increase telemetry sampling rate to 5 Hz. Enable deep packet inspection on all ISL frames.' },
    { level: 2, title: 'Level 2 — Verify', desc: 'Issue high-entropy cryptographic challenge-response handshakes to verify node identity.' },
    { level: 3, title: 'Level 3 — Restrict', desc: 'Revoke relay forwarding rights. Throttle command execution to safety-critical only.' },
    { level: 4, title: 'Level 4 — Isolate', desc: 'Sever all optical laser/RF links with compromised spacecraft. Immediately re-route constellation paths.' },
    { level: 5, title: 'Level 5 — Recover', desc: 'Ground station cryptographic re-key, firmware integrity check, and step-wise trust rebuilding.' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-white flex items-center gap-2">
            AUTONOMOUS RESPONSE & QUARANTINE CONTROL
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Multi-Tier Cybersecurity Hierarchy (Levels 0–5) & Zero-Trust Quarantine Bay
          </p>
        </div>
      </div>

      {/* Grid: Quarantine Bay (Left 6 cols) + Response Levels (Right 6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 h-[460px]">
          <IsolationQuarantineBay />
        </div>

        {/* 6-Level Autonomous Hierarchy Guide */}
        <div className="lg:col-span-6 p-5 rounded-2xl glass-panel border border-space-border font-mono space-y-3">
          <div className="flex items-center gap-2 text-cyber-cyan font-bold uppercase text-xs">
            <ShieldCheck className="w-4 h-4" /> 6-LEVEL AUTONOMOUS RESPONSE POLICY HIERARCHY
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
            {responseLevels.map((lvl) => (
              <div
                key={lvl.level}
                className="p-3 rounded-xl bg-space-card/80 border border-space-border text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{lvl.title}</span>
                  <span className="text-[10px] text-cyan-300 font-mono">AUTOMATIC</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{lvl.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Spacecraft Isolation & Recovery Control Matrix */}
      <div className="p-5 rounded-2xl glass-panel border border-space-border font-mono space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyber-cyan" />
            <h3 className="font-display font-bold text-sm text-white uppercase">
              MANUAL FLEET QUARANTINE OVERRIDE MATRIX
            </h3>
          </div>
          <span className="text-xs text-slate-400">SOC OPERATOR OVERRIDE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {satellites.map((sat) => (
            <div
              key={sat.id}
              className={`p-4 rounded-xl border space-y-3 transition-all ${
                sat.is_isolated
                  ? 'bg-red-950/40 border-cyber-crimson'
                  : 'bg-space-card/70 border-space-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{sat.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  sat.is_isolated ? 'bg-red-900 text-cyber-crimson' : 'bg-emerald-950 text-cyber-emerald'
                }`}>
                  {sat.security_state}
                </span>
              </div>

              <div className="text-xs text-slate-400">
                Trust Score: <span className="text-white font-bold">{Math.round(sat.trust_score)}%</span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-space-border/60">
                {sat.is_isolated ? (
                  <button
                    onClick={() => recoverSatellite(sat.id)}
                    className="w-full py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-lg"
                  >
                    <Unlock className="w-3.5 h-3.5" /> RECOVER
                  </button>
                ) : (
                  <button
                    onClick={() => isolateSatellite(sat.id)}
                    className="w-full py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-cyber-crimson/50 text-cyber-crimson font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <Lock className="w-3.5 h-3.5" /> ISOLATE
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
