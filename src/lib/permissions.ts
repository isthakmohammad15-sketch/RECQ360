/**
 * Role -> capability matrix for RECQ360.
 * Roles are assigned in the database only; the UI never lets a user pick one.
 * These flags mirror the RLS policies so the UI hides what the database rejects.
 */
import type { AppRole } from './roles';

export interface Permissions {
  /** Navigation tabs this role may open. */
  tabs: string[];
  /** Landing tab right after sign-in. */
  defaultTab: string;
  viewAllZones: boolean;
  editZones: boolean;
  /** Permanently remove a zone (mirrors the commissioner-only delete policy). */
  deleteZones: boolean;
  editAssets: boolean;
  editShelters: boolean;
  submitInspections: boolean;
  editInspections: boolean;
  editChecklists: boolean;
  resolveAlerts: boolean;
  raiseAlerts: boolean;
  approveReports: boolean;
  manageUsers: boolean;
  /** Compact, touch-first layout (Field Inspector). */
  mobileFirst: boolean;
  /** Restricted to the officer's own zone. */
  zoneScoped: boolean;
  /** Restricted to the officer's own department. */
  deptScoped: boolean;
}

const ALL_TABS = [
  'dashboard',
  'zone-detail',
  'assets',
  'shelters',
  'map',
  'inspections',
  'alerts',
  'ai',
  'reports',
];

const base: Permissions = {
  tabs: ['dashboard', 'map', 'alerts'],
  defaultTab: 'dashboard',
  viewAllZones: false,
  editZones: false,
  deleteZones: false,
  editAssets: false,
  editShelters: false,
  submitInspections: false,
  editInspections: false,
  editChecklists: false,
  resolveAlerts: false,
  raiseAlerts: false,
  approveReports: false,
  manageUsers: false,
  mobileFirst: false,
  zoneScoped: false,
  deptScoped: false,
};

export const PERMISSIONS: Record<AppRole, Permissions> = {
  commissioner: {
    ...base,
    tabs: [...ALL_TABS, 'admin'],
    viewAllZones: true,
    editZones: true,
    deleteZones: true,
    editAssets: true,
    editShelters: true,
    // Commissioner may never rewrite an inspection submitted by an officer.
    editInspections: false,
    editChecklists: true,
    resolveAlerts: true,
    raiseAlerts: true,
    approveReports: true,
    manageUsers: true,
  },
  deputy_commissioner: {
    ...base,
    tabs: ALL_TABS,
    viewAllZones: true,
    editZones: true,
    editAssets: true,
    editShelters: true,
    editChecklists: true,
    resolveAlerts: true,
    raiseAlerts: true,
    approveReports: true,
  },
  disaster_officer: {
    ...base,
    tabs: ALL_TABS,
    viewAllZones: true,
    editZones: true,
    editAssets: true,
    editShelters: true,
    submitInspections: true,
    editChecklists: true,
    resolveAlerts: true,
    raiseAlerts: true,
  },
  zone_officer: {
    ...base,
    tabs: ['dashboard', 'zone-detail', 'assets', 'shelters', 'map', 'inspections', 'alerts', 'reports'],
    defaultTab: 'zone-detail',
    editZones: true,
    editAssets: true,
    editShelters: true,
    submitInspections: true,
    resolveAlerts: true,
    raiseAlerts: true,
    zoneScoped: true,
  },
  dept_officer: {
    ...base,
    tabs: ['dashboard', 'assets', 'inspections', 'alerts', 'reports', 'map'],
    submitInspections: true,
    editChecklists: true,
    raiseAlerts: true,
    deptScoped: true,
  },
  field_inspector: {
    ...base,
    tabs: ['inspections', 'map', 'alerts'],
    defaultTab: 'inspections',
    submitInspections: true,
    editInspections: true,
    mobileFirst: true,
  },
  shelter_manager: {
    ...base,
    tabs: ['shelters', 'map', 'alerts', 'dashboard'],
    defaultTab: 'shelters',
    editShelters: true,
    submitInspections: true,
  },
  asset_manager: {
    ...base,
    tabs: ['assets', 'map', 'alerts', 'dashboard'],
    defaultTab: 'assets',
    editAssets: true,
    submitInspections: true,
  },
  volunteer: { ...base, tabs: ['dashboard', 'map', 'alerts'] },
  // Read Only: sees every module (including the AI assistant) but may not write.
  viewer: { ...base, tabs: [...ALL_TABS], viewAllZones: true },
};

export const VIEWER_PERMISSIONS = PERMISSIONS.viewer;

export function permissionsFor(role: AppRole | null): Permissions {
  return role ? PERMISSIONS[role] : VIEWER_PERMISSIONS;
}
