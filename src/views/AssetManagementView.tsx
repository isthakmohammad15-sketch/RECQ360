import React, { useState } from 'react';
import { AddEntityButton } from '../components/common/AddEntityButton';
import { useApp } from '../context/AppContext';
import { Asset, AssetType } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { InspectDetailModal } from '../components/common/InspectDetailModal';
import {
  Truck,
  Search,
  Filter,
  QrCode,
  Wrench,
  X,
  CheckCircle,
  AlertTriangle,
  History,
  MapPin,
  Calendar,
  Eye,
} from 'lucide-react';

export const AssetManagementView: React.FC = () => {
  const { assets, zones, updateAssetStatus } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [newStatus, setNewStatus] = useState<Asset['status']>('ready');
  const [statusNotes, setStatusNotes] = useState('');

  // Filtered Assets list
  const filteredAssets = assets.filter((ast) => {
    const matchesSearch =
      ast.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ast.qrId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ast.operator.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesZone = selectedZoneFilter === 'all' || ast.zoneId === selectedZoneFilter;
    const matchesType = selectedTypeFilter === 'all' || ast.type === selectedTypeFilter;
    const matchesStatus = selectedStatusFilter === 'all' || ast.status === selectedStatusFilter;

    return matchesSearch && matchesZone && matchesType && matchesStatus;
  });

  const handleOpenDetail = (ast: Asset) => {
    setSelectedAsset(ast);
    setNewStatus(ast.status);
    setStatusNotes('');
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAsset) {
      updateAssetStatus(selectedAsset.id, newStatus, statusNotes);
      // Refresh current selectedAsset
      setSelectedAsset((prev) => (prev ? { ...prev, status: newStatus } : null));
      setStatusNotes('');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-[#2E9CCA]" />
            <span className="text-xs font-mono text-[#2E9CCA] uppercase">
              CENTRAL ASSET REGISTRY
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">
            Asset & Heavy Machinery Tracking
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Pumps, Generators, Rescue Boats, JCB Excavators, Ambulances, Chainsaws & Satellite Phones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-slate-300">
          <AddEntityButton kind="asset" />
          <AddEntityButton kind="asset" label="Add Vehicle" />
          <AddEntityButton kind="asset" label="Add Equipment" />
          <div className="px-3 py-1.5 rounded bg-[#0B1220] border border-white/10">
            Total Assets: <span className="text-white font-bold">{assets.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded bg-[#E4572E]/20 border border-[#E4572E]/40 text-[#E4572E]">
            Critical: <span className="font-bold">{assets.filter((a) => a.status === 'critical').length}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0F1A2E] border border-white/10 rounded-lg p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by QR ID, Name, Operator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B1220] border border-white/15 rounded pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#2E9CCA]"
            />
          </div>

          {/* Zone Filter */}
          <select
            value={selectedZoneFilter}
            onChange={(e) => setSelectedZoneFilter(e.target.value)}
            className="bg-[#0B1220] border border-white/15 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#2E9CCA]"
          >
            <option value="all">All Zones (10 Zones)</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                Zone {z.number} - {z.name.split('-')[1]?.trim()}
              </option>
            ))}
          </select>

          {/* Asset Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-[#0B1220] border border-white/15 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#2E9CCA]"
          >
            <option value="all">All Asset Types</option>
            <option value="de-watering-pump">De-Watering Pumps</option>
            <option value="generator">Generators</option>
            <option value="rescue-boat">Rescue Boats</option>
            <option value="jcb">JCB Excavators</option>
            <option value="ambulance">Ambulances</option>
            <option value="chainsaw">Chainsaws</option>
            <option value="satellite-phone">Satellite Phones</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-[#0B1220] border border-white/15 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#2E9CCA]"
          >
            <option value="all">All Statuses</option>
            <option value="ready">Ready / Operational</option>
            <option value="maintenance">In Maintenance</option>
            <option value="critical">Critical / Failed</option>
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-[#0F1A2E] border border-white/10 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#0B1220] text-slate-400 font-mono uppercase">
                <th className="p-3.5">QR ID</th>
                <th className="p-3.5">Asset Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Zone</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Last Inspection</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center font-mono text-slate-400">
                    No matching assets found for selected filters.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((ast) => (
                  <tr
                    key={ast.id}
                    onClick={() => handleOpenDetail(ast)}
                    className="hover:bg-[#152238] transition-colors cursor-pointer group"
                  >
                    <td className="p-3.5 font-mono font-bold text-[#2E9CCA] flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-[#2E9CCA]" />
                      <span>{ast.qrId}</span>
                    </td>
                    <td className="p-3.5 font-medium text-white group-hover:text-[#2E9CCA] transition-colors">
                      {ast.name}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300 uppercase">{ast.type}</td>
                    <td className="p-3.5 text-slate-300">{ast.zoneName}</td>
                    <td className="p-3.5">
                      <StatusBadge status={ast.status} size="sm" />
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{ast.lastInspectionDate}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(ast);
                        }}
                        className="px-2.5 py-1 rounded bg-[#152238] hover:bg-[#1f3152] border border-white/10 text-xs font-mono text-[#2E9CCA] font-bold flex items-center gap-1.5 ml-auto transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified Asset Inspect Detail Modal */}
      <InspectDetailModal
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        type="asset"
        data={selectedAsset}
      />
    </div>
  );
};
