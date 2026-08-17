import React from 'react';
import { useConstellation } from '../context/ConstellationContext';
import { 
  Battery, 
  Cpu, 
  Thermometer, 
  Signal, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Activity, 
  Zap 
} from 'lucide-react';

export const SatelliteCard = ({ satellite, isSelected, onSelect }) => {
  const { isolateSatellite, recoverSatellite, resetSatellite } = useConstellation();
  const telem = satellite.telemetry || {};
  const trust = Math.round(satellite.trust_score || 95);
  const state = satellite.security_state || 'TRUSTED';

  // Status color badge
  const getBadgeStyle = () => {
    switch (state) {
      case 'ISOLATED':
        return 'bg-red-950/80 text-cyber-crimson border-cyber-crimson/50 animate-pulse';
      case 'HIGH_RISK':
      case 'UNTRUSTED':
        return 'bg-orange-950/80 text-orange-400 border-orange-500/50';
      case 'SUSPICIOUS':
        return 'bg-amber-950/80 text-cyber-amber border-cyber-amber/50';
      case 'RECOVERING':
        return 'bg-purple-950/80 text-purple-400 border-purple-500/50';
      default:
        return 'bg-emerald-950/80 text-cyber-emerald border-cyber-emerald/50';
    }
  };

  const getTrustBarColor = () => {
    if (trust >= 80) return 'bg-cyber-emerald';
    if (trust >= 60) return 'bg-cyber-amber';
    if (trust >= 40) return 'bg-orange-500';
    return 'bg-cyber-crimson';
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-2xl transition-all cursor-pointer border ${
        isSelected
          ? 'glass-panel-glow border-cyber-cyan shadow-glow-cyan'
          : satellite.is_isolated
          ? 'glass-panel-danger border-cyber-crimson/60'
          : 'glass-panel hover:border-cyber-cyan/40 hover:bg-space-hover'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              satellite.is_isolated ? 'bg-cyber-crimson animate-ping' : getTrustBarColor()
            }`}
          />
          <div>
            <h3 className="font-display font-bold text-sm text-white">{satellite.id}</h3>
            <p className="text-[10px] font-mono text-slate-400">{satellite.name} (Plane {satellite.orbital_plane})</p>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getBadgeStyle()}`}>
          {state}
        </span>
      </div>

      {/* Trust Score Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs font-mono mb-1">
          <span className="text-slate-400">Dynamic Trust Score</span>
          <span className={`font-bold ${trust < 60 ? 'text-cyber-crimson' : 'text-cyber-cyan'}`}>{trust}/100</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-space-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getTrustBarColor()}`}
            style={{ width: `${Math.max(5, trust)}%` }}
          />
        </div>
      </div>

      {/* Telemetry Sensor Grid */}
      <div className="grid grid-cols-3 gap-2 text-[11px] font-mono mb-3">
        {/* Battery */}
        <div className="p-1.5 rounded-lg bg-space-card/60 border border-space-border/60">
          <div className="text-slate-500 flex items-center gap-1 text-[9px] mb-0.5">
            <Battery className="w-3 h-3 text-cyan-400" /> BATT
          </div>
          <div className="font-bold text-slate-200">{telem.battery_level || 90}%</div>
        </div>

        {/* CPU */}
        <div className="p-1.5 rounded-lg bg-space-card/60 border border-space-border/60">
          <div className="text-slate-500 flex items-center gap-1 text-[9px] mb-0.5">
            <Cpu className="w-3 h-3 text-cyan-400" /> CPU
          </div>
          <div className={`font-bold ${telem.cpu_utilization > 80 ? 'text-cyber-crimson' : 'text-slate-200'}`}>
            {telem.cpu_utilization || 32}%
          </div>
        </div>

        {/* Temp */}
        <div className="p-1.5 rounded-lg bg-space-card/60 border border-space-border/60">
          <div className="text-slate-500 flex items-center gap-1 text-[9px] mb-0.5">
            <Thermometer className="w-3 h-3 text-cyan-400" /> TEMP
          </div>
          <div className={`font-bold ${telem.temperature > 35 ? 'text-cyber-crimson' : 'text-slate-200'}`}>
            {telem.temperature || 24.5}°C
          </div>
        </div>

        {/* Signal */}
        <div className="p-1.5 rounded-lg bg-space-card/60 border border-space-border/60">
          <div className="text-slate-500 flex items-center gap-1 text-[9px] mb-0.5">
            <Signal className="w-3 h-3 text-cyan-400" /> RSSI
          </div>
          <div className="font-bold text-slate-200">{telem.signal_strength || -65} dBm</div>
        </div>

        {/* Packet Loss */}
        <div className="p-1.5 rounded-lg bg-space-card/60 border border-space-border/60">
          <div className="text-slate-500 flex items-center gap-1 text-[9px] mb-0.5">
            <Zap className="w-3 h-3 text-cyan-400" /> LOSS
          </div>
          <div className={`font-bold ${telem.packet_loss_rate > 5 ? 'text-cyber-crimson' : 'text-slate-200'}`}>
            {telem.packet_loss_rate || 0.4}%
          </div>
        </div>

        {/* Latency */}
        <div className="p-1.5 rounded-lg bg-space-card/60 border border-space-border/60">
          <div className="text-slate-500 flex items-center gap-1 text-[9px] mb-0.5">
            <Activity className="w-3 h-3 text-cyan-400" /> RTT
          </div>
          <div className="font-bold text-slate-200">{telem.latency || 30} ms</div>
        </div>
      </div>

      {/* Mission State & Action Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-space-border/60 text-xs font-mono">
        <span className="text-[10px] text-slate-400 truncate max-w-[130px]" title={satellite.mission_state}>
          {satellite.mission_state || 'IDLE'}
        </span>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {satellite.is_isolated ? (
            <button
              onClick={() => recoverSatellite(satellite.id)}
              className="px-2 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-[10px] font-bold text-purple-300 flex items-center gap-1 transition-all"
              title="Initiate Level 5 Cryptographic Re-Key Recovery"
            >
              <Unlock className="w-3 h-3" /> RECOVER
            </button>
          ) : (
            <button
              onClick={() => isolateSatellite(satellite.id)}
              className="px-2 py-1 rounded bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-[10px] font-bold text-cyber-crimson flex items-center gap-1 transition-all"
              title="Isolate Compromised Node"
            >
              <Lock className="w-3 h-3" /> ISOLATE
            </button>
          )}

          <button
            onClick={() => resetSatellite(satellite.id)}
            className="p-1 rounded bg-space-card hover:bg-space-hover border border-space-border text-slate-400 hover:text-cyan-300 transition-all"
            title="Reset to Nominal Telemetry"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
