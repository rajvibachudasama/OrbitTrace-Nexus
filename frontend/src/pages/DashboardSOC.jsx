import React, { useState } from 'react';
import { useConstellation } from '../context/ConstellationContext';
import { ConstellationCanvas } from '../components/ConstellationCanvas';
import { SatelliteCard } from '../components/SatelliteCard';
import { TrustRadar } from '../components/TrustRadar';
import { ThreatAlertPanel } from '../components/ThreatAlertPanel';
import { MissionContinuityHUD } from '../components/MissionContinuityHUD';
import { LivePacketStream } from '../components/LivePacketStream';
import { AttackLabModal } from '../components/AttackLabModal';
import { 
  Orbit, 
  ShieldCheck, 
  Swords, 
  Radio, 
  Activity, 
  Rocket, 
  ShieldAlert, 
  Zap, 
  TrendingUp, 
  Sliders, 
  Layers 
} from 'lucide-react';

export const DashboardSOC = () => {
  const { 
    satellites, 
    fleetSummary, 
    riskSummary, 
    continuitySummary, 
    selectedSatelliteId, 
    setSelectedSatelliteId 
  } = useConstellation();

  const [isAttackModalOpen, setIsAttackModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-white flex items-center gap-2">
            SPACE SECURITY OPERATIONS CENTER
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Real-Time Cyber-Physical Digital Twin Monitoring & Autonomous Mission Defense
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAttackModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-display font-bold text-xs shadow-glow-crimson flex items-center gap-2 transition-all cursor-pointer"
          >
            <Swords className="w-4 h-4" />
            <span>LAUNCH ATTACK LAB</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* KPI 1: Fleet Security State */}
        <div className="p-4 rounded-2xl glass-panel border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase font-bold">CONSTELLATION FLEET</span>
            <Orbit className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-display font-black text-2xl text-white">
              {fleetSummary?.total_satellites || 8}
            </span>
            <span className="text-xs text-cyber-emerald font-bold">
              {fleetSummary?.trusted_count || 8} TRUSTED
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2">
            <span className="text-cyber-amber">{fleetSummary?.suspicious_count || 0} Suspicious</span>
            <span>•</span>
            <span className="text-cyber-crimson font-bold">{fleetSummary?.isolated_count || 0} Isolated</span>
          </div>
        </div>

        {/* KPI 2: Mean Trust Score */}
        <div className="p-4 rounded-2xl glass-panel border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase font-bold">MEAN TRUST SCORE</span>
            <ShieldCheck className="w-4 h-4 text-cyber-emerald" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`font-display font-black text-2xl ${
              (fleetSummary?.average_trust_score || 95) < 70 ? 'text-cyber-crimson' : 'text-cyber-cyan'
            }`}>
              {fleetSummary?.average_trust_score || 95}%
            </span>
            <span className="text-[11px] text-slate-400">/ 100</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-space-border mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-emerald rounded-full transition-all duration-500"
              style={{ width: `${fleetSummary?.average_trust_score || 95}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Mission Availability */}
        <div className="p-4 rounded-2xl glass-panel border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase font-bold">MISSION CONTINUITY</span>
            <Rocket className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-2xl text-cyber-emerald">
              {continuitySummary?.mission_availability || 100}%
            </span>
            <span className="text-xs text-slate-400">SURVIVABILITY</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Running Tasks: {continuitySummary?.running_tasks || 5}/{continuitySummary?.total_tasks || 5}</span>
            <span className="text-cyan-300 font-bold">{continuitySummary?.migrated_tasks || 0} Migrated</span>
          </div>
        </div>

        {/* KPI 4: Cyber-Physical Risk Index */}
        <div className="p-4 rounded-2xl glass-panel border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase font-bold">SYSTEM RISK LEVEL</span>
            <ShieldAlert className="w-4 h-4 text-cyber-crimson" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`font-display font-black text-2xl ${
              riskSummary?.risk_level === 'CRITICAL'
                ? 'text-cyber-crimson'
                : riskSummary?.risk_level === 'HIGH'
                ? 'text-cyber-amber'
                : 'text-cyber-emerald'
            }`}>
              {riskSummary?.risk_level || 'LOW'}
            </span>
            <span className="text-xs text-slate-400">({riskSummary?.overall_risk_score || 12}%)</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Resilience Index</span>
            <span className="text-cyber-cyan font-bold">{riskSummary?.resilience_score || 90.4}%</span>
          </div>
        </div>
      </div>

      {/* Main Center Grid: Constellation Canvas (Left 8 cols) + Real-Time Threat Feed (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ConstellationCanvas />
        </div>

        <div className="lg:col-span-4">
          <ThreatAlertPanel />
        </div>
      </div>

      {/* Middle Analytics Grid: 6-Factor Trust Radar + Mission Continuity HUD + Live Packet Stream */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <TrustRadar satelliteId={selectedSatelliteId} />
        </div>

        <div>
          <MissionContinuityHUD />
        </div>

        <div>
          <LivePacketStream />
        </div>
      </div>

      {/* Constellation Satellites Fleet Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyber-cyan" />
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              CONSTELLATION SPACECRAFT NODES [{satellites?.length || 8}]
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">CLICK ANY CARD TO INSPECT TRUST MATRIX</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {satellites.map((sat) => (
            <SatelliteCard
              key={sat.id}
              satellite={sat}
              isSelected={sat.id === selectedSatelliteId}
              onSelect={() => setSelectedSatelliteId(sat.id)}
            />
          ))}
        </div>
      </div>

      {/* Attack Lab Launchpad Modal */}
      <AttackLabModal isOpen={isAttackModalOpen} onClose={() => setIsAttackModalOpen(false)} />
    </div>
  );
};
