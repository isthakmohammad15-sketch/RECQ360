import React, { useState } from 'react';
import { AddEntityButton } from '../components/common/AddEntityButton';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { InspectDetailModal } from '../components/common/InspectDetailModal';
import { Zone } from '../types';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Truck,
  Home,
  UserCheck,
  MapPin,
  RefreshCw,
  Plus,
  Radio,
  ExternalLink,
  Eye,
  MoreHorizontal,
  Trash2,
  Globe,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export const OverviewView: React.FC = () => {
  const {
    zones,
    overallReadiness,
    alerts,
    departmentStats,
    inspections,
    inspectionAggregate,
    navigateTo,
    resolveAlert,
    triggerSimulatedAlert,
    perms,
    deleteZone,
    activeCity,
    activeState,
    activeCountry,
  } = useApp();

  const [inspectZone, setInspectZone] = useState<Zone | null>(null);
  const [zoneToRemove, setZoneToRemove] = useState<Zone | null>(null);
  const [removing, setRemoving] = useState(false);


  const criticalAlerts = alerts.filter((a) => !a.resolved && a.severity === 'critical');
  const readyZonesCount = zones.filter((z) => z.status === 'ready').length;
  const criticalZonesCount = zones.filter((z) => z.status === 'critical').length;
  const pendingZonesCount = zones.filter((z) => z.status === 'pending').length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Top Hero Section: City Readiness */}
      <div className="bg-gradient-to-r from-[#0F1A2E] via-[#152238] to-[#0F1A2E] border border-white/10 rounded-lg p-5 md:p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2E9CCA]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2FBF71] animate-ping" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#2E9CCA]">
                LIVE DISASTER GRID • {activeCity ? activeCity.name.toUpperCase() : 'ALL CITIES'} • {activeState ? activeState.name.toUpperCase() : 'ALL STATES'} ({activeCountry && activeCountry !== 'all' ? activeCountry.toUpperCase() : 'GLOBAL'})
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">
              DISASTER MANAGEMENT &amp; READINESS OVERVIEW
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-sans mt-1">
              Live operational command across {zones.length} zones • Primary Hazard: {activeCity?.primaryHazard || 'Multi-Hazard Emergency Grid'}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AddEntityButton kind="zone" />
            <AddEntityButton kind="alert" />
          </div>

          {/* Large Readiness Numeral */}
          <div className="flex items-center gap-6 bg-[#0B1220]/80 border border-white/10 px-6 py-3.5 rounded-lg">
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Overall Preparedness
              </div>
              <div className="text-xs font-mono text-slate-300">
                Last updated: <span className="text-white">Just now</span>
              </div>
            </div>

            <div className="flex items-baseline gap-1">
              <span
                className={`font-display font-extrabold text-5xl md:text-6xl tracking-tight ${
                  overallReadiness >= 80
                    ? 'text-[#2FBF71]'
                    : overallReadiness >= 65
                    ? 'text-[#F2B138]'
                    : 'text-[#E4572E]'
                }`}
              >
                {overallReadiness}%
              </span>
            </div>
          </div>
        </div>

        {/* Executive KPI Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-[#0B1220]/60 border border-white/10 rounded p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Ready Zones</div>
            <div className="text-xl font-display font-bold text-[#2FBF71] mt-0.5">
              {readyZonesCount} <span className="text-xs font-normal text-slate-400">/ {zones.length}</span>
            </div>

          </div>

          <div className="bg-[#0B1220]/60 border border-white/10 rounded p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Critical Issues</div>
            <div className="text-xl font-display font-bold text-[#E4572E] mt-0.5">
              {criticalAlerts.length} <span className="text-xs font-normal text-slate-400">Active</span>
            </div>
          </div>

          <div className="bg-[#0B1220]/60 border border-white/10 rounded p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Pending Zones</div>
            <div className="text-xl font-display font-bold text-[#F2B138] mt-0.5">
              {pendingZonesCount} <span className="text-xs font-normal text-slate-400">Zones</span>
            </div>
          </div>

          <div className="bg-[#0B1220]/60 border border-white/10 rounded p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Field Inspections</div>
            <div className="text-xl font-display font-bold text-[#2E9CCA] mt-0.5">
              {inspections.length} <span className="text-xs font-normal text-slate-400">Submitted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row of 10 Zone Readiness Cards (Zone 1 - 10) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-base text-white flex items-center gap-2">
            <span>Zonal Preparedness Grid</span>
            <span className="text-xs font-mono text-slate-400 font-normal">({zones.length} Zones)</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">Click card for Zone Breakdown</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {zones.map((zone) => {
            const isCritical = zone.status === 'critical';
            const isPending = zone.status === 'pending';

            return (
              <div
                key={zone.id}
                onClick={() => navigateTo('zone-detail', { zoneId: zone.id })}
                className={`bg-[#0F1A2E] hover:bg-[#152238] border rounded p-3.5 cursor-pointer transition-all group relative ${
                  isCritical
                    ? 'border-[#E4572E]/50 glow-red'
                    : isPending
                    ? 'border-[#F2B138]/30 hover:border-[#F2B138]'
                    : 'border-white/10 hover:border-[#2E9CCA]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-[#2E9CCA]">
                    ZONE {zone.number}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={zone.status} size="sm" />
                    {perms.deleteZones && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Zone ${zone.number} actions`}
                            className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-colors opacity-60 group-hover:opacity-100 focus:opacity-100 outline-none"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(e) => e.stopPropagation()}
                          className="min-w-[9rem] bg-[#0F1A2E] border-white/10 text-slate-200"
                        >
                          <DropdownMenuItem
                            onSelect={() => setZoneToRemove(zone)}
                            className="text-[#E4572E] focus:text-[#E4572E] focus:bg-[#E4572E]/10 text-xs font-mono"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove Zone
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                <h3 className="font-display font-medium text-white text-sm truncate mb-2 group-hover:text-[#2E9CCA] transition-colors">
                  {zone.name.split('-')[1]?.trim() || zone.name}
                </h3>

                {/* Readiness score bar */}
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Readiness</span>
                    <span
                      className={`font-bold ${
                        zone.readinessScore >= 80
                          ? 'text-[#2FBF71]'
                          : zone.readinessScore >= 60
                          ? 'text-[#F2B138]'
                          : 'text-[#E4572E]'
                      }`}
                    >
                      {zone.readinessScore}%
                    </span>
                  </div>
                  <div className="w-full bg-[#0B1220] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        zone.readinessScore >= 80
                          ? 'bg-[#2FBF71]'
                          : zone.readinessScore >= 60
                          ? 'bg-[#F2B138]'
                          : 'bg-[#E4572E]'
                      }`}
                      style={{ width: `${zone.readinessScore}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5 gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectZone(zone);
                    }}
                    className="px-2 py-1 rounded bg-[#152238] hover:bg-[#203254] border border-white/10 text-[10px] text-[#2E9CCA] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Inspect Details</span>
                  </button>

                  <div className="flex items-center gap-0.5 text-slate-400">
                    <span>{zone.pendingTaskCount} pending</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#2E9CCA] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Zone removal confirmation */}
        <AlertDialog open={!!zoneToRemove} onOpenChange={(o) => !o && setZoneToRemove(null)}>
          <AlertDialogContent className="bg-[#0F1A2E] border-white/10 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">Remove Zone?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400 text-sm">
                Are you sure you want to remove {zoneToRemove?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[#152238] border-white/10 text-slate-200 hover:bg-[#203254] hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={removing}
                onClick={async (e) => {
                  e.preventDefault();
                  if (!zoneToRemove) return;
                  setRemoving(true);
                  await deleteZone(zoneToRemove.id);
                  setRemoving(false);
                  setZoneToRemove(null);
                }}
                className="bg-[#E4572E] text-white hover:bg-[#c9451f]"
              >
                Remove Zone
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Unified Inspect Detail Modal for Zone */}
        <InspectDetailModal
          isOpen={!!inspectZone}
          onClose={() => setInspectZone(null)}
          type="zone"
          data={inspectZone}
        />
      </div>

      {/* Middle Section: Critical Issues Panel & Department Completion Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Critical Issues Panel (5 cols) */}
        <div className="lg:col-span-5 bg-[#0F1A2E] border border-white/10 rounded-lg p-5 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#E4572E] animate-pulse" />
              <h2 className="font-display font-semibold text-white text-base">
                Critical Issues & Vulnerabilities
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#E4572E]/20 text-[#E4572E] font-mono text-xs font-bold">
              {criticalAlerts.length} Active
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {criticalAlerts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 font-mono text-xs">
                No active critical issues flagged. All systems nominal.
              </div>
            ) : (
              criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded bg-[#0B1220] border border-[#E4572E]/30 space-y-2 relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-semibold text-[#E4572E] uppercase">
                      {alert.zoneName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{alert.timestamp}</span>
                  </div>

                  <h4 className="font-display font-medium text-white text-sm leading-snug">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs font-mono">
                    <span className="text-slate-400">Dept: {alert.department}</span>
                    {perms.resolveAlerts && (
                    <button
                      onClick={() => resolveAlert(alert.id, 'Dispatched Mobile Response Unit')}
                      className="px-2.5 py-1 rounded bg-[#2FBF71]/20 hover:bg-[#2FBF71]/30 border border-[#2FBF71]/40 text-[#2FBF71] text-xs font-semibold transition-colors"
                    >
                      Acknowledge & Dispatch
                    </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Department-Wise Completion Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div>
              <h2 className="font-display font-semibold text-white text-base">
                Department Readiness Progress
              </h2>
              <p className="text-xs text-slate-400 font-mono">Completion rate across city departments</p>
            </div>
            <span className="text-xs font-mono text-[#2E9CCA]">
              Live Inspection Aggregate • {inspectionAggregate.completed}/{inspectionAggregate.total}{' '}
              verified ({inspectionAggregate.completionRate}%) • {inspectionAggregate.pending} pending •{' '}
              {inspectionAggregate.flagged} flagged
            </span>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentStats}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis dataKey="department" type="category" stroke="#94a3b8" fontSize={12} width={125} fontFamily="Inter" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1A2E',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono',
                  }}
                  formatter={(value: any) => [`${value}% Complete`, 'Readiness']}
                />
                <Bar dataKey="completionRate" radius={[0, 4, 4, 0]} barSize={20}>
                  {departmentStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.completionRate >= 85
                          ? '#2FBF71'
                          : entry.completionRate >= 70
                          ? '#F2B138'
                          : '#E4572E'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Inspection Feed */}
      <div className="bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-white/10 mb-4">
          <div>
            <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#2E9CCA] animate-pulse" />
              <span>Live Field Inspection Stream</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Real-time checklist verification logs from Zonal Officers
            </p>
          </div>

          <button
            onClick={() => navigateTo('inspections')}
            className="px-3 py-1.5 rounded bg-[#152238] hover:bg-[#1f3152] border border-white/10 text-xs font-mono text-[#2E9CCA] flex items-center gap-1 transition-colors"
          >
            <span>View All Inspection Logs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {inspections.slice(0, 3).map((insp) => (
            <div
              key={insp.id}
              className="bg-[#0B1220] border border-white/10 rounded p-3.5 space-y-2.5 hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#2E9CCA] font-semibold">{insp.zoneName}</span>
                <StatusBadge status={insp.status} size="sm" />
              </div>

              <div className="flex items-start gap-3">
                <img
                  src={insp.photoUrl}
                  alt={insp.itemChecked}
                  className="w-16 h-16 rounded object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-display font-medium text-white text-xs line-clamp-1">
                    {insp.itemChecked}
                  </h4>
                  <p className="text-[11px] text-slate-300 font-sans line-clamp-2 mt-0.5">
                    {insp.remarks}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{insp.officerName.split('(')[0]}</span>
                <span className="text-slate-500">{insp.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
