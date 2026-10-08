/**
 * Row <-> domain mappers between the Lovable Cloud tables and the app types.
 * Keeping them here means views never touch raw database shapes.
 */
import type {
  Zone,
  Asset,
  Shelter,
  InspectionRecord,
  AlertItem,
  AuditLog,
  ChecklistItem,
  DepartmentProgress,
  EmergencyContact,
} from "../types";

import { getZoneLocationMeta } from "../data/regionsData";

const IST = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST" : "";

export const mapZone = (r: any): Zone => {
  const meta = r.id ? getZoneLocationMeta(r.id) : undefined;
  return {
    id: r.id,
    number: r.number ?? 0,
    name: r.name ?? "",
    readinessScore: r.readiness_score ?? r.readinessScore ?? 0,
    status: r.status ?? "pending",
    pendingTaskCount: r.pending_task_count ?? r.pendingTaskCount ?? 0,
    officerName: r.officer_name ?? r.officerName ?? "",
    officerContact: r.officer_contact ?? r.officerContact ?? "",
    officerRole: r.officer_role ?? r.officerRole ?? "",
    coordinates: r.coordinates ?? [r.lat ?? 0, r.lng ?? 0],
    populationAtRisk: r.population_at_risk ?? r.populationAtRisk ?? 0,
    shelterCount: r.shelter_count ?? r.shelterCount ?? 0,
    assetCount: r.asset_count ?? r.assetCount ?? 0,
    deptBreakdown: r.dept_breakdown ?? r.deptBreakdown ?? {},
    cityId: r.city_id ?? r.cityId ?? r.extra?.cityId ?? meta?.cityId,
    cityName: r.city_name ?? r.cityName ?? r.extra?.cityName ?? meta?.cityName,
    stateId: r.state_id ?? r.stateId ?? r.extra?.stateId ?? meta?.stateId,
    stateName: r.state_name ?? r.stateName ?? r.extra?.stateName ?? meta?.stateName,
    country: r.country ?? r.extra?.country ?? meta?.country,
    ...(r.extra ?? {}),
  };
};

export const mapAsset = (r: any): Asset => {
  const meta = (r.zone_id || r.id) ? getZoneLocationMeta(r.zone_id || r.id) : undefined;
  return {
    id: r.id,
    qrId: r.qr_id ?? r.qrId ?? "",
    name: r.name ?? "",
    type: r.type,
    zoneId: r.zone_id ?? r.zoneId ?? "",
    zoneName: r.zone_name ?? r.zoneName ?? "",
    status: r.status,
    lastInspectionDate: r.last_inspection_date ?? r.lastInspectionDate ?? "",
    operator: r.operator ?? "",
    location: r.location ?? "",
    coordinates: r.coordinates ?? [r.lat ?? 0, r.lng ?? 0],
    maintenanceHistory: r.maintenance_history ?? r.maintenanceHistory ?? [],
    cityId: r.city_id ?? r.cityId ?? r.extra?.cityId ?? meta?.cityId,
    cityName: r.city_name ?? r.cityName ?? r.extra?.cityName ?? meta?.cityName,
    stateId: r.state_id ?? r.stateId ?? r.extra?.stateId ?? meta?.stateId,
    stateName: r.state_name ?? r.stateName ?? r.extra?.stateName ?? meta?.stateName,
    country: r.country ?? r.extra?.country ?? meta?.country,
    ...(r.extra ?? {}),
  };
};

