/** Facility types as the healthcare service stores them (one place for labels, icons and colours). */
export const FACILITY_TYPES = [
  { id: 'PRIMARY_CARE', label: 'Primary care', icon: '🏥', color: '#16a34a', bgColor: '#f0fdf4' },
  { id: 'SECONDARY_CARE', label: 'General hospital', icon: '🏨', color: '#1d4ed8', bgColor: '#eff6ff' },
  { id: 'TERTIARY_CARE', label: 'Teaching or tertiary hospital', icon: '🏛️', color: '#4338ca', bgColor: '#eef2ff' },
  { id: 'SPECIALIST', label: 'Specialist', icon: '⚕️', color: '#7c3aed', bgColor: '#f5f3ff' },
  { id: 'MATERNITY', label: 'Maternity', icon: '👶', color: '#be123c', bgColor: '#fff1f2' },
  { id: 'PHARMACY', label: 'Pharmacy', icon: '💊', color: '#d97706', bgColor: '#fffbeb' },
  { id: 'DIAGNOSTIC', label: 'Diagnostics and laboratory', icon: '🔬', color: '#0e7490', bgColor: '#ecfeff' },
  { id: 'MENTAL_HEALTH', label: 'Mental health', icon: '🧠', color: '#9333ea', bgColor: '#faf5ff' },
  { id: 'DENTAL', label: 'Dental', icon: '🦷', color: '#0369a1', bgColor: '#f0f9ff' },
  { id: 'OPTOMETRY', label: 'Eye care', icon: '👁️', color: '#047857', bgColor: '#ecfdf5' },
];

export const typeInfo = (id) => FACILITY_TYPES.find((t) => t.id === id) ?? FACILITY_TYPES[0];

/** What a facility's availability means to a patient. */
export const AVAILABILITY = {
  AVAILABLE: { label: 'Accepting patients', open: true, bg: '#dcfce7', color: '#166534' },
  EMERGENCY_ONLY: { label: 'Emergencies only', open: false, bg: '#fef3c7', color: '#92400e' },
  FULL: { label: 'Full right now', open: false, bg: '#fee2e2', color: '#991b1b' },
  CLOSED: { label: 'Closed', open: false, bg: '#f3f4f6', color: '#374151' },
};

export const APPT_STATUS = {
  PENDING: { label: 'Waiting for the facility to confirm', bg: '#fffbeb', color: '#b45309' },
  CONFIRMED: { label: 'Confirmed', bg: '#dcfce7', color: '#166534' },
  CHECKED_IN: { label: 'Checked in', bg: '#e0e7ff', color: '#3730a3' },
  COMPLETED: { label: 'Completed', bg: '#f3f4f6', color: '#374151' },
  CANCELLED: { label: 'Cancelled', bg: '#fee2e2', color: '#991b1b' },
  NO_SHOW: { label: 'Missed', bg: '#fee2e2', color: '#991b1b' },
};

export const ALERT_SEVERITY = {
  INFO: { label: 'Information', bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', chipBg: '#2563eb' },
  WARNING: { label: 'Warning', bg: '#fffbeb', border: '#fde68a', color: '#92400e', chipBg: '#d97706' },
  CRITICAL: { label: 'Urgent', bg: '#fff1f2', border: '#fecdd3', color: '#be123c', chipBg: '#dc2626' },
};

/** Nigeria's national emergency number. The only contact shown, so no region's local line is presented as everyone's. */
export const EMERGENCY_NUMBER = '112';

/** Format a slot's instant in the facility's local time (West Africa Time), whatever the viewer's own time zone is. */
export const formatSlot = (iso) =>
  new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' });
export const formatWhen = (iso) =>
  new Date(iso).toLocaleString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' });

export const RECORD_SECTIONS = [
  { id: 'ALLERGIES', label: 'Allergies' },
  { id: 'DIAGNOSES', label: 'Diagnoses' },
  { id: 'MEDICATIONS', label: 'Medications' },
  { id: 'LAB_RESULTS', label: 'Lab results' },
];
export const SECTION_LABEL = { ...Object.fromEntries(RECORD_SECTIONS.map((x) => [x.id, x.label])), BLOOD_TYPE: 'Blood type', EMERGENCY_CONTACT: 'Emergency contact' };
export const LOG_ACTION = { READ: 'Opened', GRANT: 'You gave access to', REVOKE: 'You removed access for', CREATE: 'Started your record at', UPDATE: 'Updated your record at' };
