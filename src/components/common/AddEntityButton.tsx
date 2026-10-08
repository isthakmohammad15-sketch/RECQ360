import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FormModal, type FormField } from './FormModal';

export type AddEntityKind = 'zone' | 'asset' | 'shelter' | 'alert' | 'contact' | 'notification';

interface Props {
  kind: AddEntityKind;
  label?: string;
  className?: string;
}

/**
 * Role-aware "Add …" button. Hidden entirely when the signed-in role cannot
 * create that record (mirrors the RLS rules), otherwise opens a modal form
 * that writes straight into the database.
 */
export const AddEntityButton: React.FC<Props> = ({ kind, label, className }) => {
  const app = useApp();
  const { zones, perms, currentUser, isAuthenticated } = app;
  const [open, setOpen] = useState(false);

  const zoneOptions = useMemo(
    () =>
      zones.map((z) => ({ value: z.id, label: `Zone ${z.number} — ${z.name}` })),
    [zones],
  );

  const allowed = (() => {
    if (!isAuthenticated) return false;
    switch (kind) {
      case 'zone':
        return perms.editZones && !perms.zoneScoped;
      case 'asset':
        return perms.editAssets;
      case 'shelter':
        return perms.editShelters;
      case 'alert':
        return perms.raiseAlerts;
      case 'contact':
        return perms.editZones || perms.manageUsers;
      case 'notification':
        return perms.manageUsers || perms.raiseAlerts;
    }
  })();

  if (!allowed) return null;

  const config: Record<AddEntityKind, { title: string; subtitle: string; button: string; fields: FormField[] }> = {
    zone: {
      title: 'Add Zone Details',
      subtitle: 'Creates a new administrative zone in the live grid',
      button: 'Add Zone',
      fields: [
        { name: 'name', label: 'Zone Name', type: 'text', required: true, half: true, placeholder: 'Bheemili' },
        { name: 'number', label: 'Zone Number', type: 'number', required: true, half: true },
        { name: 'id', label: 'Zone Code', type: 'text', half: true, placeholder: 'auto-generated if blank' },
        { name: 'readinessScore', label: 'Readiness Score (%)', type: 'number', half: true, defaultValue: 0 },
        { name: 'pendingTaskCount', label: 'Pending Tasks', type: 'number', half: true, defaultValue: 0 },
        { name: 'populationAtRisk', label: 'Population at Risk', type: 'number', half: true, defaultValue: 0 },
        { name: 'officerName', label: 'Zone Officer', type: 'text', half: true },
        { name: 'officerContact', label: 'Officer Contact', type: 'text', half: true },
        { name: 'officerRole', label: 'Officer Designation', type: 'text', half: true },
        { name: 'lat', label: 'Latitude', type: 'number', required: true, half: true, defaultValue: 17.7285 },
        { name: 'lng', label: 'Longitude', type: 'number', required: true, half: true, defaultValue: 83.2885 },
      ],
    },
    asset: {
      title: 'Add Asset',
      subtitle: 'Pumps, generators, vehicles, equipment, hospitals & control rooms',
      button: 'Add Asset',
      fields: [
        { name: 'name', label: 'Asset Name', type: 'text', required: true, half: true },
        {
          name: 'type',
          label: 'Asset Type',
          type: 'select',
          required: true,
          half: true,
          options: [
            { value: 'de-watering-pump', label: 'De-watering Pump' },
            { value: 'generator', label: 'Generator' },
            { value: 'vehicle', label: 'Vehicle' },
            { value: 'equipment', label: 'Equipment' },
            { value: 'rescue-boat', label: 'Rescue Boat' },
            { value: 'jcb', label: 'JCB' },
            { value: 'ambulance', label: 'Ambulance' },
            { value: 'chainsaw', label: 'Chainsaw' },
            { value: 'satellite-phone', label: 'Satellite Phone' },
            { value: 'hospital', label: 'Hospital' },
            { value: 'control-room', label: 'Control Room' },
          ],
        },
        { name: 'zoneId', label: 'Zone', type: 'select', required: true, half: true, options: zoneOptions },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          half: true,
          options: [
            { value: 'ready', label: 'Ready' },
            { value: 'pending-check', label: 'Pending Check' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'critical', label: 'Critical' },
          ],
        },
        { name: 'qrId', label: 'QR / Tag ID', type: 'text', half: true, placeholder: 'auto-generated if blank' },
        { name: 'operator', label: 'Operator', type: 'text', half: true },
        { name: 'location', label: 'Location / Landmark', type: 'text' },
        { name: 'lat', label: 'Latitude', type: 'number', required: true, half: true, defaultValue: 17.7285 },
        { name: 'lng', label: 'Longitude', type: 'number', required: true, half: true, defaultValue: 83.2885 },
      ],
    },
    shelter: {
      title: 'Add Shelter',
      subtitle: 'Registers a cyclone relief shelter with live capacity tracking',
      button: 'Add Shelter',
      fields: [
        { name: 'name', label: 'Shelter Name', type: 'text', required: true, half: true },
        { name: 'zoneId', label: 'Zone', type: 'select', required: true, half: true, options: zoneOptions },
        { name: 'capacity', label: 'Capacity', type: 'number', required: true, half: true },
        { name: 'currentOccupancy', label: 'Current Occupancy', type: 'number', half: true, defaultValue: 0 },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          half: true,
          options: [
            { value: 'preparing', label: 'Preparing' },
            { value: 'operational', label: 'Operational' },
            { value: 'near-capacity', label: 'Near Capacity' },
          ],
        },
        { name: 'contactPerson', label: 'Contact Person', type: 'text', half: true },
        { name: 'contactPhone', label: 'Contact Phone', type: 'text', half: true },
        { name: 'address', label: 'Address', type: 'textarea' },
        { name: 'lat', label: 'Latitude', type: 'number', required: true, half: true, defaultValue: 17.7285 },
        { name: 'lng', label: 'Longitude', type: 'number', required: true, half: true, defaultValue: 83.2885 },
        { name: 'water', label: 'Water', type: 'checkbox', half: true, placeholder: 'Available' },
        { name: 'electricity', label: 'Electricity', type: 'checkbox', half: true, placeholder: 'Available' },
        { name: 'backupPower', label: 'Backup Power', type: 'checkbox', half: true, placeholder: 'Available' },
        { name: 'foodSupplies', label: 'Food Supplies', type: 'checkbox', half: true, placeholder: 'Available' },
        { name: 'medicalKit', label: 'Medical Kit', type: 'checkbox', half: true, placeholder: 'Available' },
        { name: 'toilets', label: 'Toilets', type: 'checkbox', half: true, placeholder: 'Available' },
      ],
    },
    alert: {
      title: 'Create Alert',
      subtitle: 'Broadcasts an operational alert to every connected dashboard',
      button: 'Create Alert',
      fields: [
        { name: 'title', label: 'Alert Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        {
          name: 'severity',
          label: 'Severity',
          type: 'select',
          required: true,
          half: true,
          options: [
            { value: 'critical', label: 'Critical' },
            { value: 'warning', label: 'Warning' },
            { value: 'info', label: 'Info' },
          ],
        },
        { name: 'zoneId', label: 'Zone', type: 'select', half: true, options: [{ value: '', label: 'City-wide' }, ...zoneOptions] },
        { name: 'department', label: 'Department', type: 'text', half: true },
      ],
    },
    contact: {
      title: 'Add Emergency Contact',
      subtitle: 'Command directory used during cyclone response',
      button: 'Add Contact',
      fields: [
        { name: 'name', label: 'Full Name', type: 'text', required: true, half: true },
        { name: 'designation', label: 'Designation', type: 'text', half: true },
        { name: 'department', label: 'Department', type: 'text', half: true },
        { name: 'zoneId', label: 'Zone', type: 'select', half: true, options: [{ value: '', label: 'City-wide' }, ...zoneOptions] },
        { name: 'phone', label: 'Phone', type: 'text', required: true, half: true },
        { name: 'altPhone', label: 'Alternate Phone', type: 'text', half: true },
        { name: 'email', label: 'Email', type: 'text', half: true },
        {
          name: 'availability',
          label: 'Availability',
          type: 'select',
          required: true,
          half: true,
          options: [
            { value: '24x7', label: '24x7' },
            { value: 'day-shift', label: 'Day Shift' },
            { value: 'night-shift', label: 'Night Shift' },
            { value: 'on-call', label: 'On Call' },
          ],
        },
      ],
    },
    notification: {
      title: 'Create Notification',
      subtitle: 'Delivered instantly to connected users',
      button: 'Create Notification',
      fields: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'body', label: 'Message', type: 'textarea', required: true },
        {
          name: 'severity',
          label: 'Severity',
          type: 'select',
          required: true,
          half: true,
          options: [
            { value: 'info', label: 'Info' },
            { value: 'warning', label: 'Warning' },
            { value: 'critical', label: 'Critical' },
          ],
        },
        {
          name: 'linkTab',
          label: 'Open Module',
          type: 'select',
          half: true,
          options: [
            { value: '', label: 'None' },
            { value: 'dashboard', label: 'Dashboard' },
            { value: 'alerts', label: 'Alerts' },
            { value: 'assets', label: 'Assets' },
            { value: 'shelters', label: 'Shelters' },
            { value: 'inspections', label: 'Inspections' },
          ],
        },
      ],
    },
  };

  const cfg = config[kind];

  const submit = async (v: Record<string, any>) => {
    switch (kind) {
      case 'zone':
        return app.createZone(v);
      case 'asset':
        return app.createAsset(perms.zoneScoped && currentUser.zoneId ? { ...v, zoneId: currentUser.zoneId } : v);
      case 'shelter':
        return app.createShelter(perms.zoneScoped && currentUser.zoneId ? { ...v, zoneId: currentUser.zoneId } : v);
      case 'alert':
        return app.createAlert(v);
      case 'contact':
        return app.createContact(v);
      case 'notification':
        await app.pushNotification({
          title: v.title,
          body: v.body,
          severity: v.severity,
          ...(v.linkTab ? { linkTab: v.linkTab } : {}),
        });
        return;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          'px-4 py-2 rounded bg-[#2FBF71]/20 hover:bg-[#2FBF71]/30 border border-[#2FBF71]/40 text-[#2FBF71] font-mono text-xs font-bold flex items-center gap-2 shrink-0 transition-colors'
        }
      >
        <Plus className="w-4 h-4" />
        <span>{label ?? cfg.button}</span>
      </button>

      <FormModal
        open={open}
        title={cfg.title}
        subtitle={cfg.subtitle}
        fields={cfg.fields}
        submitLabel={cfg.button}
        onClose={() => setOpen(false)}
        onSubmit={submit}
        portal={kind === 'zone' || kind === 'alert'}
      />
    </>
  );
};
