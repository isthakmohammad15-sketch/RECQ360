import React, { useState } from 'react';
import { AddEntityButton } from '../components/common/AddEntityButton';
import { useApp } from '../context/AppContext';
import { InspectionRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ClipboardCheck,
  Plus,
  Search,
  MapPin,
  Camera,
  Calendar,
  X,
  User,
  CheckCircle,
} from 'lucide-react';

export const InspectionView: React.FC = () => {
  const { inspections, zones, addInspection, currentUser, perms } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newZoneId, setNewZoneId] = useState(zones[0]?.id ?? '');
  const [newDepartment, setNewDepartment] = useState('Water Supply & Drainage');
  const [newItemChecked, setNewItemChecked] = useState('De-watering Pump Diesel Level & Starter Test');
  const [newRemarks, setNewRemarks] = useState('');
  const [newGps, setNewGps] = useState('17.7320° N, 83.3080° E');
  const [newStatus, setNewStatus] = useState<'verified' | 'flagged' | 'pending'>('verified');

  const filteredInspections = inspections.filter((insp) => {
    const matchesSearch =
      (insp.itemChecked ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (insp.remarks ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (insp.officerName ?? '').toLowerCase().includes(searchQuery.toLowerCase());


    const matchesZone = selectedZone === 'all' || insp.zoneId === selectedZone;
    const matchesStatus = selectedStatus === 'all' || insp.status === selectedStatus;

    return matchesSearch && matchesZone && matchesStatus;
  });

  const handleAddInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const zoneObj = zones.find((z) => z.id === newZoneId) || zones[0];
    if (!zoneObj) return;

    addInspection({
      zoneId: zoneObj.id,
      zoneName: zoneObj.name,
      officerName: `${currentUser?.name ?? 'Unknown'} (${currentUser?.title ?? 'Officer'})`,

      department: newDepartment,
      gpsCoordinates: newGps,
      photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
      remarks: newRemarks || 'Field verification completed according to the standard checklist protocol.',
      status: newStatus,
      itemChecked: newItemChecked,
    });

    setShowAddModal(false);
    setNewRemarks('');
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="w-4 h-4 text-[#2E9CCA]" />
            <span className="text-xs font-mono text-[#2E9CCA] uppercase">
              FIELD VERIFICATION REPOSITORY
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">
            Checklist Inspection Records
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Audit logs, GPS geotagged photo evidence, and status verification from Zonal Officers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
        {perms.submitInspections && (
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded bg-gradient-to-r from-[#2E9CCA] to-[#7C5CFC] hover:opacity-90 font-mono text-xs font-bold text-white flex items-center gap-2 shadow-lg glow-cyan shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Field Inspection</span>
        </button>
        )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0F1A2E] border border-white/10 rounded-lg p-4 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by item, officer, or remarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B1220] border border-white/15 rounded pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#2E9CCA]"
          />
        </div>

        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="bg-[#0B1220] border border-white/15 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#2E9CCA]"
        >
          <option value="all">All Zones</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              Zone {z.number} - {z.name.split('-')[1]?.trim()}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#0B1220] border border-white/15 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#2E9CCA]"
        >
          <option value="all">All Verification Statuses</option>
          <option value="verified">Verified (Pass)</option>
          <option value="flagged">Flagged (Issue Found)</option>
          <option value="pending">Pending Audit</option>
        </select>
      </div>

      {/* Inspection Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInspections.map((insp) => (
          <div
            key={insp.id}
            className="bg-[#0F1A2E] border border-white/10 rounded-lg p-4 space-y-3.5 shadow-xl hover:border-white/20 transition-all"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#2E9CCA]">
                  {insp.zoneName}
                </span>
                <span className="text-xs text-slate-400 font-mono">• {insp.department}</span>
              </div>
              <StatusBadge status={insp.status} size="sm" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5">
              <div className="relative group shrink-0">
                <img
                  src={insp.photoUrl}
                  alt={insp.itemChecked}
                  className="w-full sm:w-28 h-28 rounded object-cover border border-white/10"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="space-y-1.5 min-w-0 flex-1">
                <h3 className="font-display font-bold text-white text-sm">
                  {insp.itemChecked}
                </h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {insp.remarks}
                </p>

                {/* Geotag GPS in JetBrains Mono */}
                <div className="pt-2 font-mono text-[11px] text-[#2E9CCA] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>GPS: {insp.gpsCoordinates}</span>
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{insp.officerName}</span>
              </div>
              <span className="text-slate-500 shrink-0">{insp.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* New Field Inspection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1A2E] border border-white/20 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-white/10 pb-3">
              <h2 className="font-display font-bold text-xl text-white">
                Submit Live Field Inspection
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Geotagged checklist verification submission
              </p>
            </div>

            <form onSubmit={handleAddInspection} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Zone:</label>
                <select
                  value={newZoneId}
                  onChange={(e) => setNewZoneId(e.target.value)}
                  className="w-full bg-[#0B1220] border border-white/15 rounded p-2 text-white"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      Zone {z.number} - {z.name.split('-')[1]?.trim()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Department:</label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full bg-[#0B1220] border border-white/15 rounded p-2 text-white"
                >
                  <option value="Water Supply & Drainage">Water Supply & Drainage</option>
                  <option value="Power & DISCOM">Power & DISCOM</option>
                  <option value="Health & Medical">Health & Medical</option>
                  <option value="Roads & Drainage">Roads & Drainage</option>
                  <option value="Fire & Rescue">Fire & Rescue</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Item Inspected:</label>
                <input
                  type="text"
                  value={newItemChecked}
                  onChange={(e) => setNewItemChecked(e.target.value)}
                  className="w-full bg-[#0B1220] border border-white/15 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">GPS Geotag Coordinates:</label>
                <input
                  type="text"
                  value={newGps}
                  onChange={(e) => setNewGps(e.target.value)}
                  className="w-full bg-[#0B1220] border border-white/15 rounded p-2 text-[#2E9CCA]"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Status Result:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus('verified')}
                    className={`py-1.5 rounded font-bold border ${
                      newStatus === 'verified'
                        ? 'bg-[#2FBF71]/30 border-[#2FBF71] text-[#2FBF71]'
                        : 'bg-[#0B1220] border-white/10 text-slate-400'
                    }`}
                  >
                    VERIFIED
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('flagged')}
                    className={`py-1.5 rounded font-bold border ${
                      newStatus === 'flagged'
                        ? 'bg-[#E4572E]/30 border-[#E4572E] text-[#E4572E]'
                        : 'bg-[#0B1220] border-white/10 text-slate-400'
                    }`}
                  >
                    FLAGGED
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('pending')}
                    className={`py-1.5 rounded font-bold border ${
                      newStatus === 'pending'
                        ? 'bg-[#F2B138]/30 border-[#F2B138] text-[#F2B138]'
                        : 'bg-[#0B1220] border-white/10 text-slate-400'
                    }`}
                  >
                    PENDING
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Officer Field Remarks:</label>
                <textarea
                  rows={2}
                  value={newRemarks}
                  onChange={(e) => setNewRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  className="w-full bg-[#0B1220] border border-white/15 rounded p-2 text-white font-sans text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-[#152238] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#2E9CCA] text-white font-bold"
                >
                  Submit Geotagged Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
