import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Building2,
  Phone,
  Radio,
  UserCheck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Truck,
  MapPin,
  ChevronLeft,
  ShieldAlert,
  Sliders,
} from 'lucide-react';

export const ZoneDetailView: React.FC = () => {
  const { zones, selectedZoneId, assets, alerts, navigateTo, updateZoneScore, resolveAlert, perms } =
    useApp();

  // Selected zone or default to Zone 4 (Seethammadhara) or Zone 1
  const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[3] || zones[0];
  const [activeTab, setActiveTab] = useState<'checklist' | 'assets' | 'alerts'>('checklist');

  const zoneAssets = assets.filter((a) => a.zoneId === currentZone?.id);
  const zoneAlerts = alerts.filter((a) => a.zoneId === currentZone?.id && !a.resolved);

  if (!currentZone) {
    return (
      <div className="p-6">
        <div className="bg-[#0F1A2E] border border-white/10 rounded-lg p-8 text-center">
          <ShieldAlert className="w-8 h-8 text-[#2E9CCA] mx-auto mb-3" />
          <h1 className="font-display font-bold text-xl text-white">No zones available</h1>
          <p className="text-sm text-slate-400 mt-2">
            No zone records are visible to your account yet. Once zones are added they will appear here.
          </p>
          <button
            onClick={() => navigateTo('dashboard')}
            className="mt-5 px-4 py-2 rounded bg-[#152238] hover:bg-[#1f3152] border border-white/10 text-slate-200 text-sm transition-colors"
          >
            Back to Overview
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header & Zone Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('dashboard')}
            className="p-2 rounded bg-[#152238] hover:bg-[#1f3152] border border-white/10 text-slate-300 transition-colors"
            title="Back to Overview"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#2E9CCA] font-semibold uppercase">
                ZONE {currentZone.number}
              </span>
              <StatusBadge status={currentZone.status} size="sm" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">
              {currentZone.name}
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Population at risk: <span className="text-white font-mono">{(currentZone.populationAtRisk ?? 0).toLocaleString()}</span> • Shelters: <span className="text-white font-mono">{currentZone.shelterCount ?? 0}</span> • Assets: <span className="text-white font-mono">{zoneAssets.length}</span>
            </p>
          </div>
        </div>

        {/* Zone Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-slate-400">Select Zone:</label>
          <select
            value={currentZone.id}
            onChange={(e) => navigateTo('zone-detail', { zoneId: e.target.value })}
            className="bg-[#0B1220] border border-white/20 text-white font-mono text-xs rounded px-3 py-2 focus:outline-none focus:border-[#2E9CCA]"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                Zone {z.number} - {z.name.split('-')[1]?.trim()} ({z.readinessScore}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Officer Contact & Readiness Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Officer Card */}
        <div className="lg:col-span-5 bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Command Officer Assigned
            </span>
            <span className="text-xs font-mono text-[#2FBF71] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2FBF71]" />
              ACTIVE ON RADIO
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#152238] border border-[#2E9CCA]/40 flex items-center justify-center text-[#2E9CCA] font-display font-bold text-lg shrink-0">
              Z{currentZone.number}
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">{currentZone.officerName}</h3>
              <p className="text-xs text-slate-400 font-mono">{currentZone.officerRole}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Emergency Phone:</span>
              <span className="text-[#2E9CCA] font-bold">{currentZone.officerContact}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Zone VHF Channel:</span>
              <span className="text-white">CH-0{currentZone.number} (156.8 MHz)</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <a
              href={`tel:${currentZone.officerContact.replace(/\s+/g, '')}`}
              className="flex-1 py-2 rounded bg-[#2E9CCA]/20 hover:bg-[#2E9CCA]/30 border border-[#2E9CCA]/40 text-[#2E9CCA] text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Officer</span>
            </a>
            <button
              onClick={() => alert(`Radio Advisory issued to Zonal Officer ${currentZone.officerName} on VHF CH-0${currentZone.number}`)}
              className="flex-1 py-2 rounded bg-[#152238] hover:bg-[#1f3152] border border-white/10 text-slate-200 text-xs font-mono flex items-center justify-center gap-2 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-[#2FBF71]" />
              <span>Radio Advisory</span>
            </button>
          </div>
        </div>

        {/* Readiness Adjuster */}
        <div className="lg:col-span-7 bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl flex flex-col justify-between">
          <div className="pb-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">Zone Preparedness Index</span>
              <StatusBadge status={currentZone.status} size="sm" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-display font-extrabold text-4xl text-white">
                {currentZone.readinessScore}%
              </span>
              <span className="text-xs font-mono text-slate-400">Readiness Score</span>
            </div>
          </div>

          {/* Quick Override Controls */}
          {perms.editZones && (
          <div className="py-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-[#2E9CCA]" />
                Adjust Operational Readiness Rating
              </span>
              <span className="text-white">{currentZone.readinessScore}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={currentZone.readinessScore}
              onChange={(e) => updateZoneScore(currentZone.id, parseInt(e.target.value))}
              className="w-full accent-[#2E9CCA] bg-[#0B1220] h-2 rounded cursor-pointer"
            />

            <div className="flex gap-2">
              <button
                onClick={() => updateZoneScore(currentZone.id, 95)}
                className="px-2.5 py-1 rounded bg-[#2FBF71]/20 hover:bg-[#2FBF71]/30 text-[#2FBF71] text-xs font-mono border border-[#2FBF71]/40"
              >
                Set 95% (Ready)
              </button>
              <button
                onClick={() => updateZoneScore(currentZone.id, 50)}
                className="px-2.5 py-1 rounded bg-[#E4572E]/20 hover:bg-[#E4572E]/30 text-[#E4572E] text-xs font-mono border border-[#E4572E]/40"
              >
                Set 50% (Critical)
              </button>
            </div>
          </div>
          )}

          <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-white/5">
            Manual score adjustments update the city-wide Commissioner Overview instantly.
          </div>
        </div>
      </div>

      {/* Tabs: Department Checklist vs Assets vs Alerts */}
      <div className="bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl">
        <div className="flex items-center gap-4 border-b border-white/10 pb-3 mb-5">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`font-display font-medium text-sm pb-1 transition-colors border-b-2 ${
              activeTab === 'checklist'
                ? 'border-[#2E9CCA] text-[#2E9CCA]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Department Breakdown & Tasks
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`font-display font-medium text-sm pb-1 transition-colors border-b-2 ${
              activeTab === 'assets'
                ? 'border-[#2E9CCA] text-[#2E9CCA]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Assigned Assets ({zoneAssets.length})
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`font-display font-medium text-sm pb-1 transition-colors border-b-2 ${
              activeTab === 'alerts'
                ? 'border-[#2E9CCA] text-[#2E9CCA]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Zone Alerts ({zoneAlerts.length})
          </button>
        </div>

        {/* Tab 1: Department Breakdown */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(currentZone.deptBreakdown).map(([dept, rawData]) => {
                const data = rawData as { totalTasks: number; completedTasks: number; readiness: number; status: 'ready' | 'pending' | 'critical' };
                return (
                  <div
                    key={dept}
                    className="bg-[#0B1220] border border-white/10 rounded p-4 space-y-3"
                  >
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-white text-sm">{dept} Department</h4>
                    <StatusBadge status={data.status} size="sm" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-slate-300">
                      <span>Tasks Verified</span>
                      <span className="font-bold text-white">
                        {data.completedTasks} / {data.totalTasks}
                      </span>
                    </div>
                    <div className="w-full bg-[#152238] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          data.readiness >= 80
                            ? 'bg-[#2FBF71]'
                            : data.readiness >= 60
                            ? 'bg-[#F2B138]'
                            : 'bg-[#E4572E]'
                        }`}
                        style={{ width: `${data.readiness}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 pt-1 flex justify-between border-t border-white/5">
                    <span>Department Readiness:</span>
                    <span className="text-white font-bold">{data.readiness}%</span>
                  </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Assigned Assets */}
        {activeTab === 'assets' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono uppercase">
                  <th className="p-3">QR ID</th>
                  <th className="p-3">Asset Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Operator</th>
                  <th className="p-3">Last Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {zoneAssets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center font-mono text-slate-400">
                      No assets explicitly mapped to this zone yet.
                    </td>
                  </tr>
                ) : (
                  zoneAssets.map((ast) => (
                    <tr key={ast.id} className="hover:bg-[#152238]/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#2E9CCA]">{ast.qrId}</td>
                      <td className="p-3 font-medium text-white">{ast.name}</td>
                      <td className="p-3 font-mono uppercase text-slate-300">{ast.type}</td>
                      <td className="p-3">
                        <StatusBadge status={ast.status} size="sm" />
                      </td>
                      <td className="p-3 text-slate-300">{ast.operator}</td>
                      <td className="p-3 font-mono text-slate-400">{ast.lastInspectionDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Zone Alerts */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {zoneAlerts.length === 0 ? (
              <div className="p-6 text-center font-mono text-xs text-slate-400">
                No active alerts in this zone. All clear.
              </div>
            ) : (
              zoneAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-4 rounded bg-[#0B1220] border border-[#E4572E]/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={alt.severity === 'critical' ? 'critical' : 'pending'} size="sm" />
                      <span className="text-xs font-mono text-slate-400">{alt.timestamp}</span>
                    </div>
                    <h4 className="font-display font-semibold text-white text-sm">{alt.title}</h4>
                    <p className="text-xs text-slate-300">{alt.description}</p>
                  </div>

                  {perms.resolveAlerts && (
                  <button
                    onClick={() => resolveAlert(alt.id, 'Resolved via Zone Detail Panel')}
                    className="px-3 py-1.5 rounded bg-[#2FBF71]/20 hover:bg-[#2FBF71]/30 border border-[#2FBF71]/40 text-[#2FBF71] font-mono text-xs font-semibold shrink-0"
                  >
                    Mark Resolved
                  </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