export const mapShelter = (r: any): Shelter => {
  const meta = (r.zone_id || r.id) ? getZoneLocationMeta(r.zone_id || r.id) : undefined;
  return {
    id: r.id,
    name: r.name ?? "",
    zoneId: r.zone_id ?? r.zoneId ?? "",
    zoneName: r.zone_name ?? r.zoneName ?? "",
    capacity: Number(r.capacity) || 0,
    currentOccupancy: Number(r.current_occupancy ?? r.currentOccupancy) || 0,
    address: r.address || (r.name ? `${r.name} Facility` : "Operational Relief Facility"),
    coordinates: r.coordinates ?? [r.lat ?? 0, r.lng ?? 0],
    contactPerson: r.contact_person ?? r.contactPerson ?? "Relief Incharge",
    contactPhone: r.contact_phone ?? r.contactPhone ?? "+91 1070",
    status: r.status ?? "operational",
    amenities: {
      water: r.amenities?.water ?? true,
      electricity: r.amenities?.electricity ?? true,
      backupPower: r.amenities?.backupPower ?? true,
      foodSupplies: r.amenities?.foodSupplies ?? true,
      medicalKit: r.amenities?.medicalKit ?? true,
      toilets: r.amenities?.toilets ?? true,
      ...(r.amenities || {}),
    },
    cityId: r.city_id ?? r.cityId ?? r.extra?.cityId ?? meta?.cityId,
    cityName: r.city_name ?? r.cityName ?? r.extra?.cityName ?? meta?.cityName,
    stateId: r.state_id ?? r.stateId ?? r.extra?.stateId ?? meta?.stateId,
    stateName: r.state_name ?? r.stateName ?? r.extra?.stateName ?? meta?.stateName,
    country: r.country ?? r.extra?.country ?? meta?.country,
    ...(r.extra ?? {}),
  };
};

export const mapInspection = (r: any): InspectionRecord => ({
  id: r.id,
  zoneId: r.zone_id ?? r.zoneId ?? "",
  zoneName: r.zone_name ?? r.zoneName ?? "",
  officerName: r.officer_name ?? r.officerName ?? "",
  department: r.department ?? "",
  timestamp: r.timestamp ?? IST(r.created_at),
  gpsCoordinates: r.gps_coordinates ?? r.gpsCoordinates ?? "",
  photoUrl: r.photo_url ?? r.photoUrl ?? "",
  remarks: r.remarks ?? "",
  status: r.status,
  itemChecked: r.item_checked ?? r.itemChecked ?? "",
});

export const mapAlert = (r: any): AlertItem => {
  const meta = (r.zone_id || r.id) ? getZoneLocationMeta(r.zone_id || r.id) : undefined;
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    zoneId: r.zone_id ?? r.zoneId ?? "",
    zoneName: r.zone_name ?? r.zoneName ?? "",
    severity: r.severity,
    timestamp: r.timestamp ?? IST(r.created_at),
    resolved: !!r.resolved,
    department: r.department ?? "",
    actionTaken: r.action_taken ?? r.actionTaken ?? undefined,
    resolvedAt: r.resolved_at ?? r.resolvedAt ?? undefined,
    cityId: r.city_id ?? r.cityId ?? r.extra?.cityId ?? meta?.cityId,
    cityName: r.city_name ?? r.cityName ?? r.extra?.cityName ?? meta?.cityName,
    stateId: r.state_id ?? r.stateId ?? r.extra?.stateId ?? meta?.stateId,
    stateName: r.state_name ?? r.stateName ?? r.extra?.stateName ?? meta?.stateName,
    country: r.country ?? r.extra?.country ?? meta?.country,
    ...(r.extra ?? {}),
  };
};

export const mapAuditLog = (r: any): AuditLog => ({
  id: r.id,
  timestamp: r.timestamp ?? IST(r.created_at),
  user: r.user_name ?? r.user ?? "SYSTEM",
  role: r.role ?? "",
  action: r.action,
  details: r.details ?? "",
  type: r.type,
});

export const mapChecklist = (r: any): ChecklistItem => ({
  id: r.id,
  department: r.department,
  title: r.title,
  frequency: r.frequency ?? "",
  mandatoryPhoto: r.mandatory_photo ?? r.mandatoryPhoto ?? false,
  active: r.active ?? true,
});

export const mapContact = (r: any): EmergencyContact => ({
  id: r.id,
  name: r.name,
  designation: r.designation ?? "",
  department: r.department ?? "",
  zoneId: r.zone_id ?? r.zoneId ?? "",
  zoneName: r.zone_name ?? r.zoneName ?? "",
  phone: r.phone ?? "",
  altPhone: r.alt_phone ?? r.altPhone ?? "",
  email: r.email ?? "",
  availability: r.availability ?? "24x7",
});

export const mapDeptStat = (r: any): DepartmentProgress => ({
  department: r.department,
  completionRate: r.completion_rate ?? r.completionRate ?? 0,
  readyItems: r.ready_items ?? r.readyItems ?? 0,
  totalItems: r.total_items ?? r.totalItems ?? 0,
});
