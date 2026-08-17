import React, { useState } from 'react';
import { useConstellation } from '../context/ConstellationContext';
import { Swords, Play, Zap, ShieldAlert, Target, RefreshCw, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export const AttackLab = () => {
  const { satellites, launchAttack, activeAttacks, stopAttack, resetFleet } = useConstellation();
  const [selectedScenario, setSelectedScenario] = useState('IDENTITY_CLONE');
  const [selectedTargets, setSelectedTargets] = useState(['SAT-03']);
  const [intensity, setIntensity] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const scenarios = [
    {
      id: 'IDENTITY_CLONE',
      name: 'Identity Clone Attack',
      desc: 'Adversary injects spoofed telemetry claiming target satellite ID from a conflicting orbital location.',
      defaultTarget: ['SAT-03'],
      severity: 'CRITICAL',
      flow: ['DUPLICATE_NONCE_PROBE', 'CONFLICTING_EPHEMERIS_DETECTED', 'DUAL_IDENTITY_ISOLATION', 'ROUTE_FAILOVER'],
    },
    {
      id: 'ROGUE_SATELLITE',
      name: 'Rogue Satellite Injection',
      desc: 'Unauthorized spacecraft attempts to join constellation mesh by broadcasting spoofed beacons and ephemeris.',
      defaultTarget: ['SAT-01'],
      severity: 'HIGH',
      flow: ['BEACON_INJECTION', 'CRYPTO_CHALLENGE_FAILED', 'QUARANTINE_APPLIED', 'ISL_REJECTED'],
    },
    {
      id: 'TRUST_MANIPULATION',
      name: 'Trust Manipulation / Sleeper Attack',
      desc: 'Compromised node behaves nominally initially, then gradually drops relay packets and corrupts checksums.',
      defaultTarget: ['SAT-04'],
      severity: 'HIGH',
      flow: ['NOMINAL_BASELINE', 'SUBTLE_PACKET_DROP', 'TRUST_DECAY_BREACH', 'AUTOMATIC_ISOLATION'],
    },
    {
      id: 'TELEMETRY_DRIFT',
      name: 'Telemetry Sensor Drift Attack',
      desc: 'Subtly drifts thermal and power sensors over time to evade static alarms and test Z-score deviation detectors.',
      defaultTarget: ['SAT-02'],
      severity: 'MEDIUM',
      flow: ['THERMAL_DRIFT_INJECT', 'Z_SCORE_DEVIATION_SPIKE', 'BEHAVIOURAL_ALERT', 'COMMAND_RESTRICTION'],
    },
    {
      id: 'ROUTE_HIJACK',
      name: 'Route Hijacking Attack',
      desc: 'Compromised node advertises false 0-cost routing paths to hijack or blackhole constellation traffic.',
      defaultTarget: ['SAT-05'],
      severity: 'HIGH',
      flow: ['SPOOFED_ROUTING_TABLE', 'NEIGHBOR_TRUST_PENALTY', 'SHORTEST_PATH_POISON_DETECT', 'BLACKHOLE_SEVER'],
    },
    {
      id: 'COORDINATED_ATTACK',
      name: 'Coordinated Multi-Satellite Attack',
      desc: 'Simultaneously attacks multiple spacecraft across orbital planes to attempt constellation segmentation.',
      defaultTarget: ['SAT-02', 'SAT-04', 'SAT-05'],
      severity: 'CRITICAL',
      flow: ['SYNCHRONIZED_ANOMALIES', 'MULTI_PLANE_CORRELATION', 'GLOBAL_RISK_SPIKE', 'ISL_MESH_RECONFIG'],
    },
    {
      id: 'ISL_FLOOD',
      name: 'Communication Flood (ISL DoS)',
      desc: 'Floods target optical laser cross-link with 10,000 pps, saturating buffer queues and spiking latency.',
      defaultTarget: ['SAT-01'],
      severity: 'MEDIUM',
      flow: ['LASER_TRAFFIC_BURST', 'BUFFER_SATURATION', 'RTT_LATENCY_SPIKE', 'RATE_LIMIT_POLICY'],
    },
  ];

  const handleLaunch = async (scenarioId, targets, intens) => {
    setLoading(true);
    setStatusMessage('');
    try {
      await launchAttack(scenarioId, targets, intens);
      setStatusMessage(`Attack ${scenarioId} successfully executed!`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-white flex items-center gap-2">
            DISTRIBUTED ATTACK SIMULATION LABORATORY
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Adversarial Cyber-Physical Space Attack Vectors & Autonomous Defense Benchmarking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetFleet}
            className="px-4 py-2 rounded-xl bg-space-card hover:bg-space-hover border border-space-border text-xs font-mono text-slate-300 flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> RESET CONSTELATION
          </button>
        </div>
      </div>

      {/* Active Attack Running Stage Tracker */}
      {activeAttacks && activeAttacks.length > 0 && (
        <div className="p-5 rounded-2xl bg-red-950/60 border border-cyber-crimson shadow-glow-crimson space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyber-crimson font-bold text-sm">
              <Zap className="w-5 h-5 animate-bounce" />
              <span>ACTIVE ADVERSARIAL SIMULATION RUNNING</span>
            </div>
            <span className="text-xs text-slate-300">Elapsed: {activeAttacks[0].elapsed_seconds}s</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-space-card/80 border border-space-border">
              <span className="text-slate-500 text-[10px] block">ATTACK TYPE</span>
              <span className="text-white font-bold">{activeAttacks[0].attack_type}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-space-card/80 border border-space-border">
              <span className="text-slate-500 text-[10px] block">TARGET NODE(S)</span>
              <span className="text-cyber-crimson font-bold">
                {activeAttacks[0].target_satellite_id || activeAttacks[0].target_satellite_ids?.join(', ') || 'SAT-03'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-space-card/80 border border-space-border">
              <span className="text-slate-500 text-[10px] block">SIMULATION STAGE</span>
              <span className="text-cyber-amber font-bold">{activeAttacks[0].stage}</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => stopAttack(activeAttacks[0].attack_id)}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              STOP SIMULATION
            </button>
          </div>
        </div>
      )}

      {/* Attack Scenario Launchpad Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
        {scenarios.map((sc) => {
          const isRunning = activeAttacks?.some((a) => a.attack_type === sc.id);
          return (
            <div
              key={sc.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                isRunning
                  ? 'glass-panel-danger border-cyber-crimson'
                  : 'glass-panel hover:border-slate-500'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-white">{sc.name}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      sc.severity === 'CRITICAL'
                        ? 'bg-red-950 text-cyber-crimson border-cyber-crimson/60'
                        : 'bg-amber-950 text-cyber-amber border-cyber-amber/60'
                    }`}
                  >
                    {sc.severity}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{sc.desc}</p>

                {/* Attack Progression Stage Flow */}
                <div className="p-2 rounded-xl bg-space-card/70 border border-space-border/60 text-[10px] space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[9px]">ATTACK STAGES & DEFENSE REACTION:</span>
                  <div className="flex items-center gap-1 text-slate-300 overflow-x-auto text-[9px]">
                    {sc.flow.map((stage, idx) => (
                      <React.Fragment key={idx}>
                        <span className="bg-space-bg px-1.5 py-0.5 rounded border border-space-border shrink-0">{stage}</span>
                        {idx < sc.flow.length - 1 && <span className="text-slate-600">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Launch Button */}
              <div className="pt-2 border-t border-space-border/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Target: {sc.defaultTarget.join(', ')}</span>
                <button
                  onClick={() => handleLaunch(sc.id, sc.defaultTarget, 1.0)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow-crimson transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" /> EXECUTE ATTACK
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
