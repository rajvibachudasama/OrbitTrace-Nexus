import React from 'react';
import { NavLink } from 'react-router-dom';
import { useConstellation } from '../context/ConstellationContext';
import { 
  LayoutDashboard, 
  Orbit, 
  ShieldCheck, 
  Swords, 
  ShieldAlert, 
  Rocket, 
  FileText, 
  Radio, 
  Activity, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const Sidebar = () => {
  const { fleetSummary, activeThreats, activeAttacks } = useConstellation();

  const navItems = [
    { name: 'Space-SOC Overview', path: '/', icon: LayoutDashboard },
    { name: 'Constellation Topology', path: '/constellation', icon: Orbit },
    { name: 'Trust & Behavioural Engine', path: '/trust', icon: ShieldCheck },
    { 
      name: 'Distributed Attack Lab', 
      path: '/attack-lab', 
      icon: Swords, 
      badge: activeAttacks?.length > 0 ? `${activeAttacks.length} ACTIVE` : null,
      badgeColor: 'bg-cyber-crimson text-white' 
    },
    { 
      name: 'Autonomous Response', 
      path: '/response', 
      icon: ShieldAlert,
      badge: fleetSummary?.isolated_count > 0 ? `${fleetSummary.isolated_count} ISOLATED` : null,
      badgeColor: 'bg-amber-500 text-black'
    },
    { name: 'Mission Continuity', path: '/mission-control', icon: Rocket },
    { 
      name: 'Security Audit & Metrics', 
      path: '/audit', 
      icon: FileText,
      badge: activeThreats?.length > 0 ? `${activeThreats.length}` : null,
      badgeColor: 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40'
    },
  ];

  return (
    <aside className="w-64 h-[calc(100vh-4rem)] glass-panel border-r border-space-border/80 p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase px-3 mb-2">
            OPERATIONS CENTER
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyber-cyan/20 to-cyber-blue/10 text-cyber-cyan border border-cyber-cyan/40 shadow-glow-cyan'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-space-hover border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Live Constellation Quick Stats */}
        <div className="p-3 rounded-xl bg-space-card/90 border border-space-border">
          <div className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center justify-between">
            <span>CONSTELLATION STATUS</span>
            <Radio className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyber-emerald"></span> Trusted
              </span>
              <span className="font-bold text-cyber-emerald">{fleetSummary?.trusted_count || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyber-amber"></span> Suspicious
              </span>
              <span className="font-bold text-cyber-amber">{fleetSummary?.suspicious_count || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyber-crimson"></span> Isolated
              </span>
              <span className="font-bold text-cyber-crimson">{fleetSummary?.isolated_count || 0}</span>
            </div>

            <div className="pt-2 border-t border-space-border/60 flex items-center justify-between">
              <span className="text-slate-400">Mean Trust</span>
              <span className="font-bold text-cyan-300">{fleetSummary?.average_trust_score || 95}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-space-border/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-ping"></span>
          DIGITAL TWIN V1.0
        </span>
        <span className="text-cyber-cyan/80">LIVE 1Hz</span>
      </div>
    </aside>
  );
};
