import React from 'react';
import { useConstellation } from '../context/ConstellationContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Activity, AlertTriangle } from 'lucide-react';

export const TelemetryDriftChart = ({ satelliteId = 'SAT-03' }) => {
  const { selectedSatellite } = useConstellation();
  const sat = selectedSatellite;
  const telem = sat?.telemetry || {};
  const baseline = sat?.baseline_profile || {
    packet_rate: { mean: 120 },
    latency: { mean: 32 },
    cpu: { mean: 32 },
    temperature: { mean: 24.5 },
    packet_loss: { mean: 0.4 },
  };

  const devScore = sat?.behaviour_deviation || 0;

  const data = [
    {
      metric: 'Packet Rate',
      actual: telem.packet_tx_rate || 120,
      baseline: baseline.packet_rate?.mean || 120,
      unit: 'pkts/s',
    },
    {
      metric: 'CPU Load',
      actual: telem.cpu_utilization || 32,
      baseline: baseline.cpu?.mean || 32,
      unit: '%',
    },
    {
      metric: 'Temperature',
      actual: telem.temperature || 24.5,
      baseline: baseline.temperature?.mean || 24.5,
      unit: '°C',
    },
    {
      metric: 'Latency',
      actual: telem.latency || 30,
      baseline: baseline.latency?.mean || 30,
      unit: 'ms',
    },
    {
      metric: 'Packet Loss',
      actual: (telem.packet_loss_rate || 0.4) * 10, // scaled for chart visibility
      baseline: (baseline.packet_loss?.mean || 0.4) * 10,
      unit: '% (x10)',
    },
  ];

  return (
    <div className="p-4 rounded-2xl glass-panel border border-space-border/80 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyber-cyan" />
          <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
            BEHAVIOURAL DEVIATION & DRIFT [{sat?.id || satelliteId}]
          </h3>
        </div>
        <div className="text-xs font-mono">
          DEVIATION: <span className={`font-bold ${devScore > 40 ? 'text-cyber-crimson' : 'text-cyber-cyan'}`}>{Math.round(devScore)}%</span>
        </div>
      </div>

      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2b4d" vertical={false} />
            <XAxis dataKey="metric" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0b1224',
                borderColor: '#1d2c4e',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'JetBrains Mono',
                fontSize: '11px',
              }}
            />
            <Bar dataKey="baseline" fill="#1e2b4d" name="Learned Baseline" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" fill="#00f0ff" name="Live Observation" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => {
                const diff = Math.abs(entry.actual - entry.baseline);
                const isHigh = diff > entry.baseline * 0.4;
                return <Cell key={`cell-${index}`} fill={isHigh ? '#ff0055' : '#00f0ff'} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-space-border/60 text-[10px] font-mono text-slate-500">
        <span>Dark Blue: Baseline Profile | Cyan/Red: Live Telemetry</span>
        <span className="text-cyber-cyan">Z-Score Statistical Drift</span>
      </div>
    </div>
  );
};
