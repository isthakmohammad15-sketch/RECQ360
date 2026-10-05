import React, { useState } from 'react';
import { AddEntityButton } from '../components/common/AddEntityButton';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Bell,
  ShieldAlert,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Radio,
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { alerts, resolveAlert, triggerSimulatedAlert, perms } = useApp();
  const [showResolvedHistory, setShowResolvedHistory] = useState(true);

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-[#E4572E] animate-pulse" />
            <span className="text-xs font-mono text-[#E4572E] uppercase">
              TACTICAL ALERTS & THREAT NOTIFICATIONS
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">
            Active Alarms & Operational Disruption Feed
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Real-time notification stream for low readiness, equipment failures & communications tests
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
        <AddEntityButton kind="alert" />
        {perms.raiseAlerts && (
        <button
          onClick={triggerSimulatedAlert}
          className="px-4 py-2 rounded bg-[#E4572E]/20 hover:bg-[#E4572E]/30 border border-[#E4572E]/40 text-[#E4572E] font-mono text-xs font-bold flex items-center gap-2 glow-red shrink-0"
        >
          <Radio className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Broadcast Field Advisory</span>
        </button>
        )}
        </div>
      </div>

      {/* Active Alerts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2">
            <span>Active Vulnerabilities</span>
            <span className="px-2 py-0.5 rounded-full bg-[#E4572E] text-white font-mono text-xs font-bold">
              {activeAlerts.length}
            </span>
          </h2>
          <span className="text-xs font-mono text-slate-400">Order: Highest Severity First</span>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="bg-[#0F1A2E] border border-white/10 rounded-lg p-8 text-center font-mono text-xs text-[#2FBF71] space-y-2">
            <CheckCircle className="w-8 h-8 mx-auto" />
            <div className="text-sm font-bold text-white">ALL SYSTEM ALERTS RESOLVED</div>
            <div className="text-slate-400">No active operational disruptions detected across all zones.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => {
              const isCritical = alert.severity === 'critical';
              const isWarning = alert.severity === 'warning';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg bg-[#0F1A2E] border transition-all space-y-3 shadow-xl ${
                    isCritical
                      ? 'border-[#E4572E]/50 glow-red'
                      : isWarning
                      ? 'border-[#F2B138]/40'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status={
                          isCritical
                            ? 'critical'
                            : isWarning
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                      />
                      <span className="font-mono text-xs font-bold text-[#2E9CCA]">
                        {alert.zoneName}
                      </span>
                      <span className="text-xs font-mono text-slate-400">• {alert.department}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-white">
                      {alert.title}
                    </h3>
                    <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                      {alert.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/5">
                    <span className="text-xs font-mono text-slate-500">Alert ID: {alert.id}</span>
                    {perms.resolveAlerts && (
                    <button
                      onClick={() => resolveAlert(alert.id, 'Actioned from Command Alerts Hub')}
                      className="px-4 py-1.5 rounded bg-[#2FBF71]/20 hover:bg-[#2FBF71]/30 border border-[#2FBF71]/40 text-[#2FBF71] font-mono text-xs font-bold transition-colors"
                    >
                      Acknowledge & Mark Resolved
                    </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved Alerts History Section */}
      <div className="bg-[#0F1A2E] border border-white/10 rounded-lg p-4 shadow-xl space-y-3">
        <button
          onClick={() => setShowResolvedHistory(!showResolvedHistory)}
          className="w-full flex items-center justify-between font-display font-semibold text-sm text-slate-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#2FBF71]" />
            <span>Resolved Alerts History ({resolvedAlerts.length})</span>
          </div>
          {showResolvedHistory ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showResolvedHistory && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            {resolvedAlerts.length === 0 ? (
              <div className="text-xs font-mono text-slate-500 py-2">
                No resolved alerts recorded yet.
              </div>
            ) : (
              resolvedAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3 rounded bg-[#0B1220] border border-white/5 space-y-1 text-xs opacity-75"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-[#2FBF71] font-bold line-through">{alt.title}</span>
                    <span className="text-slate-500">{alt.resolvedAt || alt.timestamp}</span>
                  </div>
                  <p className="text-slate-400 font-sans">{alt.description}</p>
                  <div className="text-[10px] font-mono text-slate-500">
                    Resolution Action: {alt.actionTaken || 'Resolved'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
