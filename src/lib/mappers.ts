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

const IST = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST" : "";

export const mapZone = (r: any): Zone => ({
  id: r.id,
  number: r.number,
  name: r.name,
  readinessScore: r.readiness_score,
  status: r.status,
  pendingTaskCount: r.pending_task_count,
  officerName: r.officer_name ?? "",
  officerContact: r.officer_contact ?? "",
  officerRole: r.officer_role ?? "",
  coordinates: [r.lat ?? 0, r.lng ?? 0],
  populationAtRisk: r.population_at_risk ?? 0,
  shelterCount: r.shelter_count ?? 0,
  assetCount: r.asset_count ?? 0,
  deptBreakdown: r.dept_breakdown ?? {},
  ...(r.extra ?? {}),
});

export const mapAsset = (r: any): Asset => ({
  id: r.id,
  qrId: r.qr_id ?? "",
  name: r.name,
  type: r.type,
  zoneId: r.zone_id ?? "",
  zoneName: r.zone_name ?? "",
  status: r.status,
  lastInspectionDate: r.last_inspection_date ?? "",
  operator: r.operator ?? "",
  location: r.location ?? "",
  coordinates: [r.lat ?? 0, r.lng ?? 0],
  maintenanceHistory: r.maintenance_history ?? [],
});

export const mapShelter = (r: any): Shelter => ({
  id: r.id,
  name: r.name,
  zoneId: r.zone_id ?? "",
  zoneName: r.zone_name ?? "",
  capacity: r.capacity ?? 0,
  currentOccupancy: r.current_occupancy ?? 0,
  address: r.address ?? "",
  coordinates: [r.lat ?? 0, r.lng ?? 0],
  contactPerson: r.contact_person ?? "",
  contactPhone: r.contact_phone ?? "",
  status: r.status,
  amenities: r.amenities ?? {},
});

export const mapInspection = (r: any): InspectionRecord => ({
  id: r.id,
  zoneId: r.zone_id ?? "",
  zoneName: r.zone_name ?? "",
  officerName: r.officer_name ?? "",
  department: r.department ?? "",
  timestamp: IST(r.created_at),
  gpsCoordinates: r.gps_coordinates ?? "",
  photoUrl: r.photo_url ?? "",
  remarks: r.remarks ?? "",
  status: r.status,
  itemChecked: r.item_checked ?? "",
});

export const mapAlert = (r: any): AlertItem => ({
  id: r.id,
  title: r.title,
  description: r.description ?? "",
  zoneId: r.zone_id ?? "",
  zoneName: r.zone_name ?? "",
  severity: r.severity,
  timestamp: IST(r.created_at),
  resolved: r.resolved,
  department: r.department ?? "",
  actionTaken: r.action_taken ?? undefined,
  resolvedAt: r.resolved_at ?? undefined,
});

export const mapAuditLog = (r: any): AuditLog => ({
  id: r.id,
  timestamp: IST(r.created_at),
  user: r.user_name ?? "SYSTEM",
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
  mandatoryPhoto: r.mandatory_photo,
  active: r.active,
});

export const mapContact = (r: any): EmergencyContact => ({
  id: r.id,
  name: r.name,
  designation: r.designation ?? "",
  department: r.department ?? "",
  zoneId: r.zone_id ?? "",
  zoneName: r.zone_name ?? "",
  phone: r.phone ?? "",
  altPhone: r.alt_phone ?? "",
  email: r.email ?? "",
  availability: r.availability ?? "24x7",
});

export const mapDeptStat = (r: any): DepartmentProgress => ({
  department: r.department,
  completionRate: r.completion_rate,
  readyItems: r.ready_items,
  totalItems: r.total_items,
});
