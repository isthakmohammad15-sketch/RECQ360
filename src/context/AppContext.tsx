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
import { toast } from 'sonner';

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

const GUEST_USER: User = {
  id: 'guest',
  name: 'Guest Observer',
  role: 'dept_officer',
  email: '',
  title: 'Read-only Preview',
  avatar: 'GO',
};

interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  appRole: AppRole | null;
  loginAsGuest: (role: AppRole) => void;
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
    if (z.data) setZones(z.data.map(mapZone));
    if (a.data) setAssets(a.data.map(mapAsset));
    if (s.data) setShelters(s.data.map(mapShelter));
    if (i.data) setInspections(i.data.map(mapInspection));
    if (al.data) setAlerts(al.data.map(mapAlert));
    if (lg.data) setAuditLogs(lg.data.map(mapAuditLog));
    if (ct.data) setChecklistTemplates(ct.data.map(mapChecklist));
    if (ds.data) setDepartmentStats(ds.data.map(mapDeptStat));
    if (ec.data) setContacts(ec.data.map(mapContact));
    setLoading(false);
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
        setCurrentUser(GUEST_USER);
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
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setAppRole(null);
    setCurrentUser(GUEST_USER);
    setActiveTab('login');
  };

  const loginAsGuest = useCallback((role: AppRole) => {
    const user: User = {
      id: 'demo-officer',
      name: `Field Officer (${roleLabel(role)})`,
      role: toUiRole(role),
      email: 'officer@gvmc.gov.in',
      title: roleLabel(role),
      avatar: 'FO',
    };
    setAppRole(role);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab(permissionsFor(role).defaultTab);
  }, []);

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
    await supabase.from('audit_logs').insert({
      user_id: isAuthenticated ? currentUser.id : null,
      user_name: currentUser.name,
      role: appRole ?? currentUser.role,
      action,
      details,
      type,
    });
  };

  /** Frontend mirror of the database rules; RLS is still the source of truth. */
  const deny = (what: string) => {
    toast.error(`Your role (${roleLabel(appRole ?? 'viewer')}) cannot ${what}.`);
  };

  const resolveAlert = (alertId: string, actionNotes?: string) => {
    if (!perms.resolveAlerts) return deny('resolve alerts');
    void (async () => {
      const target = alerts.find((a) => a.id === alertId);
      await supabase
        .from('alerts')
        .update({
          resolved: true,
          action_taken: actionNotes || `Resolved by ${currentUser.name} (${currentUser.title})`,
          resolved_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        })
        .eq('id', alertId);
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
      await supabase.from('alerts').insert({
        title: `High Wind Gust Threat - ${zone.name}`,
        description:
          'Sensor alert: Wind speeds exceeding 65 km/h detected near coastal telemetry node. Emergency teams alerted for power grid triage.',
        zone_id: zone.id,
        zone_name: zone.name,
        severity: 'warning',
        resolved: false,
        department: 'Disaster Cell & Comms',
      });
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

      await supabase
        .from('assets')
        .update({ status, last_inspection_date: stamp, maintenance_history: history as unknown as never })
        .eq('id', assetId);
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
      await supabase.from('inspections').insert({
        zone_id: inspection.zoneId,
        zone_name: inspection.zoneName,
        officer_name: inspection.officerName,
        department: inspection.department,
        gps_coordinates: inspection.gpsCoordinates,
        photo_url: inspection.photoUrl,
        remarks: inspection.remarks,
        status: inspection.status,
        item_checked: inspection.itemChecked,
        created_by: isAuthenticated ? currentUser.id : null,
      });
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
      await supabase.from('checklist_templates').insert({
        id: `chk-${Date.now().toString().slice(-6)}`,
        department: item.department,
        title: item.title,
        frequency: item.frequency,
        mandatory_photo: item.mandatoryPhoto,
        active: item.active,
      });
      await writeAudit('Created Checklist Template', `Added '${item.title}' for ${item.department}`, 'template_update');
      void loadAll();
    })();
  };

  const toggleChecklistTemplate = (id: string) => {
    if (!perms.editChecklists) return deny('edit checklists');
    void (async () => {
      const item = checklistTemplates.find((c) => c.id === id);
      if (!item) return;
      await supabase.from('checklist_templates').update({ active: !item.active }).eq('id', id);
      await writeAudit(
        'Toggled Checklist Template',
        `${item.active ? 'Disabled' : 'Enabled'} '${item.title}'`,
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

  const runInsert = async (table: string, row: Record<string, any>, label: string) => {
    const { error } = await (supabase.from(table as never) as any).insert(row);
    if (error) {
      toast.error(`${label} failed: ${error.message}`);
      throw error;
    }
    toast.success(`${label} saved`);
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
      .then(() => loadPrivate());
  };

  const pushNotification: AppContextType['pushNotification'] = async (n) => {
    await supabase.from('notifications').insert({
      title: n.title,
      body: n.body ?? null,
      severity: n.severity ?? 'info',
      link_tab: n.linkTab ?? null,
      target_role: n.targetRole ?? null,
      target_user: n.targetUser ?? null,
      created_by: isAuthenticated ? currentUser.id : null,
    });
  };

  /* ------------------------------ role admin ------------------------------- */

  const assignRole: AppContextType['assignRole'] = async (userId, role, zoneId, department) => {
    const { error: delErr } = await supabase.from('user_roles').delete().eq('user_id', userId);
    if (delErr) {
      toast.error('Only the Commissioner can assign roles.');
      return;
    }
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role });
    if (error) {
      toast.error('Role assignment failed: ' + error.message);
      return;
    }
    await supabase
      .from('profiles')
      .update({ zone_id: zoneId ?? null, department: department ?? null, title: roleLabel(role) })
      .eq('id', userId);
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
      await supabase.from('zones').update({ readiness_score: clamped, status }).eq('id', zoneId);
      await writeAudit(
        'Override Zone Score',
        `Updated ${target?.name} score from ${target?.readinessScore}% to ${clamped}% (${status.toUpperCase()})`,
        'status_override',
      );
      void loadAll();
    })();
  };

  const deleteZone: AppContextType['deleteZone'] = async (zoneId) => {
    if (!perms.deleteZones) { deny('remove zones'); return; }
    const target = zones.find((z) => z.id === zoneId);
    const { error } = await supabase.from('zones').delete().eq('id', zoneId);
    if (error) {
      toast.error('Zone removal failed: ' + error.message);
      return;
    }
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
    if (selectedZoneId === zoneId) setSelectedZoneId(null);
    await writeAudit('Removed Zone', `Removed zone ${target?.name ?? zoneId}`, 'status_override');
    toast.success(`${target?.name ?? 'Zone'} removed`);
    void loadAll();
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
