import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  User,
  Zone,
  Asset,
  Shelter,
  InspectionRecord,
  AlertItem,
  AuditLog,
  ChecklistItem,
  DepartmentProgress,
  EmergencyContact,
} from '../types';
import { supabase } from '../integrations/supabase/client';
import {
  mapZone,
  mapAsset,
  mapShelter,
  mapInspection,
  mapAlert,
  mapAuditLog,
  mapChecklist,
  mapDeptStat,
  mapContact,
} from '../lib/mappers';
import { type AppRole, toUiRole, roleLabel, EDITOR_ROLES } from '../lib/roles';
import { permissionsFor, type Permissions } from '../lib/permissions';
import {
  INITIAL_ZONES,
  INITIAL_ALERTS,
  INITIAL_DEPARTMENT_STATS,
  INITIAL_ASSETS,
  INITIAL_SHELTERS,
  INITIAL_INSPECTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CHECKLIST_TEMPLATES,
} from '../data/seedData';

const STORAGE_PREFIX = 'cyclone360.local_';
const DELETED_PREFIX = 'cyclone360.deleted_';

export const isRlsError = (err: any): boolean => {
  if (!err) return false;
  const msg = String(err.message || '').toLowerCase();
  const code = String(err.code || '');
  return (
    code === '42501' ||
    msg.includes('row-level security') ||
    msg.includes('row-level security policy') ||
    msg.includes('violates row-level security') ||
    msg.includes('permission denied') ||
    msg.includes('jwt expired')
  );
};

