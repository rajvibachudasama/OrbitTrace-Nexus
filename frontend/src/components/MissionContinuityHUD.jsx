import React, { useState, useEffect } from 'react';
import { useConstellation } from '../context/ConstellationContext';
import { missionsAPI } from '../services/api';
import { Rocket, RefreshCw, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const MissionContinuityHUD = () => {
  const { continuitySummary } = useConstellation();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await missionsAPI.getTasks();
        if (res.data) setTasks(res.data);
      } catch (err) {
        // Fallback default
        setTasks([
          { id: 'TASK-01', title: 'Earth Observation Multispectral Scan', primary_satellite_id: 'SAT-03', assigned_satellite_id: 'SAT-03', status: 'RUNNING' },
          { id: 'TASK-02', title: 'Deep Space Telemetry Relay Backbone', primary_satellite_id: 'SAT-02', assigned_satellite_id: 'SAT-02', status: 'RUNNING' },
          { id: 'TASK-03', title: 'Synthetic Aperture Radar Surveillance', primary_satellite_id: 'SAT-06', assigned_satellite_id: 'SAT-06', status: 'RUNNING' },
          { id: 'TASK-04', title: 'Tactical Secure Burst Communications', primary_satellite_id: 'SAT-05', assigned_satellite_id: 'SAT-05', status: 'RUNNING' },
          { id: 'TASK-05', title: 'Polar Meteorological Observation', primary_satellite_id: 'SAT-07', assigned_satellite_id: 'SAT-07', status: 'RUNNING' },
        ]);
      }
    };
    fetchTasks();
    const interval = setInterval(fetchTasks, 2000);
    return () => clearInterval(interval);
  }, []);

  const avail = continuitySummary?.mission_availability || 100.0;

  return (
    <div className="p-4 rounded-2xl glass-panel border border-space-border/80 h-full flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-cyber-cyan" />
          <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
            MISSION CONTINUITY & WORKLOAD SURVIVABILITY
          </h3>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono">
          <span className="text-slate-400">AVAILABILITY:</span>
          <span className={`font-bold font-orbitron text-sm ${avail >= 90 ? 'text-cyber-emerald' : 'text-cyber-amber'}`}>
            {avail}%
          </span>
        </div>
      </div>

      {/* Availability Metrics Bar */}
      <div className="mb-3 space-y-1.5">
        <div className="w-full h-2 rounded-full bg-space-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              avail >= 90 ? 'bg-gradient-to-r from-emerald-500 to-cyber-emerald' : 'bg-gradient-to-r from-amber-500 to-orange-500'
            }`}
            style={{ width: `${avail}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Active Tasks: {continuitySummary?.running_tasks || tasks.length}/{continuitySummary?.total_tasks || tasks.length}</span>
          <span className="text-cyan-300">Workload Migrations: {continuitySummary?.migrated_tasks || 0}</span>
        </div>
      </div>

      {/* Task Workload Reassignment Matrix */}
      <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
        {tasks.map((task) => {
          const isMigrated = task.assigned_satellite_id !== task.primary_satellite_id || task.status === 'MIGRATED';
          return (
            <div
              key={task.id}
              className={`p-2.5 rounded-xl border text-xs font-mono transition-all ${
                isMigrated
                  ? 'bg-amber-950/40 border-amber-500/50 text-white shadow-glow-amber'
                  : 'bg-space-card/80 border-space-border text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-200 text-[11px] truncate max-w-[200px]">{task.title}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    isMigrated
                      ? 'bg-amber-900/80 text-cyber-amber border border-cyber-amber/50'
                      : 'bg-emerald-900/60 text-cyber-emerald border border-cyber-emerald/40'
                  }`}
                >
                  {isMigrated ? 'MIGRATED (FAILOVER)' : 'OPTIMAL'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className={isMigrated ? 'line-through text-slate-500' : 'text-slate-300 font-bold'}>
                    {task.primary_satellite_id}
                  </span>
                  {isMigrated && (
                    <>
                      <ArrowRight className="w-3 h-3 text-cyber-amber" />
                      <span className="text-cyber-amber font-bold">{task.assigned_satellite_id}</span>
                    </>
                  )}
                </div>
                <span className="text-slate-500 font-mono">{task.target_ground_station || 'GS-UPLINK'}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-space-border/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>Autonomous Task Migration: ENABLED</span>
        <span className="text-cyber-cyan">Zero-Disruption Failover</span>
      </div>
    </div>
  );
};
