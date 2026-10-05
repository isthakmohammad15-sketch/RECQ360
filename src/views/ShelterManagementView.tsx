import React, { useState } from 'react';
import { AddEntityButton } from '../components/common/AddEntityButton';
import { useApp } from '../context/AppContext';
import { Shelter } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { InspectDetailModal } from '../components/common/InspectDetailModal';
import {
  Home,
  Users,
  Droplets,
  Zap,
  BatteryCharging,
  Utensils,
  Stethoscope,
  Bath,
  Phone,
  Search,
  CheckCircle,
  XCircle,
  X,
  MapPin,
  Building,
  Eye,
} from 'lucide-react';

export const ShelterManagementView: React.FC = () => {
  const { shelters, zones } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

  const filteredShelters = shelters.filter((shl) => {
    const matchesSearch =
      shl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shl.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shl.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesZone = selectedZone === 'all' || shl.zoneId === selectedZone;
    return matchesSearch && matchesZone;
  });

  const totalCapacity = shelters.reduce((sum, s) => sum + s.capacity, 0);
  const totalOccupancy = shelters.reduce((sum, s) => sum + s.currentOccupancy, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Home className="w-4 h-4 text-[#2E9CCA]" />
            <span className="text-xs font-mono text-[#2E9CCA] uppercase">
              CYCLONE SHELTER MONITORING
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">
            Cyclone Relief Shelter Management
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Capacity tracking, occupancy rates & amenity availability audits across city shelters
          </p>
        </div>

        {/* Global Occupancy Counter */}
        <div className="flex items-center gap-3">
        <AddEntityButton kind="shelter" />
        </div>
        <div className="flex items-center gap-4 bg-[#0B1220] border border-white/10 px-4 py-2.5 rounded font-mono text-xs">
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Shelter Occupancy</div>
            <div className="text-white font-bold text-sm">
              {totalOccupancy.toLocaleString()} <span className="text-slate-500 font-normal">/ {totalCapacity.toLocaleString()}</span>
            </div>
          </div>
          <div className="w-20 bg-[#152238] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#2E9CCA] h-full rounded-full"
              style={{ width: `${Math.round((totalOccupancy / totalCapacity) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0F1A2E] border border-white/10 rounded-lg p-4 shadow-xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shelters by name, location, contact..."
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
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShelters.map((s) => {
          const occupancyPct = Math.round((s.currentOccupancy / s.capacity) * 100);

          return (
            <div
              key={s.id}
              onClick={() => setSelectedShelter(s)}
              className="bg-[#0F1A2E] hover:bg-[#152238] border border-white/10 hover:border-[#2E9CCA] rounded-lg p-4 cursor-pointer transition-all space-y-3.5 shadow-xl group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#2E9CCA] font-semibold">{s.zoneName}</span>
                <StatusBadge status={s.status} size="sm" />
              </div>

              <div>
                <h3 className="font-display font-bold text-white text-base group-hover:text-[#2E9CCA] transition-colors leading-snug">
                  {s.name}
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{s.address}</span>
                </p>
              </div>

              {/* Occupancy bar */}
              <div className="space-y-1 bg-[#0B1220] p-3 rounded border border-white/5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Capacity Rate</span>
                  <span
                    className={`font-bold ${
                      occupancyPct >= 80 ? 'text-[#E4572E]' : 'text-[#2FBF71]'
                    }`}
                  >
                    {s.currentOccupancy} / {s.capacity} ({occupancyPct}%)
                  </span>
                </div>
                <div className="w-full bg-[#152238] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      occupancyPct >= 80 ? 'bg-[#E4572E]' : 'bg-[#2FBF71]'
                    }`}
                    style={{ width: `${occupancyPct}%` }}
                  />
                </div>
              </div>

              {/* Amenity Indicators Grid */}
              <div className="grid grid-cols-6 gap-1 pt-2 border-t border-white/5 text-center">
                <div title={`Drinking Water: ${s.amenities.water ? 'Available' : 'Deficit'}`}>
                  <Droplets className={`w-4 h-4 mx-auto ${s.amenities.water ? 'text-[#2FBF71]' : 'text-[#E4572E]'}`} />
                </div>
                <div title={`Grid Power: ${s.amenities.electricity ? 'Online' : 'Tripped'}`}>
                  <Zap className={`w-4 h-4 mx-auto ${s.amenities.electricity ? 'text-[#2FBF71]' : 'text-[#E4572E]'}`} />
                </div>
                <div title={`Genset Backup: ${s.amenities.backupPower ? 'Ready' : 'Failed'}`}>
                  <BatteryCharging className={`w-4 h-4 mx-auto ${s.amenities.backupPower ? 'text-[#2FBF71]' : 'text-[#E4572E]'}`} />
                </div>
                <div title={`Rations/Food: ${s.amenities.foodSupplies ? 'Stocked' : 'Low'}`}>
                  <Utensils className={`w-4 h-4 mx-auto ${s.amenities.foodSupplies ? 'text-[#2FBF71]' : 'text-[#E4572E]'}`} />
                </div>
                <div title={`Medical Kit: ${s.amenities.medicalKit ? 'Stocked' : 'Missing'}`}>
                  <Stethoscope className={`w-4 h-4 mx-auto ${s.amenities.medicalKit ? 'text-[#2FBF71]' : 'text-[#E4572E]'}`} />
                </div>
                <div title={`Sanitation Toilets: ${s.amenities.toilets ? 'Operational' : 'Blocked'}`}>
                  <Bath className={`w-4 h-4 mx-auto ${s.amenities.toilets ? 'text-[#2FBF71]' : 'text-[#E4572E]'}`} />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-white/5 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedShelter(s);
                  }}
                  className="px-3 py-1.5 rounded bg-[#152238] hover:bg-[#1f3152] border border-white/10 text-xs font-mono text-[#2E9CCA] font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified Shelter Inspect Detail Modal */}
      <InspectDetailModal
        isOpen={!!selectedShelter}
        onClose={() => setSelectedShelter(null)}
        type="shelter"
        data={selectedShelter}
      />
    </div>
  );
};
