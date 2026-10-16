export const LEVELS = [
  { id: 'PRIMARY', label: 'Primary school', icon: '🏫' },
  { id: 'SECONDARY', label: 'Secondary school', icon: '🏫' },
  { id: 'TERTIARY', label: 'Tertiary institution', icon: '🎓' },
];
export const levelInfo = (id) => LEVELS.find((l) => l.id === id) ?? { id, label: id, icon: '🏫' };

export const APPLICATION_STATUS = {
  PENDING: { label: 'Waiting for the school', bg: '#fffbeb', color: '#b45309' },
  WAITLISTED: { label: 'On the waiting list', bg: '#e0e7ff', color: '#3730a3' },
  APPROVED: { label: 'Accepted', bg: '#dcfce7', color: '#166534' },
  REJECTED: { label: 'Not accepted', bg: '#fee2e2', color: '#991b1b' },
};

export const GRADE_COLOR = { A: '#16a34a', B: '#0d9488', C: '#d97706', D: '#ea580c', F: '#dc2626' };
export const ACCENT = 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)';
export const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

export const FACILITY_LABELS = {
  LIBRARY: 'Library',
  LABORATORY: 'Laboratory',
  SPORTS_GROUND: 'Sports ground',
  TRANSPORT: 'School transport',
  ICT_ROOM: 'Computer room',
  CANTEEN: 'Canteen',
  CLINIC: 'Sick bay or clinic',
};
