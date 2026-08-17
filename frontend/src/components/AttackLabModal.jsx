import React, { useState } from 'react';
import { useConstellation } from '../context/ConstellationContext';
import { Swords, X, Play, Zap, ShieldAlert, Sliders, Target, CheckCircle2 } from 'lucide-react';

export const AttackLabModal = ({ isOpen, onClose }) => {
  const { satellites, launchAttack, activeAttacks, stopAttack } = useConstellation();
  const [selectedAttack, setSelectedAttack] = useState('IDENTITY_CLONE');
  const [targetSats, setTargetSats] = useState(['SAT-03']);
  const [intensity, setIntensity] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'IDENTITY_CLONE',
      name: 'Identity Clone Attack',
      desc: 'Adversary injects spoofed telemetry packets claiming target satellite ID from a conflicting orbital location.',
      defaultTarget: ['SAT-03'],
      severity: 'CRITICAL',
    },
    {
      id: 'ROGUE_SATELLITE',
      name: 'Rogue Satellite Injection',
      desc: 'Unauthorized spacecraft attempts to join constellation mesh by broadcasting spoofed beacons and ephemeris.',
      defaultTarget: ['SAT-01'],
      severity: 'HIGH',
    },
    {
      id: 'TRUST_MANIPULATION',
      name: 'Trust Manipulation / Sleeper Attack',
      desc: 'Compromised node behaves nominally initially, then gradually drops relay packets and corrupts checksums.',
      defaultTarget: ['SAT-04'],
      severity: 'HIGH',
    },
    {
      id: 'TELEMETRY_DRIFT',
      name: 'Telemetry Sensor Drift Attack',
      desc: 'Subtly drifts thermal and power sensors over time to evade static alarms and test Z-score deviation detectors.',
      defaultTarget: ['SAT-02'],
      severity: 'MEDIUM',
    },
    {
      id: 'ROUTE_HIJACK',
      name: 'Route Hijacking Attack',
      desc: 'Compromised node advertises false 0-cost routing paths to hijack or blackhole constellation traffic.',
      defaultTarget: ['SAT-05'],
      severity: 'HIGH',
    },
    {
      id: 'COORDINATED_ATTACK',
      name: 'Coordinated Multi-Satellite Attack',
      desc: 'Simultaneously attacks multiple spacecraft across orbital planes to attempt constellation segmentation.',
      defaultTarget: ['SAT-02', 'SAT-04', 'SAT-05'],
      severity: 'CRITICAL',
    },
    {
      id: 'ISL_FLOOD',
      name: 'Communication Flood (ISL DoS)',
      desc: 'Floods target optical laser cross-link with 10,000 pps, saturating buffer queues and spiking latency.',
      defaultTarget: ['SAT-01'],
      severity: 'MEDIUM',
    },
  ];

  const handleSelectScenario = (sc) => {
    setSelectedAttack(sc.id);
    setTargetSats(sc.defaultTarget);
    setSuccessMsg('');
  };

  const handleLaunch = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      await launchAttack(selectedAttack, targetSats, intensity);
      setSuccessMsg(`🚀 Attack ${selectedAttack} injected into Constellation Twin!`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTargetSat = (satId) => {
    if (selectedAttack === 'COORDINATED_ATTACK') {
      if (targetSats.includes(satId)) {
        if (targetSats.length > 1) setTargetSats(targetSats.filter((id) => id !== satId));
      } else {
        setTargetSats([...targetSats, satId]);
      }
    } else {
      setTargetSats([satId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl rounded-2xl glass-panel-glow border border-space-border/90 bg-[#090f20] p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-space-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-950/80 border border-cyber-crimson/50 text-cyber-crimson">
              <Swords className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">DISTRIBUTED ATTACK SIMULATION LAB</h2>
              <p className="text-xs font-mono text-slate-400">Inject Multi-Vector Cyber-Physical Space Attacks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-space-card hover:bg-space-hover text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Attack Scenario Selector Grid */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400 font-bold uppercase">1. SELECT ATTACK SCENARIO</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {scenarios.map((sc) => (
              <div
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-xs font-mono ${
                  selectedAttack === sc.id
                    ? 'bg-red-950/50 border-cyber-crimson text-white shadow-glow-crimson'
                    : 'bg-space-card/80 border-space-border text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{sc.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      sc.severity === 'CRITICAL'
                        ? 'bg-red-900 text-cyber-crimson'
                        : 'bg-amber-900 text-cyber-amber'
                    }`}
                  >
                    {sc.severity}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">{sc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Target Spacecraft Selection & Intensity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-space-border/80">
          {/* Target Satellite Selector */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyber-cyan" /> 2. TARGET SPACECRAFT
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {satellites.map((sat) => {
                const isTarget = targetSats.includes(sat.id);
                return (
                  <button
                    key={sat.id}
                    onClick={() => toggleTargetSat(sat.id)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      isTarget
                        ? 'bg-cyber-crimson text-white border-cyber-crimson shadow-glow-crimson'
                        : 'bg-space-card border-space-border text-slate-300 hover:border-cyber-cyan/40'
                    }`}
                  >
                    {sat.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyber-amber" /> 3. ATTACK INTENSITY
              </span>
              <span className="text-cyber-amber font-bold">{Math.round(intensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full accent-cyber-crimson cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>0.5x (Subtle Stealth)</span>
              <span>1.0x (Standard)</span>
              <span>2.0x (Overwhelming)</span>
            </div>
          </div>
        </div>

        {/* Active Attack Running Banner if any */}
        {activeAttacks && activeAttacks.length > 0 && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-cyber-crimson/60 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-cyber-crimson">
              <Zap className="w-4 h-4 animate-bounce" />
              <span>ACTIVE SIMULATION: {activeAttacks[0].attack_type} (Target: {activeAttacks[0].target_satellite_id || 'Multiple'})</span>
            </div>
            <button
              onClick={() => stopAttack(activeAttacks[0].attack_id)}
              className="px-3 py-1 rounded bg-space-card hover:bg-space-hover border border-space-border text-slate-300 font-bold"
            >
              STOP ATTACK
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-cyber-emerald/50 text-cyber-emerald text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Launch Trigger Button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-space-border/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-space-card hover:bg-space-hover border border-space-border text-xs font-mono text-slate-300"
          >
            CLOSE
          </button>
          <button
            onClick={handleLaunch}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 via-cyber-crimson to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-display font-bold text-xs shadow-glow-crimson flex items-center gap-2 transition-all"
          >
            <Play className="w-4 h-4" />
            <span>{loading ? 'INJECTING...' : 'LAUNCH ATTACK SIMULATION'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
