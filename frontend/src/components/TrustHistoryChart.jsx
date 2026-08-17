import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { useConstellation } from '../context/ConstellationContext';
import { TrendingUp, Activity } from 'lucide-react';

export const TrustHistoryChart = ({ satelliteId = 'SAT-03' }) => {
  const { satellites } = useConstellation();
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const targetSat = satellites.find((s) => s.id === satelliteId);
    const currentTrust = targetSat?.trust_score ?? 95;
    const now = new Date();
    const timeLabel = `${now.getMinutes()}:${now.getSeconds().toString().padStart(2, '0')}`;

    setHistoryData((prev) => {
      const updated = [...prev, { time: timeLabel, trust: Math.round(currentTrust) }];
      return updated.slice(-20); // keep last 20 ticks
    });
  }, [satellites, satelliteId]);

  return (
    <div className="p-4 rounded-2xl glass-panel border border-space-border/80 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyber-cyan" />
          <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
            DYNAMIC TRUST EVOLUTION [{satelliteId}]
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400">
          THRESHOLD: <span className="text-cyber-crimson font-bold">&lt;20 (ISOLATE)</span>
        </div>
      </div>

      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2b4d" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
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
            <ReferenceLine y={20} stroke="#ff0055" strokeDasharray="3 3" label={{ value: 'ISOLATION', fill: '#ff0055', fontSize: 9 }} />
            <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'HIGH RISK', fill: '#f59e0b', fontSize: 9 }} />
            <Line
              type="monotone"
              dataKey="trust"
              stroke="#00f0ff"
              strokeWidth={2}
              dot={{ r: 2, fill: '#00f0ff' }}
              activeDot={{ r: 5, fill: '#ffffff', stroke: '#00f0ff' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-space-border/60 text-[10px] font-mono text-slate-500">
        <span>Sampling: 1Hz Telemetry Ticks</span>
        <span className="text-cyber-cyan">REAL-TIME DECAY & RECOVERY</span>
      </div>
    </div>
  );
};
