import React, { useState, useEffect } from 'react';
import { useConstellation } from '../context/ConstellationContext';
import { missionsAPI } from '../services/api';
import { MissionContinuityHUD } from '../components/MissionContinuityHUD';
import { Rocket, ArrowRight, ShieldCheck, CheckCircle2, RefreshCw, FileText, Activity } from 'lucide-react';

export const MissionControl = () => {
  const { continuitySummary, satellites } = useConstellation();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await missionsAPI.getContinuityReport();
        if (res.data) setReport(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReport();
    const interval = setInterval(fetchReport, 2500);
    return () => clearInterval(interval);
  }, []);

  const avail = continuitySummary?.mission_availability || 100;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-white flex items-center gap-2">
            MISSION CONTINUITY & WORKLOAD SURVIVABILITY
          </h2>
          <p className="text-xs text-slate-400">
            Autonomous Orbital Task Migration & Dynamic Dijkstra Secure Route Recalculation
          </p>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-space-border space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">MISSION AVAILABILITY</span>
          <div className="font-display font-black text-2xl text-cyber-emerald">{avail}%</div>
          <div className="text-[10px] text-slate-400">Continuous Space Operations</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-space-border space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">RUNNING PAYLOAD TASKS</span>
          <div className="font-display font-black text-2xl text-white">
            {continuitySummary?.running_tasks || 5}/{continuitySummary?.total_tasks || 5}
          </div>
          <div className="text-[10px] text-slate-400">Imaging & Communication Tasks</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-space-border space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">WORKLOAD MIGRATIONS</span>
          <div className="font-display font-black text-2xl text-cyber-amber">
            {continuitySummary?.migrated_tasks || 0}
          </div>
          <div className="text-[10px] text-slate-400">Dynamic Failover Reallocations</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-space-border space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">NETWORK HEALTH INDEX</span>
          <div className="font-display font-black text-2xl text-cyber-cyan">
            {continuitySummary?.network_health_index || 100}%
          </div>
          <div className="text-[10px] text-slate-400">ISL Constellation Reachability</div>
        </div>
      </div>

      {/* Continuity Workload Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <MissionContinuityHUD />
        </div>

        {/* Resilience Architecture Card */}
        <div className="lg:col-span-4 p-5 rounded-2xl glass-panel border border-space-border text-xs space-y-3">
          <div className="flex items-center gap-2 text-cyber-cyan font-bold uppercase">
            <ShieldCheck className="w-4 h-4" /> RESILIENCE MECHANISM
          </div>

          <div className="p-3 rounded-xl bg-space-card/90 border border-space-border text-[11px] leading-relaxed text-slate-300 space-y-2">
            <div><strong>Zero-Disruption Migration:</strong></div>
            <div>
              When a satellite becomes suspicious or isolated, OrbitTrace Nexus does NOT shut down the mission.
              Instead, it automatically re-anchors the task onto the nearest trusted orbital plane neighbor.
            </div>
          </div>

          <div className="space-y-2 text-[10px] text-slate-400 pt-2 border-t border-space-border/60">
            <div className="flex items-center justify-between">
              <span>Earth Observation Scan:</span>
              <span className="text-slate-200">SAT-03 → SAT-05 (Failover)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Telemetry Relay:</span>
              <span className="text-slate-200">SAT-02 → GS-ALPHA</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Maritime SAR Scan:</span>
              <span className="text-slate-200">SAT-06 → GS-GAMMA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
