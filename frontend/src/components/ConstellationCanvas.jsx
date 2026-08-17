import React, { useRef, useEffect, useState } from 'react';
import { useConstellation } from '../context/ConstellationContext';
import { Radio, ShieldAlert, Zap, Globe, Orbit, ShieldCheck } from 'lucide-react';

export const ConstellationCanvas = ({ fullScreen = false }) => {
  const canvasRef = useRef(null);
  const { satellites, groundStations, links, selectedSatelliteId, setSelectedSatelliteId, recentPackets } = useConstellation();
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas to display dimensions
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let packetPulse = 0;

    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Starfield background
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Space Grid
      ctx.strokeStyle = 'rgba(29, 44, 78, 0.3)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Draw Stylized Central Earth
      const earthRadius = Math.min(width, height) * 0.16;
      
      // Earth Atmosphere Glow
      const earthGlow = ctx.createRadialGradient(cx, cy, earthRadius * 0.8, cx, cy, earthRadius * 1.5);
      earthGlow.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
      earthGlow.addColorStop(0.5, 'rgba(30, 58, 138, 0.15)');
      earthGlow.addColorStop(1, 'rgba(6, 9, 19, 0)');
      ctx.fillStyle = earthGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, earthRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Earth Core Body
      const earthGrad = ctx.createRadialGradient(cx - earthRadius * 0.3, cy - earthRadius * 0.3, 5, cx, cy, earthRadius);
      earthGrad.addColorStop(0, '#1e3a8a');
      earthGrad.addColorStop(0.7, '#0f172a');
      earthGrad.addColorStop(1, '#020617');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Latitude/Longitude Grid on Earth
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(cx, cy, earthRadius * 0.9, earthRadius * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, earthRadius * 0.4, earthRadius * 0.9, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Earth Center Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '10px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('TERRA-1', cx, cy + 4);

      // 4. Draw Orbital Planes
      const orbitRx = Math.min(width, height) * 0.38;
      const orbitRy = Math.min(width, height) * 0.26;

      // Plane 1 Orbit Ellipse (Angle -25 deg)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((-25 * Math.PI) / 180);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(0, 0, orbitRx, orbitRy, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Plane 2 Orbit Ellipse (Angle +35 deg)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((35 * Math.PI) / 180);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(0, 0, orbitRx * 1.08, orbitRy * 1.08, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.setLineDash([]); // Reset line dash

      // Calculate Screen Positions of Satellites
      const satPositions = {};
      satellites.forEach((sat) => {
        const theta = ((sat.telemetry?.true_anomaly || 0) * Math.PI) / 180;
        const isPlane1 = sat.orbital_plane === 1;
        const tilt = isPlane1 ? (-25 * Math.PI) / 180 : (35 * Math.PI) / 180;
        const rx = isPlane1 ? orbitRx : orbitRx * 1.08;
        const ry = isPlane1 ? orbitRy : orbitRy * 1.08;

        const unrotatedX = rx * Math.cos(theta);
        const unrotatedY = ry * Math.sin(theta);

        const x = cx + unrotatedX * Math.cos(tilt) - unrotatedY * Math.sin(tilt);
        const y = cy + unrotatedX * Math.sin(tilt) + unrotatedY * Math.cos(tilt);

        satPositions[sat.id] = { x, y, sat };
      });

      // Calculate Ground Station Positions (Anchored on Earth surface)
      const gsPositions = {
        'GS-ALPHA': { x: cx - earthRadius * 0.65, y: cy + earthRadius * 0.1, name: 'Kourou GS' },
        'GS-BETA': { x: cx + earthRadius * 0.2, y: cy - earthRadius * 0.7, name: 'Svalbard GS' },
        'GS-GAMMA': { x: cx + earthRadius * 0.7, y: cy + earthRadius * 0.45, name: 'Canberra GS' }
      };

      // 5. Draw ISL Communication Links
      packetPulse = (packetPulse + 0.03) % 1;

      links.forEach((link) => {
        const srcPos = satPositions[link.source_id];
        const tgtPos = satPositions[link.target_id];

        if (srcPos && tgtPos) {
          ctx.beginPath();
          ctx.moveTo(srcPos.x, srcPos.y);
          ctx.lineTo(tgtPos.x, tgtPos.y);

          if (link.status === 'ISOLATED' || link.is_severed) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
            ctx.setLineDash([4, 6]);
            ctx.lineWidth = 1;
          } else if (link.status === 'DEGRADED' || link.status === 'UNSTABLE') {
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
            ctx.setLineDash([6, 3]);
            ctx.lineWidth = 2;
          } else {
            // Nominal Optical Laser Link
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
            ctx.setLineDash([]);
            ctx.lineWidth = 1.5;
          }
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated Optical Packet Pulse traveling across active links
          if (link.status === 'ONLINE') {
            const px = srcPos.x + (tgtPos.x - srcPos.x) * packetPulse;
            const py = srcPos.y + (tgtPos.y - srcPos.y) * packetPulse;
            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // reset
          }
        }
      });

      // 6. Draw Satellite Ground Station Uplink Arcs
      const activeUplinks = [
        { sat: 'SAT-01', gs: 'GS-ALPHA' },
        { sat: 'SAT-03', gs: 'GS-BETA' },
        { sat: 'SAT-07', gs: 'GS-GAMMA' }
      ];

      activeUplinks.forEach(({ sat, gs }) => {
        const sPos = satPositions[sat];
        const gPos = gsPositions[gs];
        if (sPos && gPos && !sPos.sat.is_isolated) {
          ctx.strokeStyle = 'rgba(0, 255, 136, 0.35)';
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(sPos.x, sPos.y);
          ctx.lineTo(gPos.x, gPos.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // 7. Draw Ground Stations
      Object.entries(gsPositions).forEach(([gsId, gPos]) => {
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.arc(gPos.x, gPos.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 255, 136, 0.4)';
        ctx.beginPath();
        ctx.arc(gPos.x, gPos.y, 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(gsId, gPos.x, gPos.y + 14);
      });

      // 8. Draw Satellites
      Object.values(satPositions).forEach(({ x, y, sat }) => {
        const isSelected = sat.id === selectedSatelliteId;
        const isHovered = hoveredNode === sat.id;
        const state = sat.security_state;

        // Color theme by security state
        let themeColor = '#00f0ff';
        let glowColor = 'rgba(0, 240, 255, 0.4)';

        if (state === 'ISOLATED' || sat.is_isolated) {
          themeColor = '#ff0055';
          glowColor = 'rgba(255, 0, 85, 0.7)';
        } else if (state === 'HIGH_RISK' || state === 'UNTRUSTED') {
          themeColor = '#f97316';
          glowColor = 'rgba(249, 115, 22, 0.6)';
        } else if (state === 'SUSPICIOUS') {
          themeColor = '#f59e0b';
          glowColor = 'rgba(245, 158, 11, 0.5)';
        } else if (state === 'RECOVERING') {
          themeColor = '#a855f7';
          glowColor = 'rgba(168, 85, 247, 0.6)';
        }

        // Outer Pulsing Radar Ring
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 14 + (isHovered ? 4 : 0), 0, Math.PI * 2);
        ctx.stroke();

        if (isSelected) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 18, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Spacecraft Core Node
        ctx.fillStyle = themeColor;
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = isSelected ? 16 : 8;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Satellite Solar Array Wings
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x - 12, y - 2, 4, 4);
        ctx.fillRect(x + 8, y - 2, 4, 4);

        // Labels (Name & Trust Score)
        ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
        ctx.font = isSelected ? 'bold 11px Orbitron' : '10px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(sat.id, x, y - 18);

        // Trust score indicator bar
        ctx.fillStyle = themeColor;
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillText(`${Math.round(sat.trust_score)}%`, x, y + 20);

        if (sat.is_isolated) {
          ctx.fillStyle = '#ff0055';
          ctx.font = 'bold 8px JetBrains Mono';
          ctx.fillText('ISOLATED', x, y + 30);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Canvas Click & Hover Detection
    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const cx = width / 2;
      const cy = height / 2;
      const orbitRx = Math.min(width, height) * 0.38;
      const orbitRy = Math.min(width, height) * 0.26;

      satellites.forEach((sat) => {
        const theta = ((sat.telemetry?.true_anomaly || 0) * Math.PI) / 180;
        const isPlane1 = sat.orbital_plane === 1;
        const tilt = isPlane1 ? (-25 * Math.PI) / 180 : (35 * Math.PI) / 180;
        const rx = isPlane1 ? orbitRx : orbitRx * 1.08;
        const ry = isPlane1 ? orbitRy : orbitRy * 1.08;

        const unrotatedX = rx * Math.cos(theta);
        const unrotatedY = ry * Math.sin(theta);
        const x = cx + unrotatedX * Math.cos(tilt) - unrotatedY * Math.sin(tilt);
        const y = cy + unrotatedX * Math.sin(tilt) + unrotatedY * Math.cos(tilt);

        const dist = Math.hypot(clickX - x, clickY - y);
        if (dist < 20) {
          setSelectedSatelliteId(sat.id);
        }
      });
    };

    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [satellites, groundStations, links, selectedSatelliteId, setSelectedSatelliteId, hoveredNode]);

  return (
    <div className={`relative w-full ${fullScreen ? 'h-[calc(100vh-8rem)]' : 'h-[460px]'} rounded-2xl overflow-hidden glass-panel border border-space-border/80 shadow-2xl`}>
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair block" />

      {/* Top Legend Overlay */}
      <div className="absolute top-4 left-4 p-3 rounded-xl bg-space-card/85 backdrop-blur-md border border-space-border text-xs font-mono space-y-1.5 pointer-events-none">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Orbit className="w-3.5 h-3.5 text-cyber-cyan" /> ORBITAL DIGITAL TWIN TOPOLOGY
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-cyber-cyan">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan"></span> Plane 1 (53° LEO)
          </span>
          <span className="flex items-center gap-1.5 text-purple-400">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span> Plane 2 (53° LEO)
          </span>
          <span className="flex items-center gap-1.5 text-cyber-emerald">
            <span className="w-2 h-2 rounded-full bg-cyber-emerald"></span> Ground Link
          </span>
        </div>
      </div>

      {/* Bottom Node Inspector Badge */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="px-3 py-1.5 rounded-lg bg-space-card/90 backdrop-blur-md border border-space-border text-xs font-mono text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping"></span>
          <span>CLICK ANY NODE TO INSPECT TELEMETRY OR EXECUTE DEFENSIVE ISOLATION</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-space-card/90 backdrop-blur-md border border-space-border text-xs font-mono text-cyan-300">
          SELECTED: <span className="font-bold font-orbitron">{selectedSatelliteId}</span>
        </div>
      </div>
    </div>
  );
};
