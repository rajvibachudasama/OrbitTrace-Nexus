import React, { useState } from 'react';
import { useConstellation } from '../context/ConstellationContext';
import { TrustRadar } from '../components/TrustRadar';
import { TrustHistoryChart } from '../components/TrustHistoryChart';
import { TelemetryDriftChart } from '../components/TelemetryDriftChart';
import { ShieldCheck, TrendingUp, Activity, BarChart2, CheckCircle2, Lock } from 'lucide-react';

export const TrustAnalytics = () => {
  const { satellites, selectedSatelliteId, setSelectedSatelliteId } = useConstellation();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-white flex items-center gap-2">
            DYNAMIC TRUST & BEHAVIOURAL DETECTION ENGINE
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Continuous Zero-Trust Multi-Factor Evaluation & Multi-Dimensional Z-Score Drift Analysis
          </p>
        </div>

        {/* Spacecraft Node Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-space-card border border-space-border overflow-x-auto max-w-full">
          {satellites.map((sat) => (
            <button
              key={sat.id}
              onClick={() => setSelectedSatelliteId(sat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedSatelliteId === sat.id
                  ? 'bg-cyber-cyan text-black shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sat.id}
            </button>
          ))}
        </div>
      </div>

      {/* Trust Radar & Trend Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96">
          <TrustRadar satelliteId={selectedSatelliteId} />
        </div>

        <div className="h-96">
          <TrustHistoryChart satelliteId={selectedSatelliteId} />
        </div>
      </div>

      {/* Behavioral Baseline Drift Deviation Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <TelemetryDriftChart satelliteId={selectedSatelliteId} />
        </div>

        {/* Mathematical Formulation Explainer Card */}
        <div className="lg:col-span-4 p-5 rounded-2xl glass-panel border border-space-border text-xs font-mono space-y-3">
          <div className="flex items-center gap-2 text-cyber-cyan font-bold uppercase">
            <Activity className="w-4 h-4" /> MATHEMATICAL TRUST FORMULATION
          </div>

          <div className="p-3 rounded-xl bg-space-card/90 border border-space-border/80 text-[11px] leading-relaxed text-slate-300">
            <div className="font-bold text-cyber-cyan mb-1">Composite Trust Equation:</div>
            <div className="text-cyan-300 font-mono text-[10px] bg-black/40 p-2 rounded border border-cyber-cyan/30">
              T(t) = 0.25·F_auth + 0.20·F_integ + 0.20·F_behav + 0.15·F_rel + 0.10·F_telem + 0.10·F_rep - Δ_penalties
            </div>
          </div>

          <div className="space-y-1.5 text-[10px] text-slate-400">
            <div>• <strong className="text-slate-200">F_auth (25%):</strong> HMAC challenge/response verification.</div>
            <div>• <strong className="text-slate-200">F_integ (20%):</strong> SHA-256 payload checksum validation.</div>
            <div>• <strong className="text-slate-200">F_behav (20%):</strong> Statistical Z-score deviation from learned baseline.</div>
            <div>• <strong className="text-slate-200">F_rel (15%):</strong> Peer consensus and latency stability.</div>
            <div>• <strong className="text-slate-200">F_telem (10%):</strong> Sensor gradient physical plausibility.</div>
            <div>• <strong className="text-slate-200">F_rep (10%):</strong> Exponential moving average reputation.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
