import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { trustAPI } from '../services/api';
import { ShieldCheck, Info } from 'lucide-react';

export const TrustRadar = ({ satelliteId = 'SAT-03' }) => {
  const [factors, setFactors] = useState(null);

  useEffect(() => {
    const fetchFactors = async () => {
      try {
        const res = await trustAPI.getFactors(satelliteId);
        if (res.data) setFactors(res.data);
      } catch (err) {
        // Fallback default
        setFactors({
          auth_factor: 95,
          integrity_factor: 92,
          behaviour_factor: 88,
          reliability_factor: 90,
          telemetry_factor: 94,
          reputation_factor: 92,
          composite_score: 91.8,
        });
      }
    };
    fetchFactors();
    const interval = setInterval(fetchFactors, 1500);
    return () => clearInterval(interval);
  }, [satelliteId]);

  const data = [
    { subject: 'Authentication (25%)', value: factors?.auth_factor || 95, fullMark: 100 },
    { subject: 'Packet Integrity (20%)', value: factors?.integrity_factor || 92, fullMark: 100 },
    { subject: 'Behaviour Consistency (20%)', value: factors?.behaviour_factor || 88, fullMark: 100 },
    { subject: 'Comm Reliability (15%)', value: factors?.reliability_factor || 90, fullMark: 100 },
    { subject: 'Telemetry Stability (10%)', value: factors?.telemetry_factor || 94, fullMark: 100 },
    { subject: 'Historical Reputation (10%)', value: factors?.reputation_factor || 92, fullMark: 100 },
  ];

  return (
    <div className="p-4 rounded-2xl glass-panel border border-space-border/80 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyber-cyan" />
          <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
            6-FACTOR TRUST MATRIX [{satelliteId}]
          </h3>
        </div>
        <div className="text-xs font-mono text-cyan-300 font-bold">
          SCORE: <span className="text-base text-cyber-cyan">{factors?.composite_score || 92}%</span>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#1e2b4d" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#1e2b4d" />
            <Radar
              name="Trust Factor"
              dataKey="value"
              stroke="#00f0ff"
              fill="#00f0ff"
              fillOpacity={0.35}
            />
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
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-space-border/60 text-[10px] font-mono text-slate-400">
        <div>Auth: <span className="text-slate-200 font-bold">{factors?.auth_factor || 95}%</span></div>
        <div>Integ: <span className="text-slate-200 font-bold">{factors?.integrity_factor || 92}%</span></div>
        <div>Behav: <span className="text-slate-200 font-bold">{factors?.behaviour_factor || 88}%</span></div>
        <div>Rel: <span className="text-slate-200 font-bold">{factors?.reliability_factor || 90}%</span></div>
        <div>Telem: <span className="text-slate-200 font-bold">{factors?.telemetry_factor || 94}%</span></div>
        <div>Rep: <span className="text-slate-200 font-bold">{factors?.reputation_factor || 92}%</span></div>
      </div>
    </div>
  );
};
