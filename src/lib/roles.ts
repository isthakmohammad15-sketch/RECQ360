/**
 * Role model for RECQ360.
 * `AppRole` mirrors the `app_role` enum in the database.
 * `UserRole` is the legacy UI-level grouping used by the existing views.
 */
import type { UserRole } from "../types";

export type AppRole =
  | "commissioner"
  | "deputy_commissioner"
  | "disaster_officer"
  | "zone_officer"
  | "dept_officer"
  | "field_inspector"
  | "shelter_manager"
  | "asset_manager"
  | "volunteer"
  | "viewer";

export const ROLE_OPTIONS: { value: AppRole; label: string; description: string }[] = [
  { value: "commissioner", label: "Commissioner", description: "Full command access" },
  { value: "deputy_commissioner", label: "Deputy Commissioner", description: "All except user management" },
  { value: "disaster_officer", label: "Disaster Management Officer", description: "City-wide operations" },
  { value: "zone_officer", label: "Zone Officer", description: "Assigned zone only" },
  { value: "dept_officer", label: "Department Officer", description: "Department data & verification" },
  { value: "field_inspector", label: "Field Inspector", description: "Submit inspections & photos" },
  { value: "shelter_manager", label: "Shelter Manager", description: "Shelters only" },
  { value: "asset_manager", label: "Asset Manager", description: "Assets only" },
  { value: "volunteer", label: "Volunteer", description: "Read only + task updates" },
  { value: "viewer", label: "Read Only Viewer", description: "Dashboard view only" },
];

/** Roles allowed to write to operational tables (mirrors public.can_edit). */
export const EDITOR_ROLES: AppRole[] = [
  "commissioner",
  "deputy_commissioner",
  "disaster_officer",
  "zone_officer",
  "dept_officer",
  "field_inspector",
  "shelter_manager",
  "asset_manager",
];

/** Maps a database role onto the legacy UI role buckets used by the views. */
export function toUiRole(role: AppRole): UserRole {
  switch (role) {
    case "commissioner":
    case "deputy_commissioner":
      return "commissioner";
    case "disaster_officer":
      return "admin";
    case "zone_officer":
      return "zone_officer";
    default:
      return "dept_officer";
  }
}

export function roleLabel(role: AppRole): string {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;
}

const EMAIL_ROLE_REGISTRY_KEY = 'recq360_bound_email_roles';

export function getBoundRoleForEmail(email: string): AppRole | null {
  if (typeof window === 'undefined' || !email) return null;
  try {
    const raw = localStorage.getItem(EMAIL_ROLE_REGISTRY_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return (map[email.toLowerCase().trim()] as AppRole) || null;
  } catch {
    return null;
  }
}

export function bindRoleToEmail(email: string, role: AppRole): void {
  if (typeof window === 'undefined' || !email) return;
  try {
    const raw = localStorage.getItem(EMAIL_ROLE_REGISTRY_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[email.toLowerCase().trim()] = role;
    localStorage.setItem(EMAIL_ROLE_REGISTRY_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('[Role Lock] Failed to save bound role:', e);
  }
}
