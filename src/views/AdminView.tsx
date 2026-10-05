import React, { useState } from 'react';
import { AddEntityButton } from '../components/common/AddEntityButton';
import { useApp } from '../context/AppContext';
import { ROLE_OPTIONS, roleLabel, type AppRole } from '../lib/roles';
import {
  Settings,
  ShieldCheck,
  Radio,
  Key,
  Users,
  History,
  Save,
  CheckCircle,
  Database,
  Lock,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { auditLogs, currentUser, directory, perms, zones, assignRole, pushNotification } = useApp();
  const [broadcast, setBroadcast] = useState({ title: '', body: '', severity: 'info' });

  const [vhfFrequency, setVhfFrequency] = useState('156.800 MHz (Ch 16 / Emergency)');
  const [waGatewayKey, setWaGatewayKey] = useState('CYC360_WA_PROD_88472910');
  const [telemetryInterval, setTelemetryInterval] = useState('15 seconds');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-[#2E9CCA]" />
            <span className="text-xs font-mono text-[#2E9CCA] uppercase">
              SYSTEM ADMINISTRATION
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">
            Command Center System Controls & Audit Log
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Network gateways, radio relay configurations & immutable audit logs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
        <AddEntityButton kind="notification" />
        <AddEntityButton kind="contact" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#2FBF71]/20 border border-[#2FBF71]/40 text-[#2FBF71] font-mono text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>ADMIN AUTH VERIFIED</span>
        </div>
        </div>
      </div>


      {/* User & Role Control — Commissioner only */}
      {perms.manageUsers && (
        <div className="bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl space-y-4">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2E9CCA]" />
              <span>User & Role Control</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">
              {directory.length} registered accounts • roles are never self-selected
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="text-slate-400 text-left">
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-3">Officer</th>
                  <th className="py-2 pr-3">Current role</th>
                  <th className="py-2 pr-3">Assign role</th>
                  <th className="py-2 pr-3">Zone</th>
                  <th className="py-2">Department</th>
                </tr>
              </thead>
              <tbody>
                {directory.map((u) => (
                  <tr key={u.id} className="border-b border-white/5">
                    <td className="py-2 pr-3">
                      <div className="text-white text-xs font-sans">{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-2 pr-3 text-[#2E9CCA]">
                      {u.role ? roleLabel(u.role) : 'Unassigned'}
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        value={u.role ?? 'viewer'}
                        disabled={u.id === currentUser.id}
                        onChange={(e) =>
                          void assignRole(u.id, e.target.value as AppRole, u.zoneId, u.department)
                        }
                        className="bg-[#0B1220] border border-white/15 rounded p-1.5 text-white disabled:opacity-40"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        value={u.zoneId ?? ''}
                        onChange={(e) =>
                          void assignRole(
                            u.id,
                            (u.role ?? 'viewer') as AppRole,
                            e.target.value || null,
                            u.department,
                          )
                        }
                        className="bg-[#0B1220] border border-white/15 rounded p-1.5 text-white"
                      >
                        <option value="">—</option>
                        {zones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <input
                        defaultValue={u.department ?? ''}
                        onBlur={(e) =>
                          void assignRole(
                            u.id,
                            (u.role ?? 'viewer') as AppRole,
                            u.zoneId,
                            e.target.value || null,
                          )
                        }
                        placeholder="Department"
                        className="w-32 bg-[#0B1220] border border-white/15 rounded p-1.5 text-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Broadcast a live notification */}
      <div className="bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl space-y-3">
        <div className="border-b border-white/10 pb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#7C5CFC]" />
          <h2 className="font-display font-semibold text-white text-base">Broadcast Notification</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
          <input
            value={broadcast.title}
            onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
            placeholder="Notification title"
            className="md:col-span-1 bg-[#0B1220] border border-white/15 rounded p-2.5 text-white"
          />
          <input
            value={broadcast.body}
            onChange={(e) => setBroadcast({ ...broadcast, body: e.target.value })}
            placeholder="Message"
            className="md:col-span-2 bg-[#0B1220] border border-white/15 rounded p-2.5 text-white"
          />
          <div className="flex gap-2">
            <select
              value={broadcast.severity}
              onChange={(e) => setBroadcast({ ...broadcast, severity: e.target.value })}
              className="flex-1 bg-[#0B1220] border border-white/15 rounded p-2.5 text-white"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <button
              onClick={() => {
                if (!broadcast.title.trim()) return;
                void pushNotification({
                  title: broadcast.title,
                  body: broadcast.body,
                  severity: broadcast.severity,
                });
                setBroadcast({ title: '', body: '', severity: 'info' });
              }}
              className="px-3 rounded bg-[#7C5CFC] hover:bg-[#6a4be0] text-white font-bold"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* System Config Settings (5 cols) */}
        <div className="lg:col-span-5 bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl space-y-4">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#2E9CCA]" />
              <span>Gateway Settings</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Node #CYC360-DISASTER-01</span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">VHF Radio Emergency Band:</label>
              <input
                type="text"
                value={vhfFrequency}
                onChange={(e) => setVhfFrequency(e.target.value)}
                className="w-full bg-[#0B1220] border border-white/15 rounded p-2.5 text-white focus:outline-none focus:border-[#2E9CCA]"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">WhatsApp Broadcast Gateway Token:</label>
              <div className="relative">
                <input
                  type="password"
                  value={waGatewayKey}
                  onChange={(e) => setWaGatewayKey(e.target.value)}
                  className="w-full bg-[#0B1220] border border-white/15 rounded p-2.5 text-white focus:outline-none focus:border-[#2E9CCA]"
                />
                <Key className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">IoT Telemetry Sync Frequency:</label>
              <select
                value={telemetryInterval}
                onChange={(e) => setTelemetryInterval(e.target.value)}
                className="w-full bg-[#0B1220] border border-white/15 rounded p-2.5 text-white"
              >
                <option value="5 seconds">5 seconds (High Frequency)</option>
                <option value="15 seconds">15 seconds (Standard)</option>
                <option value="60 seconds">60 seconds (Power Saver)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded bg-[#2E9CCA] hover:bg-[#2587af] text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Save Gateway Configuration</span>
              </button>
            </div>

            {isSaved && (
              <div className="p-2.5 rounded bg-[#2FBF71]/20 border border-[#2FBF71]/40 text-[#2FBF71] flex items-center justify-center gap-1.5 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Gateway settings saved successfully!</span>
              </div>
            )}
          </form>
        </div>

        {/* Audit Log Trail (7 cols) */}
        <div className="lg:col-span-7 bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
                <History className="w-4 h-4 text-[#7C5CFC]" />
                <span>Immutable System Audit Trail</span>
              </h2>
              <span className="text-xs font-mono text-[#7C5CFC]">{auditLogs.length} Events</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded bg-[#0B1220] border border-white/5 space-y-1 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#2E9CCA] font-bold">{log.actor || log.user}</span>
                    <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                  </div>
                  <div className="text-white font-sans text-xs">{log.action}</div>
                  <div className="text-[10px] text-slate-400">
                    Target: {log.target || log.details} • Node: {log.ipAddress || log.role}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Cryptographically Signed Audit Log</span>
            <span>RECQ360</span>
          </div>
        </div>
      </div>
    </div>
  );
};
