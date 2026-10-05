import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Building2,
  Truck,
  Home,
  MapPin,
  ClipboardCheck,
  Bell,
  Bot,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const DASHBOARD_LABELS: Record<string, string> = {
  commissioner: 'Commissioner Overview',
  deputy_commissioner: 'Deputy Overview',
  disaster_officer: 'Disaster Cell Overview',
  zone_officer: 'Zone Overview',
  dept_officer: 'Department Overview',
  field_inspector: 'Field Overview',
  shelter_manager: 'Shelter Overview',
  asset_manager: 'Asset Overview',
  volunteer: 'Readiness Overview',
  viewer: 'Readiness Overview',
};

export const Sidebar: React.FC = () => {
  const { activeTab, navigateTo, alerts, appRole, perms } = useApp();

  const activeCriticalAlerts = alerts.filter((a) => !a.resolved && a.severity === 'critical');

  const navItems = [
    { id: 'dashboard', label: DASHBOARD_LABELS[appRole ?? 'viewer'], icon: LayoutDashboard },
    { id: 'zone-detail', label: 'Zone Detail', icon: Building2 },
    { id: 'assets', label: 'Asset Management', icon: Truck },
    { id: 'shelters', label: 'Shelter Management', icon: Home },
    { id: 'map', label: 'Interactive Map', icon: MapPin },
    { id: 'inspections', label: 'Inspection Records', icon: ClipboardCheck },
    {
      id: 'alerts',
      label: 'Alerts & Notifications',
      icon: Bell,
      badge: activeCriticalAlerts.length > 0 ? activeCriticalAlerts.length : undefined,
      badgeColor: 'bg-[#E4572E]',
    },
    { id: 'ai', label: 'AI Tactical Assistant', icon: Bot, highlight: true },
    { id: 'reports', label: 'Reports & Analytics', icon: FileSpreadsheet },
    { id: 'admin', label: 'Admin & Role Control', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0F1A2E] border-r border-white/10 flex flex-col min-h-screen shrink-0">
      {/* Top App Identity */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-gradient-to-br from-[#2E9CCA] to-[#7C5CFC] flex items-center justify-center font-display font-bold text-lg text-white shadow-md glow-cyan">
          RQ
        </div>
        <div>
          <div className="font-display font-bold text-lg tracking-wider text-white leading-tight">
            RECQ360
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
          Command Modules
        </div>

        {navItems.map((item) => {
          if (!perms.tabs.includes(item.id)) return null;

          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all group font-sans text-xs font-medium ${
                isActive
                  ? 'bg-[#152238] text-[#2E9CCA] border-l-2 border-[#2E9CCA] glow-cyan'
                  : 'text-slate-300 hover:bg-[#152238]/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-[#2E9CCA]'
                      : item.highlight
                      ? 'text-[#7C5CFC]'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className={item.highlight && !isActive ? 'text-[#7C5CFC] font-semibold' : ''}>
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold text-white ${
                      item.badgeColor || 'bg-[#2E9CCA]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#2E9CCA]" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-white/10 bg-[#0B1220]/60">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 mb-1">
          <ShieldCheck className="w-4 h-4 text-[#2FBF71]" />
          <span>RECQ360-Integrated</span>
        </div>
        <div className="text-[10px] font-mono text-slate-400 leading-tight">
          Disaster Risk Management Platform
        </div>
      </div>
    </aside>
  );
};
