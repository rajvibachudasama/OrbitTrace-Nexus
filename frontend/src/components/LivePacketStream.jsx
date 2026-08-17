import React from 'react';
import { useConstellation } from '../context/ConstellationContext';
import { Radio, ArrowRight, ShieldCheck, ShieldAlert, Zap } from 'lucide-react';

export const LivePacketStream = () => {
  const { recentPackets } = useConstellation();

  return (
    <div className="p-4 rounded-2xl glass-panel border border-space-border/80 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyber-cyan animate-pulse" />
          <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
            ISL OPTICAL PACKET STREAM
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-300">LIVE ROUTING HOP TRACE</span>
      </div>

      <div className="space-y-1.5 overflow-y-auto max-h-[220px] pr-1 font-mono text-[11px]">
        {recentPackets && recentPackets.length > 0 ? (
          recentPackets.map((pkt) => {
            const isDropped = pkt.status?.includes('DROPPED');
            return (
              <div
                key={pkt.packet_id}
                className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                  isDropped
                    ? 'bg-red-950/40 border-cyber-crimson/50 text-cyber-crimson'
                    : 'bg-space-card/70 border-space-border/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isDropped ? 'bg-cyber-crimson' : 'bg-cyber-emerald'}`} />
                  <span className="font-bold text-slate-200">{pkt.packet_type}</span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span>{pkt.source_id}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="text-cyan-300">{pkt.destination_id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  {pkt.route && (
                    <span className="text-slate-500 hidden sm:inline">[{pkt.route.join('→')}]</span>
                  )}
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                      isDropped ? 'bg-red-900 text-cyber-crimson' : 'bg-emerald-950 text-cyber-emerald'
                    }`}
                  >
                    {pkt.status}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
            <Radio className="w-6 h-6 text-slate-600 mb-1" />
            <div className="text-xs">Streaming constellation packets...</div>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-space-border/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>HMAC-SHA256 Payload Integrity: VERIFIED</span>
        <span className="text-cyber-cyan">Dynamic Trust Cost Routing</span>
      </div>
    </div>
  );
};