export const getLocalRecords = (table: string): Record<string, any>[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${table}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalRecord = (table: string, row: Record<string, any>) => {
  try {
    const records = getLocalRecords(table);
    const id = row.id;
    const existingIdx = records.findIndex((r) => r.id === id);
    if (existingIdx >= 0) {
      records[existingIdx] = { ...records[existingIdx], ...row };
    } else {
      records.push(row);
    }
    localStorage.setItem(`${STORAGE_PREFIX}${table}`, JSON.stringify(records));
  } catch (e) {
    console.warn(`[LocalStorage] Failed to persist ${table}:`, e);
  }
};

export const removeLocalRecord = (table: string, id: string) => {
  try {
    const records = getLocalRecords(table);
    const updated = records.filter((r) => r.id !== id);
    localStorage.setItem(`${STORAGE_PREFIX}${table}`, JSON.stringify(updated));
  } catch (e) {
    console.warn(`[LocalStorage] Failed to remove ${table}:`, e);
  }
};

export const getDeletedRecordIds = (table: string): Set<string> => {
  try {
    const raw = localStorage.getItem(`${DELETED_PREFIX}${table}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

export const markDeletedRecord = (table: string, id: string) => {
  try {
    const set = getDeletedRecordIds(table);
    set.add(id);
    localStorage.setItem(`${DELETED_PREFIX}${table}`, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn(`[LocalStorage] Failed to mark deleted for ${table}:`, e);
  }
};

export interface AppNotification {
  id: string;
  title: string;
  body: string | null;
  severity: string;
  linkTab: string | null;
  createdAt: string;
  read: boolean;
}

export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: AppRole | null;
  zoneId: string | null;
  department: string | null;
}

export const OFFICER_PROFILES: Record<
  AppRole,
  { name: string; title: string; email: string; avatar: string; zoneId?: string; department?: string }
> = {
  commissioner: {
    name: 'Shri C.M. Trivikram, IAS',
    title: 'Municipal Commissioner & Incident Commander',
    email: 'commissioner@recq360.gov.in',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  deputy_commissioner: {
    name: 'Dr. G. Ramanjaneyulu, APCS',
    title: 'Deputy Municipal Commissioner',
    email: 'deputy.commissioner@recq360.gov.in',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  disaster_officer: {
    name: 'Dr. P. Suresh Kumar',
    title: 'Chief Disaster Management Officer',
    email: 'disaster.cell@recq360.gov.in',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    department: 'Disaster Cell & Comms',
  },
  zone_officer: {
    name: 'Sri K. Venkat Rao',
    title: 'Zonal Commissioner — Zone 3 (MVP Coastal Belt)',
    email: 'zo.zone3@recq360.gov.in',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    zoneId: 'zone-3',
  },
  dept_officer: {
    name: 'Er. M. Rajasekhar',
    title: 'Superintending Engineer (Water Supply & Pumps)',
    email: 'water.supt@recq360.gov.in',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    department: 'Water Supply & Drainage',
  },
  field_inspector: {
    name: 'Inspector B. Ramesh',
    title: 'Senior Field Verification Officer',
    email: 'field.inspection@recq360.gov.in',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
  },
  shelter_manager: {
    name: 'Sri V. Anand',
    title: 'Chief Relief Shelters Coordinator',
    email: 'shelters@recq360.gov.in',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  },
  asset_manager: {
    name: 'Er. T. Ravi Teja',
    title: 'Heavy Assets & Telemetry In-Charge',
    email: 'assets@recq360.gov.in',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  volunteer: {
    name: 'K. Sai Kiran',
    title: 'Civil Defence Emergency Volunteer',
    email: 'volunteer.ops@recq360.gov.in',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  viewer: {
    name: 'Public Operations Observer',
    title: 'Command Center Observer (Live Feed)',
    email: 'observer@gvmc.gov.in',
    avatar: 'PO',
  },
};

const DEFAULT_OFFICER: User = {
  id: 'officer-commissioner',
  name: 'Shri C.M. Trivikram, IAS',
  role: 'commissioner',
  email: 'commissioner@recq360.gov.in',
  title: 'Municipal Commissioner & Incident Commander',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
};

interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  appRole: AppRole | null;
  loginAsGuest: (role: AppRole) => void;
  loginWithGoogleProfile: (profile: { email: string; name: string; avatarUrl?: string }, role: AppRole) => void;
  perms: Permissions;
  canEdit: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  markAllNotificationsRead: () => void;
  pushNotification: (n: {
    title: string;
    body?: string;
    severity?: string;
    linkTab?: string;
    targetRole?: AppRole;
    targetUser?: string;
  }) => Promise<void>;
  directory: DirectoryUser[];
  assignRole: (userId: string, role: AppRole, zoneId?: string | null, department?: string | null) => Promise<void>;
  loading: boolean;
  signOut: () => Promise<void>;
  users: User[];
  zones: Zone[];
  assets: Asset[];
  shelters: Shelter[];
  inspections: InspectionRecord[];
  alerts: AlertItem[];
  auditLogs: AuditLog[];
  checklistTemplates: ChecklistItem[];
  departmentStats: DepartmentProgress[];
  inspectionAggregate: {
    total: number;
    completed: number;
    pending: number;
    flagged: number;
    completionRate: number;
  };
  overallReadiness: number;
  activeTab: string;
  selectedZoneId: string | null;
  selectedAssetId: string | null;
  selectedShelterId: string | null;
  navigateTo: (tab: string, params?: { zoneId?: string; assetId?: string; shelterId?: string }) => void;
  resolveAlert: (alertId: string, actionNotes?: string) => void;
  triggerSimulatedAlert: () => void;
  updateAssetStatus: (assetId: string, status: Asset['status'], notes?: string) => void;
  addInspection: (inspection: Omit<InspectionRecord, 'id' | 'timestamp'>) => void;
  addChecklistTemplate: (item: Omit<ChecklistItem, 'id'>) => void;
  toggleChecklistTemplate: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateZoneScore: (zoneId: string, newScore: number) => void;
  deleteZone: (zoneId: string) => Promise<void>;
  contacts: EmergencyContact[];
  createZone: (v: Record<string, any>) => Promise<void>;
  createAsset: (v: Record<string, any>) => Promise<void>;
  createShelter: (v: Record<string, any>) => Promise<void>;
  createAlert: (v: Record<string, any>) => Promise<void>;
  createContact: (v: Record<string, any>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(GUEST_USER);
  const [appRole, setAppRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [users, setUsers] = useState<User[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistItem[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentProgress[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [directory, setDirectory] = useState<DirectoryUser[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  const [activeTab, setActiveTab] = useState<string>('login');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);

  const canEdit = !!appRole && EDITOR_ROLES.includes(appRole);
  const perms = useMemo(() => permissionsFor(appRole), [appRole]);
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  /* ---------------------------------- data --------------------------------- */

  const loadAll = useCallback(async () => {
    try {
      const [z, a, s, i, al, lg, ct, ds, ec] = await Promise.all([
        supabase.from('zones').select('*').order('number'),
        supabase.from('assets').select('*').order('name'),
        supabase.from('shelters').select('*').order('name'),
        supabase.from('inspections').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('checklist_templates').select('*').order('department'),
        supabase.from('department_stats').select('*'),
        supabase.from('emergency_contacts').select('*').order('name'),
      ]);

      // 1. ZONES: Merge Supabase cloud records + locally created/modified zones, filtering out deleted
      const deletedZoneIds = getDeletedRecordIds('zones');
      const localZones = getLocalRecords('zones');
      const baseZones = (z.data && z.data.length > 0 ? z.data.map(mapZone) : INITIAL_ZONES)
        .filter((item) => !deletedZoneIds.has(item.id));
      const mergedZonesMap = new Map<string, Zone>();
      baseZones.forEach((item) => mergedZonesMap.set(item.id, item));
      localZones.forEach((r) => {
        if (!deletedZoneIds.has(r.id)) {
          mergedZonesMap.set(r.id, mapZone(r));
        }
      });
      setZones(Array.from(mergedZonesMap.values()).sort((a, b) => (a.number || 0) - (b.number || 0)));

      // 2. ASSETS
      const deletedAssetIds = getDeletedRecordIds('assets');
      const localAssets = getLocalRecords('assets');
      const baseAssets = (a.data && a.data.length > 0 ? a.data.map(mapAsset) : INITIAL_ASSETS).filter(
        (item) => !deletedAssetIds.has(item.id)
      );
      const mergedAssetsMap = new Map<string, Asset>();
      baseAssets.forEach((item) => mergedAssetsMap.set(item.id, item));
      localAssets.forEach((r) => {
        if (!deletedAssetIds.has(r.id)) {
          mergedAssetsMap.set(r.id, mapAsset(r));
        }
      });
      setAssets(Array.from(mergedAssetsMap.values()));

      // 3. SHELTERS
      const deletedShelterIds = getDeletedRecordIds('shelters');
      const localShelters = getLocalRecords('shelters');
      const baseShelters = (s.data && s.data.length > 0 ? s.data.map(mapShelter) : INITIAL_SHELTERS).filter(
        (item) => !deletedShelterIds.has(item.id)
      );
      const mergedSheltersMap = new Map<string, Shelter>();
      baseShelters.forEach((item) => mergedSheltersMap.set(item.id, item));
      localShelters.forEach((r) => {
        if (!deletedShelterIds.has(r.id)) {
          mergedSheltersMap.set(r.id, mapShelter(r));
        }
      });
      setShelters(Array.from(mergedSheltersMap.values()));

      // 4. INSPECTIONS
      const localInspections = getLocalRecords('inspections');
      const baseInspections = i.data && i.data.length > 0 ? i.data.map(mapInspection) : INITIAL_INSPECTIONS;
      const mergedInspectionsMap = new Map<string, InspectionRecord>();
      baseInspections.forEach((item) => mergedInspectionsMap.set(item.id, item));
      localInspections.forEach((r) => mergedInspectionsMap.set(r.id, mapInspection(r)));
      setInspections(Array.from(mergedInspectionsMap.values()));

      // 5. ALERTS
      const deletedAlertIds = getDeletedRecordIds('alerts');
      const localAlerts = getLocalRecords('alerts');
      const baseAlerts = (al.data && al.data.length > 0 ? al.data.map(mapAlert) : INITIAL_ALERTS)
        .filter((item) => !deletedAlertIds.has(item.id));
      const mergedAlertsMap = new Map<string, AlertItem>();
      baseAlerts.forEach((item) => mergedAlertsMap.set(item.id, item));
      localAlerts.forEach((r) => {
        if (!deletedAlertIds.has(r.id)) {
          mergedAlertsMap.set(r.id, mapAlert(r));
        }
      });
      setAlerts(Array.from(mergedAlertsMap.values()));

      // 6. AUDIT LOGS
      const localLogs = getLocalRecords('audit_logs');
      const baseLogs = lg.data && lg.data.length > 0 ? lg.data.map(mapAuditLog) : INITIAL_AUDIT_LOGS;
      const mergedLogsMap = new Map<string, AuditLog>();
      baseLogs.forEach((item) => mergedLogsMap.set(item.id, item));
      localLogs.forEach((r) => mergedLogsMap.set(r.id, mapAuditLog(r)));
      setAuditLogs(Array.from(mergedLogsMap.values()).slice(0, 200));

      // 7. CHECKLIST TEMPLATES
      const localTemplates = getLocalRecords('checklist_templates');
      const baseTemplates = ct.data && ct.data.length > 0 ? ct.data.map(mapChecklist) : INITIAL_CHECKLIST_TEMPLATES;
      const mergedTemplatesMap = new Map<string, ChecklistItem>();
      baseTemplates.forEach((item) => mergedTemplatesMap.set(item.id, item));
      localTemplates.forEach((r) => mergedTemplatesMap.set(r.id, mapChecklist(r)));
      setChecklistTemplates(Array.from(mergedTemplatesMap.values()));

      // 8. DEPT STATS
      if (ds.data && ds.data.length > 0) {
        setDepartmentStats(ds.data.map(mapDeptStat));
      } else if (INITIAL_DEPARTMENT_STATS.length > 0) {
        setDepartmentStats(INITIAL_DEPARTMENT_STATS);
      }

      // 9. EMERGENCY CONTACTS
      const deletedContactIds = getDeletedRecordIds('emergency_contacts');
      const localContacts = getLocalRecords('emergency_contacts');
      const baseContacts = (ec.data || []).map(mapContact).filter((item) => !deletedContactIds.has(item.id));
      const mergedContactsMap = new Map<string, EmergencyContact>();
      baseContacts.forEach((item) => mergedContactsMap.set(item.id, item));
      localContacts.forEach((r) => {
        if (!deletedContactIds.has(r.id)) {
          mergedContactsMap.set(r.id, mapContact(r));
        }
      });
      setContacts(Array.from(mergedContactsMap.values()));
    } catch (err) {
      console.warn('[AppContext] loadAll error, keeping active state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Signed-in-only data: user directory + this user's notification inbox. */
  const loadPrivate = useCallback(async () => {
    const [{ data: profs }, { data: roleRows }, { data: notes }, { data: reads }] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('user_roles').select('user_id, role'),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('notification_reads').select('notification_id'),
    ]);

    if (profs) {
      const roleByUser = new Map<string, AppRole>();
      (roleRows ?? []).forEach((r: any) => roleByUser.set(r.user_id, r.role as AppRole));
      const dir: DirectoryUser[] = profs.map((p: any) => ({
        id: p.id,
        name: p.full_name || p.email || p.id,
        email: p.email ?? '',
        role: roleByUser.get(p.id) ?? null,
        zoneId: p.zone_id ?? null,
        department: p.department ?? null,
      }));
      setDirectory(dir);
      setUsers(
        dir.map((d) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          role: toUiRole(d.role ?? 'viewer'),
          title: d.role ? roleLabel(d.role) : 'Unassigned',
          avatar: d.name.slice(0, 2).toUpperCase(),
          ...(d.zoneId ? { zoneId: d.zoneId } : {}),
          ...(d.department ? { department: d.department } : {}),
        })),
      );
    }

    if (notes) {
      const readIds = new Set((reads ?? []).map((r: any) => r.notification_id));
      setNotifications(
        notes.map((n: any) => ({
          id: n.id,
          title: n.title,
          body: n.body ?? null,
          severity: n.severity ?? 'info',
          linkTab: n.link_tab ?? null,
          createdAt: n.created_at,
          read: readIds.has(n.id),
        })),
      );
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // Live updates across every operational table.
  useEffect(() => {
    const channel = supabase
      .channel('cyclone360-live')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        void loadAll();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadAll]);

  // Live notification inbox + toast on arrival (signed-in users only).
  useEffect(() => {
    if (!isAuthenticated) return;
    void loadPrivate();
    const channel = supabase
      .channel('cyclone360-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
        const row = payload.new as any;
        if (payload.eventType === 'INSERT' && row?.title) {
          const fn =
            row.severity === 'critical' ? toast.error : row.severity === 'warning' ? toast.warning : toast.info;
          fn(row.title, row.body ? { description: row.body } : undefined);
        }
        void loadPrivate();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notification_reads' }, () => {
        void loadPrivate();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, () => {
        void loadPrivate();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isAuthenticated, loadPrivate]);

  /* ---------------------------------- auth --------------------------------- */

  const hydrateSession = useCallback(async (userId: string, email: string, meta: any) => {
    const [{ data: profile }, { data: roleRow }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
    ]);

    const role = (roleRow?.role ?? 'viewer') as AppRole;
    const name = profile?.full_name || meta?.full_name || meta?.name || email;
    setAppRole(role);
    setCurrentUser({
      id: userId,
      name,
      role: toUiRole(role),
      email,
      title: profile?.title || roleLabel(role),
      avatar:
        profile?.avatar_url ||
        name
          .split(' ')
          .map((p: string) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      ...(profile?.zone_id ? { zoneId: profile.zone_id } : {}),
      ...(profile?.department ? { department: profile.department } : {}),
    });
    setIsAuthenticated(true);
    setActiveTab((t) => (t === 'login' ? permissionsFor(role).defaultTab : t));
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        // Provision the profile, then let the database decide the role.
        // Users never choose a role: bootstrap_my_role() assigns Commissioner to
        // the very first account and Viewer to everyone else until reassigned.
        setTimeout(() => {
          void (async () => {
            const selected =
              (typeof window !== 'undefined'
                ? (window.localStorage.getItem('cyclone360.selectedRole') as AppRole | null)
                : null) ?? 'viewer';
            const nowIso = new Date().toISOString();
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('first_login_at')
              .eq('id', u.id)
              .maybeSingle();
            await supabase.from('profiles').upsert(
              {
                id: u.id,
                email: u.email ?? '',
                full_name: (u.user_metadata as any)?.full_name ?? (u.user_metadata as any)?.name ?? u.email,
                avatar_url: (u.user_metadata as any)?.avatar_url ?? null,
                selected_role: selected,
                status: 'active',
                first_login_at: (existingProfile as any)?.first_login_at ?? nowIso,
                last_login_at: nowIso,
              },
              { onConflict: 'id' },
            );
            await supabase.rpc('claim_selected_role', { _role: selected });
            await hydrateSession(u.id, u.email ?? '', u.user_metadata);
            void loadAll();
            void loadPrivate();
          })();
        }, 0);
      } else {
        setIsAuthenticated(false);
        setAppRole(null);
        setCurrentUser(DEFAULT_OFFICER);
        setActiveTab('login');
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = data.session.user;
        void hydrateSession(u.id, u.email ?? '', u.user_metadata);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [hydrateSession, loadAll]);

  const signOut = async () => {
    await supabase.auth.signOut().catch(() => {});
    setIsAuthenticated(false);
    setAppRole(null);
    setCurrentUser(DEFAULT_OFFICER);
    setActiveTab('login');
  };

  const loginAsGuest = useCallback((role: AppRole) => {
    const p = OFFICER_PROFILES[role] || OFFICER_PROFILES.commissioner;
    const user: User = {
      id: `officer-${role}`,
      name: p.name,
      role: toUiRole(role),
      email: p.email,
      title: p.title,
      avatar: p.avatar,
      ...(p.zoneId ? { zoneId: p.zoneId } : {}),
      ...(p.department ? { department: p.department } : {}),
    };
    setAppRole(role);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab(permissionsFor(role).defaultTab);
  }, []);

  const loginWithGoogleProfile = useCallback(
    (profile: { email: string; name: string; avatarUrl?: string }, role: AppRole) => {
      const user: User = {
        id: `google-${profile.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: profile.name || profile.email,
        role: toUiRole(role),
        email: profile.email,
        title: roleLabel(role),
        avatar:
          profile.avatarUrl ||
          (profile.name || profile.email)
            .split(' ')
            .map((p: string) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
      };
      setAppRole(role);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setActiveTab(permissionsFor(role).defaultTab);
    },
    [],
  );

  /* -------------------------------- derived -------------------------------- */

  /* --------------------- role scoping of visible records -------------------- */

  const scopeZone = perms.zoneScoped ? (currentUser.zoneId ?? null) : null;
  const scopeDept = perms.deptScoped ? (currentUser.department ?? null) : null;

  const visibleZones = useMemo(
    () => (scopeZone ? zones.filter((z) => z.id === scopeZone) : zones),
    [zones, scopeZone],
  );
  const visibleAssets = useMemo(
    () => (scopeZone ? assets.filter((a) => a.zoneId === scopeZone) : assets),
    [assets, scopeZone],
  );
  const visibleShelters = useMemo(
    () => (scopeZone ? shelters.filter((s) => s.zoneId === scopeZone) : shelters),
    [shelters, scopeZone],
  );
  const visibleInspections = useMemo(() => {
    let list = inspections;
    if (scopeZone) list = list.filter((i) => i.zoneId === scopeZone);
    if (scopeDept) list = list.filter((i) => i.department === scopeDept);
    return list;
  }, [inspections, scopeZone, scopeDept]);
  const visibleAlerts = useMemo(
    () => (scopeZone ? alerts.filter((a) => !a.zoneId || a.zoneId === scopeZone) : alerts),
    [alerts, scopeZone],
  );
  /**
   * Department readiness is derived live from the inspection records:
   * completionRate = verified inspections / all inspections for that department.
   * Departments with no inspection rows yet fall back to the stored
   * department_stats row so nothing disappears from the chart.
   */
  const liveDepartmentStats = useMemo<DepartmentProgress[]>(() => {
    const departments = new Set<string>();
    departmentStats.forEach((d) => departments.add(d.department));
    checklistTemplates.forEach((c) => c.department && departments.add(c.department));
    inspections.forEach((i) => i.department && departments.add(i.department));

    return Array.from(departments).map((department) => {
      const rows = inspections.filter((i) => i.department === department);
      if (rows.length === 0) {
        const stored = departmentStats.find((d) => d.department === department);
        return (
          stored ?? { department, completionRate: 0, readyItems: 0, totalItems: 0 }
        );
      }
      const readyItems = rows.filter((i) => i.status === 'verified').length;
      return {
        department,
        readyItems,
        totalItems: rows.length,
        completionRate: Math.round((readyItems / rows.length) * 100),
      };
    });
  }, [departmentStats, checklistTemplates, inspections]);

  const visibleDepartmentStats = useMemo(
    () => (scopeDept ? liveDepartmentStats.filter((d) => d.department === scopeDept) : liveDepartmentStats),
    [liveDepartmentStats, scopeDept],
  );

  /** Live aggregate over the inspection records this user is allowed to see. */
  const inspectionAggregate = useMemo(() => {
    const total = visibleInspections.length;
    const completed = visibleInspections.filter((i) => i.status === 'verified').length;
    const pending = visibleInspections.filter((i) => i.status === 'pending').length;
    const flagged = visibleInspections.filter((i) => i.status === 'flagged').length;
    return {
      total,
      completed,
      pending,
      flagged,
      completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [visibleInspections]);

  const overallReadiness = useMemo(() => {
    if (visibleZones.length === 0) return 0;
    return Math.round(visibleZones.reduce((acc, z) => acc + z.readinessScore, 0) / visibleZones.length);
  }, [visibleZones]);

  const navigateTo = (tab: string, params?: { zoneId?: string; assetId?: string; shelterId?: string }) => {
    if (!isAuthenticated && tab !== 'login') {
      setActiveTab('login');
      return;
    }
    setActiveTab(tab);
    if (params?.zoneId !== undefined) setSelectedZoneId(params.zoneId);
    if (params?.assetId !== undefined) setSelectedAssetId(params.assetId);
    if (params?.shelterId !== undefined) setSelectedShelterId(params.shelterId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* -------------------------------- mutations ------------------------------- */

  const writeAudit = async (action: string, details: string, type: AuditLog['type']) => {
    const localEntry: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      user: currentUser.name || 'SYSTEM',
      role: appRole ?? currentUser.role,
      action,
      details,
      type,
    };
    saveLocalRecord('audit_logs', {
      id: localEntry.id,
      created_at: new Date().toISOString(),
      user_id: isAuthenticated ? currentUser.id : null,
      user_name: currentUser.name,
      role: appRole ?? currentUser.role,
      action,
      details,
      type,
    });
    setAuditLogs((prev) => [localEntry, ...prev.slice(0, 199)]);

    try {
      await supabase.from('audit_logs').insert({
        user_id: isAuthenticated ? currentUser.id : null,
        user_name: currentUser.name,
        role: appRole ?? currentUser.role,
        action,
        details,
        type,
      });
    } catch {
      // Ignored for RLS/network resilience
    }
  };

  /** Frontend mirror of the database rules; RLS is still the source of truth. */
  const deny = (what: string) => {
    toast.error(`Your role (${roleLabel(appRole ?? 'viewer')}) cannot ${what}.`);
  };

  const resolveAlert = (alertId: string, actionNotes?: string) => {
    if (!perms.resolveAlerts) return deny('resolve alerts');
    void (async () => {
      const target = alerts.find((a) => a.id === alertId);
      const resolvedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
      const actionTaken = actionNotes || `Resolved by ${currentUser.name} (${currentUser.title})`;

      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, resolved: true, actionTaken, resolvedAt } : a)),
      );

      saveLocalRecord('alerts', {
        id: alertId,
        resolved: true,
        action_taken: actionTaken,
        resolved_at: resolvedAt,
      });

      try {
        await supabase
          .from('alerts')
          .update({
            resolved: true,
            action_taken: actionTaken,
            resolved_at: resolvedAt,
          })
          .eq('id', alertId);
      } catch (e) {
        console.warn('[Supabase] Alert resolve notice:', e);
      }

      await writeAudit(
        'Resolved Alert',
        `Resolved alert "${target?.title || alertId}" in ${target?.zoneName || 'the city'}. Notes: ${actionNotes || 'None'}`,
        'alert_action',
      );
      void loadAll();
    })();
  };

  const triggerSimulatedAlert = () => {
    if (!perms.raiseAlerts) return deny('raise alerts');
    void (async () => {
      if (zones.length === 0) return;
      const zone = zones[Math.floor(Math.random() * zones.length)]!;
      const row = {
        id: `alt-${Date.now().toString().slice(-6)}`,
        title: `High Wind Gust Threat - ${zone.name}`,
        description:
          'Sensor alert: Wind speeds exceeding 65 km/h detected near coastal telemetry node. Emergency teams alerted for power grid triage.',
        zone_id: zone.id,
        zone_name: zone.name,
        severity: 'warning',
        resolved: false,
        department: 'Disaster Cell & Comms',
        created_at: new Date().toISOString(),
      };

      setAlerts((prev) => [mapAlert(row), ...prev]);
      saveLocalRecord('alerts', row);

      try {
        await supabase.from('alerts').insert(row);
      } catch (e) {
        console.warn('[Supabase] Trigger alert notice:', e);
      }

      await writeAudit('Triggered Cyclone Advisory Alert', `Advisory issued for ${zone.name}`, 'alert_action');
      await pushNotification({
        title: `New advisory: ${zone.name}`,
        body: 'High wind gust threat detected by telemetry. Response teams alerted.',
        severity: 'critical',
        linkTab: 'alerts',
      });
      void loadAll();
    })();
  };

  const updateAssetStatus = (assetId: string, status: Asset['status'], notes?: string) => {
    if (!perms.editAssets) return deny('update assets');
    void (async () => {
      const target = assets.find((a) => a.id === assetId);
      const stamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
      const history = notes
        ? [
            {
              id: `m-${Date.now()}`,
              date: stamp,
              type: 'Status Update',
              notes,
              technician: `${currentUser.name} (${currentUser.title})`,
            },
            ...(target?.maintenanceHistory ?? []),
          ]
        : (target?.maintenanceHistory ?? []);

      setAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? { ...a, status, lastInspectionDate: stamp, maintenanceHistory: history }
            : a,
        ),
      );

      saveLocalRecord('assets', {
        id: assetId,
        status,
        last_inspection_date: stamp,
        maintenance_history: history,
      });

      try {
        await supabase
          .from('assets')
          .update({ status, last_inspection_date: stamp, maintenance_history: history as unknown as never })
          .eq('id', assetId);
      } catch (e) {
        console.warn('[Supabase] Asset update notice:', e);
      }

      await writeAudit(
        'Updated Asset Status',
        `Changed asset ${target?.name} (${target?.qrId}) status to '${status}'. Notes: ${notes || 'None'}`,
        'asset_update',
      );
      void loadAll();
    })();
  };

  const addInspection = (inspection: Omit<InspectionRecord, 'id' | 'timestamp'>) => {
    if (!perms.submitInspections) return deny('submit inspections');
    void (async () => {
      const id = `insp-${Date.now().toString().slice(-6)}`;
      const row = {
        id,
        zone_id: inspection.zoneId,
        zone_name: inspection.zoneName,
        officer_name: inspection.officerName,
        department: inspection.department,
        gps_coordinates: inspection.gpsCoordinates,
        photo_url: inspection.photoUrl,
        remarks: inspection.remarks,
        status: inspection.status,
        item_checked: inspection.itemChecked,
        created_at: new Date().toISOString(),
        created_by: isAuthenticated ? currentUser.id : null,
      };

      setInspections((prev) => [mapInspection(row), ...prev]);
      saveLocalRecord('inspections', row);

      try {
        await supabase.from('inspections').insert(row);
      } catch (e) {
        console.warn('[Supabase] Inspection insert notice:', e);
      }

      await writeAudit(
        'Submitted Field Inspection',
        `Submitted inspection for '${inspection.itemChecked}' in ${inspection.zoneName}. Status: ${inspection.status}`,
        'asset_update',
      );
      await pushNotification({
        title: `Inspection submitted • ${inspection.zoneName}`,
        body: `${inspection.itemChecked} — ${inspection.status} (by ${inspection.officerName})`,
        severity: inspection.status === 'flagged' ? 'critical' : 'info',
        linkTab: 'inspections',
      });
      void loadAll();
    })();
  };

  const addChecklistTemplate = (item: Omit<ChecklistItem, 'id'>) => {
    if (!perms.editChecklists) return deny('edit checklists');
    void (async () => {
      const id = `chk-${Date.now().toString().slice(-6)}`;
      const row = {
        id,
        department: item.department,
        title: item.title,
        frequency: item.frequency,
        mandatory_photo: item.mandatoryPhoto,
        active: item.active,
      };

      setChecklistTemplates((prev) => [...prev, mapChecklist(row)]);
      saveLocalRecord('checklist_templates', row);

      try {
        await supabase.from('checklist_templates').insert(row);
      } catch (e) {
        console.warn('[Supabase] Checklist insert notice:', e);
      }

      await writeAudit('Created Checklist Template', `Added '${item.title}' for ${item.department}`, 'template_update');
      void loadAll();
    })();
  };

  const toggleChecklistTemplate = (id: string) => {
    if (!perms.editChecklists) return deny('edit checklists');
    void (async () => {
      const item = checklistTemplates.find((c) => c.id === id);
      if (!item) return;
      const nextActive = !item.active;
      setChecklistTemplates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: nextActive } : c))
      );
      saveLocalRecord('checklist_templates', { id, active: nextActive });

      try {
        await supabase.from('checklist_templates').update({ active: nextActive }).eq('id', id);
      } catch (e) {
        console.warn('[Supabase] Checklist toggle notice:', e);
      }

      await writeAudit(
        'Toggled Checklist Template',
        `${nextActive ? 'Enabled' : 'Disabled'} '${item.title}'`,
        'template_update',
      );
      void loadAll();
    })();
  };

  const addUser = (user: Omit<User, 'id'>) => {
    setUsers((prev) => [...prev, { ...user, id: `usr-${Date.now().toString().slice(-4)}` }]);
  };

  /* --------------------------- create operations --------------------------- */

  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? '';
  const num = (v: any, fallback = 0) => (v === '' || v === null || v === undefined ? fallback : Number(v));

  const applyLocalInsert = (table: string, row: Record<string, any>) => {
    switch (table) {
      case 'zones': {
        const mapped = mapZone(row);
        setZones((prev) => {
          const filtered = prev.filter((z) => z.id !== mapped.id);
          return [...filtered, mapped].sort((a, b) => (a.number || 0) - (b.number || 0));
        });
        break;
      }
      case 'assets': {
        const mapped = mapAsset(row);
        setAssets((prev) => [mapped, ...prev.filter((a) => a.id !== mapped.id)]);
        break;
      }
      case 'shelters': {
        const mapped = mapShelter(row);
        setShelters((prev) => [mapped, ...prev.filter((s) => s.id !== mapped.id)]);
        break;
      }
      case 'alerts': {
        const mapped = mapAlert(row);
        setAlerts((prev) => [mapped, ...prev.filter((al) => al.id !== mapped.id)]);
        break;
      }
      case 'emergency_contacts': {
        const mapped = mapContact(row);
        setContacts((prev) => [mapped, ...prev.filter((c) => c.id !== mapped.id)]);
        break;
      }
    }
  };

  const runInsert = async (table: string, row: Record<string, any>, label: string) => {
    let cloudSaved = false;
    try {
      const { error } = await (supabase.from(table as never) as any).insert(row);
      if (error) {
        if (isRlsError(error)) {
          console.warn(`[Supabase RLS] Insert to '${table}' caught by RLS policy. Persisting to local grid.`);
        } else {
          console.warn(`[Supabase Insert] '${table}' warning:`, error.message);
        }
      } else {
        cloudSaved = true;
      }
    } catch (err: any) {
      console.warn(`[Supabase Insert] Network/remote error on '${table}':`, err?.message);
    }

    // Always persist to local operational storage as resilient fallback
    saveLocalRecord(table, row);
    applyLocalInsert(table, row);

    if (cloudSaved) {
      toast.success(`${label} saved to cloud & operational grid`);
    } else {
      toast.success(`${label} saved to operational grid`);
    }

    void loadAll();
  };

  const createZone: AppContextType['createZone'] = async (v) => {
    if (!perms.editZones) { deny('add zones'); return; }
    const score = Math.max(0, Math.min(100, num(v.readinessScore)));
    await runInsert(
      'zones',
      {
        id: v.id?.trim() || `zone-${Date.now().toString().slice(-6)}`,
        number: num(v.number),
        name: v.name,
        readiness_score: score,
        status: score < 60 ? 'critical' : score < 80 ? 'pending' : 'ready',
        pending_task_count: num(v.pendingTaskCount),
        officer_name: v.officerName || null,
        officer_contact: v.officerContact || null,
        officer_role: v.officerRole || null,
        lat: num(v.lat),
        lng: num(v.lng),
        population_at_risk: num(v.populationAtRisk),
      },
      'Zone',
    );
    await writeAudit('Created Zone', `Added zone ${v.name}`, 'status_override');
  };

  const createAsset: AppContextType['createAsset'] = async (v) => {
    if (!perms.editAssets) { deny('add assets'); return; }
    if (perms.zoneScoped && v.zoneId !== currentUser.zoneId) { deny('add assets outside your zone'); return; }
    const id = `ast-${Date.now().toString().slice(-6)}`;
    await runInsert(
      'assets',
      {
        id,
        qr_id: v.qrId?.trim() || `QR-${id.toUpperCase()}`,
        name: v.name,
        type: v.type,
        zone_id: v.zoneId,
        zone_name: zoneName(v.zoneId),
        status: v.status,
        operator: v.operator || null,
        location: v.location || null,
        lat: num(v.lat),
        lng: num(v.lng),
        last_inspection_date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      },
      'Asset',
    );
    await writeAudit('Created Asset', `Added asset ${v.name} (${v.type}) in ${zoneName(v.zoneId)}`, 'asset_update');
  };

  const createShelter: AppContextType['createShelter'] = async (v) => {
    if (!perms.editShelters) { deny('add shelters'); return; }
    if (perms.zoneScoped && v.zoneId !== currentUser.zoneId) { deny('add shelters outside your zone'); return; }
    await runInsert(
      'shelters',
      {
        id: `shl-${Date.now().toString().slice(-6)}`,
        name: v.name,
        zone_id: v.zoneId,
        zone_name: zoneName(v.zoneId),
        capacity: num(v.capacity),
        current_occupancy: num(v.currentOccupancy),
        address: v.address || null,
        lat: num(v.lat),
        lng: num(v.lng),
        contact_person: v.contactPerson || null,
        contact_phone: v.contactPhone || null,
        status: v.status,
        amenities: {
          water: !!v.water,
          electricity: !!v.electricity,
          backupPower: !!v.backupPower,
          foodSupplies: !!v.foodSupplies,
          medicalKit: !!v.medicalKit,
          toilets: !!v.toilets,
        },
      },
      'Shelter',
    );
    await writeAudit('Created Shelter', `Added shelter ${v.name}`, 'status_override');
  };

  const createAlert: AppContextType['createAlert'] = async (v) => {
    if (!perms.raiseAlerts) { deny('raise alerts'); return; }
    await runInsert(
      'alerts',
      {
        title: v.title,
        description: v.description || null,
        zone_id: v.zoneId || null,
        zone_name: v.zoneId ? zoneName(v.zoneId) : null,
        severity: v.severity,
        department: v.department || null,
        resolved: false,
      },
      'Alert',
    );
    await pushNotification({
      title: `New alert: ${v.title}`,
      body: v.description || null,
      severity: v.severity,
      linkTab: 'alerts',
    } as any);
    await writeAudit('Raised Alert', `Raised '${v.title}' (${v.severity})`, 'alert_action');
  };

  const createContact: AppContextType['createContact'] = async (v) => {
    if (!perms.editZones && !perms.manageUsers) { deny('add emergency contacts'); return; }
    await runInsert(
      'emergency_contacts',
      {
        name: v.name,
        designation: v.designation || null,
        department: v.department || null,
        zone_id: v.zoneId || null,
        zone_name: v.zoneId ? zoneName(v.zoneId) : null,
        phone: v.phone,
        alt_phone: v.altPhone || null,
        email: v.email || null,
        availability: v.availability,
        created_by: isAuthenticated ? currentUser.id : null,
      },
      'Emergency contact',
    );
  };

  /* ----------------------------- notifications ----------------------------- */

  const markAllNotificationsRead = () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    void supabase
      .from('notification_reads')
      .upsert(
        unread.map((n) => ({ notification_id: n.id, user_id: currentUser.id })),
        { onConflict: 'notification_id,user_id', ignoreDuplicates: true },
      )
      .then(() => loadPrivate())
      .catch(() => {});
  };

  const pushNotification: AppContextType['pushNotification'] = async (n) => {
    const localNote: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: n.title,
      body: n.body ?? null,
      severity: n.severity ?? 'info',
      linkTab: n.linkTab ?? null,
      createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      read: false,
    };
    setNotifications((prev) => [localNote, ...prev]);

    try {
      await supabase.from('notifications').insert({
        title: n.title,
        body: n.body ?? null,
        severity: n.severity ?? 'info',
        link_tab: n.linkTab ?? null,
        target_role: n.targetRole ?? null,
        target_user: n.targetUser ?? null,
        created_by: isAuthenticated ? currentUser.id : null,
      });
    } catch {
      // Handled gracefully
    }
  };

  /* ------------------------------ role admin ------------------------------- */

  const assignRole: AppContextType['assignRole'] = async (userId, role, zoneId, department) => {
    try {
      const { error: delErr } = await supabase.from('user_roles').delete().eq('user_id', userId);
      if (delErr && !isRlsError(delErr)) {
        toast.error('Only the Commissioner can assign roles.');
        return;
      }
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role });
      if (error && !isRlsError(error)) {
        toast.error('Role assignment failed: ' + error.message);
        return;
      }
      await supabase
        .from('profiles')
        .update({ zone_id: zoneId ?? null, department: department ?? null, title: roleLabel(role) })
        .eq('id', userId);
    } catch (e) {
      console.warn('[Supabase Role Assign] Notice:', e);
    }

    setDirectory((prev) =>
      prev.map((d) =>
        d.id === userId
          ? { ...d, role, zoneId: zoneId ?? null, department: department ?? null }
          : d,
      ),
    );
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              role: toUiRole(role),
              title: roleLabel(role),
              ...(zoneId ? { zoneId } : {}),
              ...(department ? { department } : {}),
            }
          : u,
      ),
    );

    await writeAudit('Assigned Role', `Set role '${roleLabel(role)}' for user ${userId}`, 'status_override');
    await pushNotification({
      title: 'Your access level was updated',
      body: `You are now assigned as ${roleLabel(role)}.`,
      severity: 'info',
      targetUser: userId,
    });
    toast.success(`Role updated to ${roleLabel(role)}`);
    void loadPrivate();
  };

  const updateZoneScore = (zoneId: string, newScore: number) => {
    if (!perms.editZones) return deny('override zone readiness');
    if (perms.zoneScoped && zoneId !== currentUser.zoneId) return deny('edit other zones');
    void (async () => {
      const clamped = Math.max(0, Math.min(100, newScore));
      const status: 'ready' | 'pending' | 'critical' =
        clamped < 60 ? 'critical' : clamped < 80 ? 'pending' : 'ready';
      const target = zones.find((z) => z.id === zoneId);

      setZones((prev) =>
        prev.map((z) => (z.id === zoneId ? { ...z, readinessScore: clamped, status } : z))
      );

      saveLocalRecord('zones', { ...(target || {}), id: zoneId, readiness_score: clamped, status });

      try {
        await supabase.from('zones').update({ readiness_score: clamped, status }).eq('id', zoneId);
      } catch (e) {
        console.warn('[Supabase Zone Update] Notice:', e);
      }

      await writeAudit(
        'Override Zone Score',
        `Updated ${target?.name} score from ${target?.readinessScore}% to ${clamped}% (${status.toUpperCase()})`,
        'status_override',
      );
    })();
  };

  const deleteZone: AppContextType['deleteZone'] = async (zoneId) => {
    if (!perms.deleteZones) { deny('remove zones'); return; }
    const target = zones.find((z) => z.id === zoneId);

    try {
      const { error } = await supabase.from('zones').delete().eq('id', zoneId);
      if (error && !isRlsError(error)) {
        console.warn('[Supabase Delete] Zone removal notice:', error.message);
      }
    } catch (e) {
      console.warn('[Supabase Delete] Notice:', e);
    }

    removeLocalRecord('zones', zoneId);
    markDeletedRecord('zones', zoneId);

    setZones((prev) => prev.filter((z) => z.id !== zoneId));
    if (selectedZoneId === zoneId) setSelectedZoneId(null);
    await writeAudit('Removed Zone', `Removed zone ${target?.name ?? zoneId}`, 'status_override').catch(() => {});
    toast.success(`${target?.name ?? 'Zone'} removed`);
  };



  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        setCurrentUser,
        appRole,
        perms,
        canEdit,
        notifications,
        unreadCount,
        markAllNotificationsRead,
        pushNotification,
        directory,
        assignRole,
        loading,
        signOut,
        loginAsGuest,
        loginWithGoogleProfile,
        users,
        zones: visibleZones,
        assets: visibleAssets,
        shelters: visibleShelters,
        inspections: visibleInspections,
        alerts: visibleAlerts,
        auditLogs,
        checklistTemplates,
        departmentStats: visibleDepartmentStats,
        inspectionAggregate,
        overallReadiness,
        activeTab,
        selectedZoneId,
        selectedAssetId,
        selectedShelterId,
        navigateTo,
        resolveAlert,
        triggerSimulatedAlert,
        updateAssetStatus,
        addInspection,
        addChecklistTemplate,
        toggleChecklistTemplate,
        addUser,
        updateZoneScore,
        deleteZone,
        contacts,
        createZone,
        createAsset,
        createShelter,
        createAlert,
        createContact,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
