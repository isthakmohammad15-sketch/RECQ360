import React, { useState } from 'react';
import {
  X,
  Building,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Phone,
  MapPin,
  Truck,
  Home,
  Wrench,
  History,
  Droplets,
  Zap,
  BatteryCharging,
  Utensils,
  Stethoscope,
  Bath,
  Package,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { Zone, Shelter, Asset, HospitalInfo, ReliefCampInfo } from '../../types';
import { StatusBadge } from './StatusBadge';
import { useApp } from '../../context/AppContext';

export interface InspectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'zone' | 'shelter' | 'asset' | 'hospital' | 'relief_camp' | null;
  data: Zone | Shelter | Asset | HospitalInfo | ReliefCampInfo | null;
  zoneContextName?: string;
}

export const InspectDetailModal: React.FC<InspectDetailModalProps> = ({
  isOpen,
  onClose,
  type,
  data,
  zoneContextName,
}) => {
  const { alerts, updateAssetStatus, navigateTo, perms } = useApp();

  const [assetNewStatus, setAssetNewStatus] = useState<'ready' | 'maintenance' | 'critical'>('ready');
  const [assetNotes, setAssetNotes] = useState('');

  if (!isOpen || !data || !type) return null;

  // Render for ZONE
  if (type === 'zone') {
    const zone = data as Zone;
    const zoneAlerts = alerts.filter((a) => a.zoneId === zone.id && !a.resolved);

    // Collect problems or issues
    const issues: string[] = [];
    if (zone.pumpsCount && zone.pumpsCount.working < zone.pumpsCount.total) {
      issues.push(`De-watering Pumps: ${zone.pumpsCount.working} of ${zone.pumpsCount.total} working`);
    }
    if (zone.generatorsCount && zone.generatorsCount.working < zone.generatorsCount.total) {
      issues.push(`Generators: ${zone.generatorsCount.working} of ${zone.generatorsCount.total} working`);
    }
    if (zone.foodStockStatus && zone.foodStockStatus !== 'Sufficient') {
      issues.push(`Food Ration Stock: ${zone.foodStockStatus}`);
    }
    if (zone.waterAvailabilityStatus && zone.waterAvailabilityStatus !== 'Sufficient') {
      issues.push(`Drinking Water Tankers: ${zone.waterAvailabilityStatus}`);
    }
    zoneAlerts.forEach((a) => issues.push(`Alert: ${a.title}`));

    return (
      <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-[#0F1A2E] border border-white/20 rounded-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-6 shadow-2xl relative my-auto text-slate-100">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#152238] hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="border-b border-white/10 pb-4 pr-10">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded bg-[#2E9CCA]/20 text-[#2E9CCA] font-mono text-xs font-bold border border-[#2E9CCA]/30">
                ZONE {zone.number}
              </span>
              <StatusBadge status={zone.status} size="sm" />
              <span className="px-2.5 py-0.5 rounded bg-[#7C5CFC]/20 text-[#7C5CFC] font-mono text-xs font-bold border border-[#7C5CFC]/30">
                Readiness: {zone.readinessScore}%
              </span>
            </div>
            <h2 className="font-display font-bold text-2xl text-white tracking-tight">
              {zone.name}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
              <span>Authority: Greater Visakhapatnam Municipal Corporation Zonal Office</span>
            </p>
          </div>

          {/* Officer & Command Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0B1220] p-4 rounded-lg border border-white/10 font-mono text-xs">
            <div>
              <span className="text-slate-400 uppercase text-[10px]">Assigned Zonal Officer:</span>
              <div className="text-white font-bold text-sm mt-0.5">{zone.officerName}</div>
              <div className="text-[#2E9CCA] text-[11px] mt-0.5">{zone.officerRole}</div>
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-slate-400 uppercase text-[10px]">Emergency Hotline:</span>
                <a
                  href={`tel:${zone.officerContact.replace(/\s+/g, '')}`}
                  className="text-[#2FBF71] font-bold text-sm mt-0.5 flex items-center gap-1.5 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{zone.officerContact}</span>
                </a>
              </div>
              <div className="text-slate-400 text-[10px] mt-1">
                Coordinates: {zone.coordinates[0].toFixed(4)}° N, {zone.coordinates[1].toFixed(4)}° E
              </div>
            </div>
          </div>

          {/* Active Problems / Issues Box */}
          {issues.length > 0 ? (
            <div className="p-4 rounded-lg bg-[#E4572E]/10 border border-[#E4572E]/40 space-y-2">
              <div className="flex items-center gap-2 text-[#E4572E] font-mono text-xs font-bold uppercase">
                <AlertTriangle className="w-4 h-4" />
                <span>Active Vulnerabilities & Equipment Issues ({issues.length})</span>
              </div>
              <ul className="space-y-1 font-mono text-xs text-slate-200 list-disc list-inside pl-1">
                {issues.map((issue, idx) => (
                  <li key={idx} className="text-slate-200">{issue}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[#2FBF71]/10 border border-[#2FBF71]/30 flex items-center gap-2 text-[#2FBF71] font-mono text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>All zone equipment, supplies & communications are fully operational with zero active alerts.</span>
            </div>
          )}

          {/* SECTION 1: Population & Essential Supplies */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-base text-white border-b border-white/10 pb-1.5 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2E9CCA]" />
              <span>1. Population & Essential Supplies</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded bg-[#0B1220] border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Zone Population</span>
                <div className="text-white font-bold text-base">
                  {(zone.population || zone.populationAtRisk).toLocaleString()}
                </div>
                <div className="text-slate-500 text-[10px]">At-risk residents</div>
              </div>

              <div className="p-3 rounded bg-[#0B1220] border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Food Stock Quantity</span>
                <div className="text-white font-bold text-sm truncate">
                  {zone.foodStockQuantity || '15,000 Kits'}
                </div>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      zone.foodStockStatus === 'Critical'
                        ? 'bg-[#E4572E]/20 text-[#E4572E] border border-[#E4572E]/30'
                        : zone.foodStockStatus === 'Low'
                        ? 'bg-[#F2B138]/20 text-[#F2B138] border border-[#F2B138]/30'
                        : 'bg-[#2FBF71]/20 text-[#2FBF71] border border-[#2FBF71]/30'
                    }`}
                  >
                    {zone.foodStockStatus || 'Sufficient'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#0B1220] border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Water Availability</span>
                <div className="text-white font-bold text-sm truncate">
                  {zone.waterAvailability || '60,000 Litres'}
                </div>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      zone.waterAvailabilityStatus === 'Critical'
                        ? 'bg-[#E4572E]/20 text-[#E4572E] border border-[#E4572E]/30'
                        : zone.waterAvailabilityStatus === 'Low'
                        ? 'bg-[#F2B138]/20 text-[#F2B138] border border-[#F2B138]/30'
                        : 'bg-[#2FBF71]/20 text-[#2FBF71] border border-[#2FBF71]/30'
                    }`}
                  >
                    {zone.waterAvailabilityStatus || 'Sufficient'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#0B1220] border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Shelter Supplies</span>
                <div className="text-white font-bold text-sm">
                  {zone.shelterSuppliesStatus || 'Available'}
                </div>
                <div className="text-slate-500 text-[10px]">Bedding & Hygiene</div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Heavy Equipment & Emergency Vehicles */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-base text-white border-b border-white/10 pb-1.5 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#F2B138]" />
              <span>2. Machinery & Emergency Equipment</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#0B1220] border border-white/5 text-center">
                <div className="text-slate-400 text-[10px] uppercase">Pumps</div>
                <div className="text-white font-bold text-sm my-0.5">
                  {zone.pumpsCount?.working ?? 0} / {zone.pumpsCount?.total ?? 0}
                </div>
                <div className="text-[10px] text-slate-500">De-watering</div>
              </div>

              <div className="p-2.5 rounded bg-[#0B1220] border border-white/5 text-center">
                <div className="text-slate-400 text-[10px] uppercase">Generators</div>
                <div className="text-white font-bold text-sm my-0.5">
                  {zone.generatorsCount?.working ?? 0} / {zone.generatorsCount?.total ?? 0}
                </div>
                <div className="text-[10px] text-slate-500">Diesel Gensets</div>
              </div>

              <div className="p-2.5 rounded bg-[#0B1220] border border-white/5 text-center">
                <div className="text-slate-400 text-[10px] uppercase">Rescue Boats</div>
                <div className="text-white font-bold text-sm my-0.5">
                  {zone.boatsCount?.working ?? 0} / {zone.boatsCount?.total ?? 0}
                </div>
                <div className="text-[10px] text-slate-500">Motor/Inflatable</div>
              </div>

              <div className="p-2.5 rounded bg-[#0B1220] border border-white/5 text-center">
                <div className="text-slate-400 text-[10px] uppercase">JCBs</div>
                <div className="text-white font-bold text-sm my-0.5">
                  {zone.jcbsCount?.working ?? 0} / {zone.jcbsCount?.total ?? 0}
                </div>
                <div className="text-[10px] text-slate-500">Excavators</div>
              </div>

              <div className="p-2.5 rounded bg-[#0B1220] border border-white/5 text-center">
                <div className="text-slate-400 text-[10px] uppercase">Ambulances</div>
                <div className="text-white font-bold text-sm my-0.5">
                  {zone.ambulancesCount?.working ?? 0} / {zone.ambulancesCount?.total ?? 0}
                </div>
                <div className="text-[10px] text-slate-500">108 ALS/BLS</div>
              </div>

              <div className="p-2.5 rounded bg-[#0B1220] border border-white/5 text-center">
                <div className="text-slate-400 text-[10px] uppercase">Vehicles</div>
                <div className="text-white font-bold text-sm my-0.5">
                  {zone.emergencyVehiclesCount ?? 12}
                </div>
                <div className="text-[10px] text-slate-500">Fleet Response</div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Emergency Healthcare & Relief Infrastructure */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-base text-white border-b border-white/10 pb-1.5 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#7C5CFC]" />
              <span>3. Hospitals & Relief Camps</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hospitals List */}
              <div className="bg-[#0B1220] p-3.5 rounded-lg border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono border-b border-white/5 pb-1.5">
                  <span className="text-[#7C5CFC] font-bold uppercase flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5" />
                    Hospitals in Zone ({zone.hospitals?.length || 0})
                  </span>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {zone.hospitals && zone.hospitals.length > 0 ? (
                    zone.hospitals.map((h) => (
                      <div key={h.id} className="p-2 rounded bg-[#152238] font-mono text-xs space-y-1">
                        <div className="text-white font-bold">{h.name}</div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Beds Available: <strong className="text-[#2FBF71]">{h.bedsAvailable}</strong></span>
                          <span>{h.emergencyContact}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 font-mono">No hospitals mapped in this zone.</div>
                  )}
                </div>
              </div>

              {/* Relief Camps List */}
              <div className="bg-[#0B1220] p-3.5 rounded-lg border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono border-b border-white/5 pb-1.5">
                  <span className="text-[#2E9CCA] font-bold uppercase flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5" />
                    Relief Camps ({zone.reliefCamps?.length || 0})
                  </span>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {zone.reliefCamps && zone.reliefCamps.length > 0 ? (
                    zone.reliefCamps.map((rc) => {
                      const occPct = Math.round((rc.occupancy / rc.capacity) * 100);
                      return (
                        <div key={rc.id} className="p-2 rounded bg-[#152238] font-mono text-xs space-y-1">
                          <div className="text-white font-bold">{rc.name}</div>
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Occupancy: {rc.occupancy} / {rc.capacity}</span>
                            <span className={occPct > 80 ? 'text-[#E4572E] font-bold' : 'text-[#2FBF71]'}>{occPct}%</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-500 font-mono">No relief camps active.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <button
              onClick={() => {
                onClose();
                navigateTo('zone-detail', { zoneId: zone.id });
              }}
              className="px-4 py-2 rounded bg-[#152238] hover:bg-[#1f3152] border border-white/10 text-xs font-mono text-[#2E9CCA] font-bold flex items-center gap-1.5"
            >
              Go to Dedicated Zone Page →
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded bg-[#2E9CCA] hover:bg-[#2587af] text-white font-mono text-xs font-bold shadow-lg"
            >
              Close Inspection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render for SHELTER
  if (type === 'shelter') {
    const shelter = data as Shelter;
    if (!shelter) return null;

    const capacity = shelter.capacity || 1;
    const currentOccupancy = shelter.currentOccupancy || 0;
    const occupancyPct = Math.min(100, Math.round((currentOccupancy / capacity) * 100));

    const amenities = shelter.amenities || {
      water: false,
      electricity: false,
      backupPower: false,
      foodSupplies: false,
      medicalKit: false,
      toilets: false,
    };

    const issues: string[] = [];
    if (!amenities.water) issues.push('Drinking Water Deficit');
    if (!amenities.electricity) issues.push('Main Power Line Tripped');
    if (!amenities.backupPower) issues.push('Generator Backup Down');
    if (!amenities.foodSupplies) issues.push('Rations Low');
    if (!amenities.medicalKit) issues.push('Medical First Aid Kit Incomplete');
    if (!amenities.toilets) issues.push('Sanitation Toilets Maintenance Required');
    if (occupancyPct >= 85) issues.push(`Near Capacity Limit (${occupancyPct}%)`);

    return (
      <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-[#0F1A2E] border border-white/20 rounded-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-6 shadow-2xl relative my-auto text-slate-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#152238] hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="border-b border-white/10 pb-4 pr-10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded bg-[#2E9CCA]/20 text-[#2E9CCA] font-mono text-xs font-bold border border-[#2E9CCA]/30">
                {shelter.zoneName || 'Relief Zone'}
              </span>
              <StatusBadge status={shelter.status} size="sm" />
            </div>
            <h2 className="font-display font-bold text-2xl text-white tracking-tight">
              {shelter.name}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2E9CCA]" />
              <span>{shelter.address || 'Address not registered'}</span>
            </p>
          </div>

          {/* Contact & Authority */}
          <div className="bg-[#0B1220] p-4 rounded-lg border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase">Shelter Incharge Officer:</span>
              <div className="text-white font-bold text-sm mt-0.5">{shelter.contactPerson || 'Assigned Officer'}</div>
              <div className="text-slate-400 text-[11px]">Relief Command Authority</div>
            </div>
            {shelter.contactPhone ? (
              <a
                href={`tel:${shelter.contactPhone.replace(/\s+/g, '')}`}
                className="px-3.5 py-2 rounded bg-[#2FBF71]/20 text-[#2FBF71] border border-[#2FBF71]/40 flex items-center gap-2 hover:bg-[#2FBF71]/30 font-bold self-start sm:self-auto"
              >
                <Phone className="w-4 h-4" />
                <span>{shelter.contactPhone}</span>
              </a>
            ) : (
              <div className="px-3.5 py-2 rounded bg-white/5 text-slate-400 border border-white/10 flex items-center gap-2 font-bold self-start sm:self-auto">
                <Phone className="w-4 h-4" />
                <span>No phone listed</span>
              </div>
            )}
          </div>

          {/* Issues Notice */}
          {issues.length > 0 ? (
            <div className="p-3.5 rounded-lg bg-[#E4572E]/10 border border-[#E4572E]/40 space-y-1 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#E4572E] font-bold uppercase">
                <AlertTriangle className="w-4 h-4" />
                <span>Identified Issues ({issues.length})</span>
              </div>
              <ul className="list-disc list-inside text-slate-200">
                {issues.map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[#2FBF71]/10 border border-[#2FBF71]/30 flex items-center gap-2 text-[#2FBF71] font-mono text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>All essential amenities & utility connections verified operational.</span>
            </div>
          )}

          {/* Occupancy bar */}
          <div className="bg-[#0B1220] p-4 rounded-lg border border-white/10 space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 uppercase text-[10px]">Shelter Occupancy Rate</span>
              <span className={`font-bold text-sm ${occupancyPct >= 80 ? 'text-[#E4572E]' : 'text-[#2FBF71]'}`}>
                {currentOccupancy} / {shelter.capacity || 0} evacuees ({occupancyPct}%)
              </span>
            </div>
            <div className="w-full bg-[#152238] h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  occupancyPct >= 80 ? 'bg-[#E4572E]' : 'bg-[#2FBF71]'
                }`}
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
          </div>

          {/* Amenity Readiness Grid */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-sm text-white">Amenity & Essential Utility Status</h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded bg-[#0B1220] border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2"><Droplets className="w-4 h-4 text-[#2E9CCA]" /> Drinking Water</span>
                {amenities.water ? <span className="text-[#2FBF71] font-bold">READY</span> : <span className="text-[#E4572E] font-bold">DEFICIT</span>}
              </div>
              <div className="p-3 rounded bg-[#0B1220] border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2"><Zap className="w-4 h-4 text-[#F2B138]" /> Mains Power</span>
                {amenities.electricity ? <span className="text-[#2FBF71] font-bold">ONLINE</span> : <span className="text-[#E4572E] font-bold">TRIPPED</span>}
              </div>
              <div className="p-3 rounded bg-[#0B1220] border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2"><BatteryCharging className="w-4 h-4 text-[#7C5CFC]" /> Genset Backup</span>
                {amenities.backupPower ? <span className="text-[#2FBF71] font-bold">READY</span> : <span className="text-[#E4572E] font-bold">FAILED</span>}
              </div>
              <div className="p-3 rounded bg-[#0B1220] border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2"><Utensils className="w-4 h-4 text-[#2FBF71]" /> Dry Rations</span>
                {amenities.foodSupplies ? <span className="text-[#2FBF71] font-bold">STOCKED</span> : <span className="text-[#E4572E] font-bold">LOW</span>}
              </div>
              <div className="p-3 rounded bg-[#0B1220] border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2"><Stethoscope className="w-4 h-4 text-[#E4572E]" /> Medical Kit</span>
                {amenities.medicalKit ? <span className="text-[#2FBF71] font-bold">STOCKED</span> : <span className="text-[#E4572E] font-bold">MISSING</span>}
              </div>
              <div className="p-3 rounded bg-[#0B1220] border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2"><Bath className="w-4 h-4 text-[#2E9CCA]" /> Sanitation Toilets</span>
                {amenities.toilets ? <span className="text-[#2FBF71] font-bold">VERIFIED</span> : <span className="text-[#E4572E] font-bold">BLOCKED</span>}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded bg-[#2E9CCA] hover:bg-[#2587af] text-white font-mono text-xs font-bold"
            >
              Done Inspection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render for ASSET
  if (type === 'asset') {
    const asset = data as Asset;

    const handleSaveAssetStatus = (e: React.FormEvent) => {
      e.preventDefault();
      updateAssetStatus(asset.id, assetNewStatus, assetNotes);
      setAssetNotes('');
      onClose();
    };

    return (
      <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-[#0F1A2E] border border-white/20 rounded-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-6 shadow-2xl relative my-auto text-slate-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#152238] hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="border-b border-white/10 pb-4 pr-10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded bg-[#2E9CCA]/20 text-[#2E9CCA] font-mono text-xs font-bold border border-[#2E9CCA]/30">
                {asset.qrId}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#F2B138]/20 text-[#F2B138] font-mono text-xs uppercase font-bold border border-[#F2B138]/30">
                {asset.type}
              </span>
              <StatusBadge status={asset.status} size="sm" />
            </div>
            <h2 className="font-display font-bold text-2xl text-white tracking-tight">
              {asset.name}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Assigned Zone: <span className="text-white font-bold">{asset.zoneName}</span> • Authority: City Machinery Fleet
            </p>
          </div>

          {/* Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0B1220] p-4 rounded-lg border border-white/10 font-mono text-xs">
            <div>
              <span className="text-slate-400 uppercase text-[10px]">Operator Name:</span>
              <div className="text-white font-bold mt-0.5">{asset.operator}</div>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px]">Current Location:</span>
              <div className="text-slate-200 mt-0.5">{asset.location}</div>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px]">Last Inspection:</span>
              <div className="text-[#2E9CCA] font-bold mt-0.5">{asset.lastInspectionDate}</div>
            </div>
          </div>

          {/* GPS Coordinates */}
          <div className="p-3 rounded-lg bg-[#0B1220] border border-white/10 flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#2E9CCA]" />
              GPS Coordinates:
            </span>
            <span className="text-[#2E9CCA] font-bold">
              {asset.coordinates[0].toFixed(4)}° N, {asset.coordinates[1].toFixed(4)}° E
            </span>
          </div>

          {/* Maintenance History Timeline */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
              <History className="w-4 h-4 text-[#2E9CCA]" />
              <span>Maintenance & Service Log History</span>
            </h3>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {asset.maintenanceHistory.length === 0 ? (
                <div className="text-xs font-mono text-slate-500">No prior maintenance logs recorded.</div>
              ) : (
                asset.maintenanceHistory.map((m) => (
                  <div key={m.id} className="p-3 rounded bg-[#0B1220] border border-white/5 space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-[#2E9CCA] font-bold">
                      <span>{m.type}</span>
                      <span className="text-slate-400 font-normal">{m.date}</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs">{m.notes}</p>
                    <div className="text-[10px] text-slate-500">Technician: {m.technician}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Log Form */}
          {perms.editAssets && (
          <form onSubmit={handleSaveAssetStatus} className="pt-3 border-t border-white/10 space-y-3">
            <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#F2B138]" />
              <span>Log Technical Status Update</span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAssetNewStatus('ready')}
                className={`py-2 rounded font-mono text-xs font-semibold border ${
                  assetNewStatus === 'ready'
                    ? 'bg-[#2FBF71]/30 border-[#2FBF71] text-[#2FBF71]'
                    : 'bg-[#0B1220] border-white/10 text-slate-400'
                }`}
              >
                READY
              </button>
              <button
                type="button"
                onClick={() => setAssetNewStatus('maintenance')}
                className={`py-2 rounded font-mono text-xs font-semibold border ${
                  assetNewStatus === 'maintenance'
                    ? 'bg-[#F2B138]/30 border-[#F2B138] text-[#F2B138]'
                    : 'bg-[#0B1220] border-white/10 text-slate-400'
                }`}
              >
                MAINTENANCE
              </button>
              <button
                type="button"
                onClick={() => setAssetNewStatus('critical')}
                className={`py-2 rounded font-mono text-xs font-semibold border ${
                  assetNewStatus === 'critical'
                    ? 'bg-[#E4572E]/30 border-[#E4572E] text-[#E4572E]'
                    : 'bg-[#0B1220] border-white/10 text-slate-400'
                }`}
              >
                CRITICAL
              </button>
            </div>

            <input
              type="text"
              placeholder="Inspection / maintenance remarks..."
              value={assetNotes}
              onChange={(e) => setAssetNotes(e.target.value)}
              className="w-full bg-[#0B1220] border border-white/15 rounded p-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#2E9CCA]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-[#152238] text-slate-300 font-mono text-xs"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded bg-[#2E9CCA] hover:bg-[#2587af] text-white font-mono text-xs font-bold shadow-lg"
              >
                Save Log
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    );
  }

  // Render for HOSPITAL
  if (type === 'hospital') {
    const hosp = data as HospitalInfo;
    return (
      <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-[#0F1A2E] border border-white/20 rounded-xl max-w-md w-full p-5 space-y-5 shadow-2xl relative my-auto text-slate-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded bg-[#152238] text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="border-b border-white/10 pb-3">
            <span className="px-2.5 py-0.5 rounded bg-[#7C5CFC]/20 text-[#7C5CFC] font-mono text-xs font-bold border border-[#7C5CFC]/30">
              {zoneContextName || 'Zone Medical Center'}
            </span>
            <h2 className="font-display font-bold text-xl text-white mt-1">{hosp.name}</h2>
            <p className="text-xs text-slate-400 font-mono">Disaster Medical Response Unit</p>
          </div>

          <div className="bg-[#0B1220] p-4 rounded-lg border border-white/10 space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Emergency Beds Available:</span>
              <span className="text-[#2FBF71] font-bold text-base">{hosp.bedsAvailable} Beds</span>
            </div>
            <div className="flex justify-between items-center border-t border-white/5 pt-2">
              <span className="text-slate-400">Emergency Casualty Line:</span>
              <a href={`tel:${hosp.emergencyContact}`} className="text-[#2E9CCA] font-bold hover:underline">
                {hosp.emergencyContact}
              </a>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded bg-[#2E9CCA] text-white font-mono text-xs font-bold">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render for RELIEF CAMP
  if (type === 'relief_camp') {
    const camp = data as ReliefCampInfo;
    const occPct = Math.round((camp.occupancy / camp.capacity) * 100);

    return (
      <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-[#0F1A2E] border border-white/20 rounded-xl max-w-md w-full p-5 space-y-5 shadow-2xl relative my-auto text-slate-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded bg-[#152238] text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="border-b border-white/10 pb-3">
            <span className="px-2.5 py-0.5 rounded bg-[#2E9CCA]/20 text-[#2E9CCA] font-mono text-xs font-bold border border-[#2E9CCA]/30">
              {zoneContextName || 'Relief Camp'}
            </span>
            <h2 className="font-display font-bold text-xl text-white mt-1">{camp.name}</h2>
            <p className="text-xs text-slate-400 font-mono">Evacuation &amp; Shelter Center</p>
          </div>

          <div className="bg-[#0B1220] p-4 rounded-lg border border-white/10 space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current Occupancy Rate:</span>
              <span className={occPct >= 80 ? 'text-[#E4572E] font-bold' : 'text-[#2FBF71] font-bold'}>
                {camp.occupancy} / {camp.capacity} ({occPct}%)
              </span>
            </div>
            <div className="w-full bg-[#152238] h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${occPct >= 80 ? 'bg-[#E4572E]' : 'bg-[#2FBF71]'}`}
                style={{ width: `${occPct}%` }}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded bg-[#2E9CCA] text-white font-mono text-xs font-bold">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
