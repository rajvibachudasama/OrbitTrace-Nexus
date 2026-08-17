import React, { useState } from 'react';
import { useConstellation } from '../context/ConstellationContext';
import { ConstellationCanvas } from '../components/ConstellationCanvas';
import { Orbit, Radio, Activity, Signal, Zap, Lock, Unlock, ShieldAlert } from 'lucide-react';

export const ConstellationView = () => {
  const { satellites, groundStations, links, selectedSatellite, setSelectedSatelliteId, isolateSatellite, recoverSatellite } = useConstellation();
  const sat = selectedSatellite;
  const telem = sat?.telemetry || {};

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-white flex items-center gap-2">
            CONSTELLATION ORBITAL & ISL TOPOLOGY
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Multi-Plane LEO Digital Twin with Optical Laser Inter-Satellite Cross-Links
          </p>
        </div>
      </div>

      {/* Main Full-Screen Canvas */}
      <ConstellationCanvas fullScreen={false} />

      {/* Deep Spacecraft Telemetry & ISL Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        {/* Left: Selected Satellite Deep Inspector */}
        <div className="lg:col-span-5 p-5 rounded-2xl glass-panel border border-space-border space-y-4">
          <div className="flex items-center justify-between border-b border-space-border/80 pb-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${sat?.is_isolated ? 'bg-cyber-crimson animate-ping' : 'bg-cyber-cyan'}`} />
              <h3 className="font-display font-bold text-sm text-white">{sat?.id} — {sat?.name}</h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
              sat?.is_isolated ? 'bg-red-950 text-cyber-crimson border border-cyber-crimson' : 'bg-emerald-950 text-cyber-emerald border border-cyber-emerald'
            }`}>
              {sat?.security_state}
            </span>
          </div>

          {/* Ephemeris & Orbital Mechanics */}
          <div className="space-y-1.5 text-xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase">ORBITAL KINEMATICS & EPHEMERIS</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-space-card/80 border border-space-border/60">
                <span className="text-slate-400 block text-[9px]">ALTITUDE</span>
                <span className="font-bold text-slate-200">{telem.altitude || 550.0} km (LEO)</span>
              </div>
              <div className="p-2 rounded-lg bg-space-card/80 border border-space-border/60">
                <span className="text-slate-400 block text-[9px]">ORBITAL VELOCITY</span>
                <span className="font-bold text-slate-200">{telem.velocity || 7.56} km/s</span>
              </div>
              <div className="p-2 rounded-lg bg-space-card/80 border border-space-border/60">
                <span className="text-slate-400 block text-[9px]">GROUND TRACK (LAT/LNG)</span>
                <span className="font-bold text-slate-200">{telem.latitude?.toFixed(2)}°, {telem.longitude?.toFixed(2)}°</span>
              </div>
              <div className="p-2 rounded-lg bg-space-card/80 border border-space-border/60">
                <span className="text-slate-400 block text-[9px]">TRUE ANOMALY</span>
                <span className="font-bold text-slate-200">{telem.true_anomaly?.toFixed(1)}°</span>
              </div>
            </div>
          </div>

          {/* Crypto Keystore */}
          <div className="space-y-1.5 text-xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase">CRYPTOGRAPHIC IDENTITY & FIRMWARE</div>
            <div className="p-2.5 rounded-lg bg-space-card/90 border border-space-border/60 text-[10px] space-y-1">
              <div>
                <span className="text-slate-500">Public Key Fingerprint: </span>
                <span className="text-cyan-300 truncate">{sat?.public_key_fingerprint}</span>
              </div>
              <div>
                <span className="text-slate-500">Firmware SHA-256: </span>
                <span className="text-slate-300">{sat?.firmware_hash}</span>
              </div>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center gap-3 pt-2">
            {sat?.is_isolated ? (
              <button
                onClick={() => recoverSatellite(sat?.id)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <Unlock className="w-4 h-4" /> RECOVER & RE-KEY SPACECRAFT
              </button>
            ) : (
              <button
                onClick={() => isolateSatellite(sat?.id)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-glow-crimson"
              >
                <Lock className="w-4 h-4" /> ISOLATE FROM MESH TOPOLOGY
              </button>
            )}
          </div>
        </div>

        {/* Right: ISL Links Table */}
        <div className="lg:col-span-7 p-5 rounded-2xl glass-panel border border-space-border space-y-3">
          <div className="flex items-center justify-between border-b border-space-border/80 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyber-cyan" />
              <h3 className="font-display font-bold text-sm text-white uppercase">INTER-SATELLITE LINKS (ISL) [{links.length}]</h3>
            </div>
            <span className="text-xs text-cyber-cyan">{links.filter((l) => l.status === 'ONLINE').length} ONLINE</span>
          </div>

          <div className="overflow-y-auto max-h-[360px] pr-1 space-y-2 text-xs">
            {links.map((link) => (
              <div
                key={link.id}
                className="p-2.5 rounded-xl bg-space-card/70 border border-space-border/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${link.status === 'ONLINE' ? 'bg-cyber-emerald' : 'bg-cyber-crimson'}`} />
                  <div>
                    <span className="font-bold text-slate-200">{link.id}</span>
                    <div className="text-[10px] text-slate-400">{link.link_type} • {link.encryption_algorithm || 'AES-256-GCM'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px]">
                  <div>
                    <span className="text-slate-500 text-[9px] block">BANDWIDTH</span>
                    <span className="text-slate-300 font-bold">{link.bandwidth_mbps} Mbps</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block">LATENCY</span>
                    <span className="text-slate-300 font-bold">{link.latency_ms} ms</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    link.status === 'ONLINE' ? 'bg-emerald-950 text-cyber-emerald' : 'bg-red-950 text-cyber-crimson'
                  }`}>
                    {link.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
