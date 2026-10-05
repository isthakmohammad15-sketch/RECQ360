export type UserRole = 'commissioner' | 'zone_officer' | 'dept_officer' | 'admin';

export type StatusLevel = 'ready' | 'pending' | 'critical';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  zoneId?: string;
  department?: string;
  email: string;
  title: string;
  avatar: string;
}

export interface ZoneDeptBreakdown {
  readiness: number;
  totalTasks: number;
  completedTasks: number;
  status: StatusLevel;
}

export interface CountBreakdown {
  working: number;
  total: number;
}

export interface HospitalInfo {
  id: string;
  name: string;
  bedsAvailable: number;
  emergencyContact: string;
}

export interface ReliefCampInfo {
  id: string;
  name: string;
  capacity: number;
  occupancy: number;
}

export interface Zone {
  id: string;
  number: number;
  name: string;
  readinessScore: number;
  status: StatusLevel;
  pendingTaskCount: number;
  officerName: string;
  officerContact: string;
  officerRole: string;
  coordinates: [number, number];
  populationAtRisk: number;
  shelterCount: number;
  assetCount: number;
  deptBreakdown: Record<string, ZoneDeptBreakdown>;

  // Extended Data Fields per zone
  population?: number;
  foodStockQuantity?: string;
  foodStockStatus?: 'Sufficient' | 'Low' | 'Critical';
  waterAvailability?: string;
  waterAvailabilityStatus?: 'Sufficient' | 'Low' | 'Critical';
  generatorsCount?: CountBreakdown;
  pumpsCount?: CountBreakdown;
  boatsCount?: CountBreakdown;
  jcbsCount?: CountBreakdown;
  ambulancesCount?: CountBreakdown;
  shelterSuppliesStatus?: 'Available' | 'Partial' | 'Unavailable';
  emergencyVehiclesCount?: number;
  hospitals?: HospitalInfo[];
  reliefCamps?: ReliefCampInfo[];
}

export type AssetType =
  | 'de-watering-pump'
  | 'generator'
  | 'rescue-boat'
  | 'jcb'
  | 'ambulance'
  | 'chainsaw'
  | 'satellite-phone'
  | 'vehicle'
  | 'equipment'
  | 'hospital'
  | 'control-room';

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: string;
  notes: string;
  technician: string;
}

export interface Asset {
  id: string;
  qrId: string;
  name: string;
  type: AssetType;
  zoneId: string;
  zoneName: string;
  status: 'ready' | 'maintenance' | 'critical' | 'pending-check';
  lastInspectionDate: string;
  operator: string;
  location: string;
  coordinates: [number, number];
  maintenanceHistory: MaintenanceRecord[];
  department?: string;
  fuelLevel?: number;
  operatorName?: string;
  operatorContact?: string;
  lastMaintenance?: string;
}

export interface ShelterAmenities {
  water: boolean;
  electricity: boolean;
  backupPower: boolean;
  foodSupplies: boolean;
  medicalKit: boolean;
  toilets: boolean;
}

export interface Shelter {
  id: string;
  name: string;
  zoneId: string;
  zoneName: string;
  capacity: number;
  currentOccupancy: number;
  address: string;
  coordinates: [number, number];
  contactPerson: string;
  contactPhone: string;
  status: 'operational' | 'near-capacity' | 'preparing';
  amenities: ShelterAmenities;
  foodWaterStatus?: string;
  medicalSupport?: boolean | string;
  generatorBackup?: boolean;
}

export interface InspectionRecord {
  id: string;
  zoneId: string;
  zoneName: string;
  officerName: string;
  department: string;
  timestamp: string;
  gpsCoordinates: string;
  photoUrl: string;
  remarks: string;
  status: 'verified' | 'flagged' | 'pending';
  itemChecked: string;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  zoneId: string;
  zoneName: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp?: string;
  resolved: boolean;
  department: string;
  actionTaken?: string;
  resolvedAt?: string;
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  type: 'auth' | 'status_override' | 'alert_action' | 'template_update' | 'asset_update';
  actor?: string;
  target?: string;
  ipAddress?: string;
}

export interface ChecklistItem {
  id: string;
  department: string;
  title: string;
  frequency: string;
  mandatoryPhoto: boolean;
  active: boolean;
}

export interface DepartmentProgress {
  department: string;
  completionRate: number;
  readyItems: number;
  totalItems: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  structuredData?: any;
}

export interface EmergencyContact {
  id: string;
  name: string;
  designation: string;
  department: string;
  zoneId: string;
  zoneName: string;
  phone: string;
  altPhone: string;
  email: string;
  availability: string;
}

export interface DisasterCity {
  id: string;
  name: string;
  state: string;
  country: string;
  center: { lat: number; lng: number };
  zoom: number;
  primaryHazard: string;
  currentAdvisory: string;
  advisorySeverity: 'critical' | 'warning' | 'info';
  readinessScore: number;
  zones: Zone[];
  shelters: any[];
  assets: any[];
  hotspots: Array<{ id: string; name: string; lat: number; lng: number; radius: number; severity: string }>;
  alerts: any[];
}

export interface DisasterState {
  id: string;
  name: string;
  country: string;
  cities: DisasterCity[];
}

