export const mockIncidents = [
  {
    id: 'inc_001',
    category: 'armed_robbery',
    severity: 'high',
    status: 'active',
    location: { lat: 6.4310, lng: 3.4314, address: 'Lekki Phase 1, Lagos', lga: 'Eti-Osa', state: 'Lagos' },
    description: 'Three armed men accosting motorists at the Lekki roundabout. Currently blocking traffic.',
    photos: [],
    reportedAt: '2026-06-04T07:15:00Z',
    reportedBy: { id: 'u_anon', name: 'Anonymous', verified: false },
    assignedOfficer: 'off_003',
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T07:15:00Z', by: 'citizen' },
      { action: 'acknowledged', timestamp: '2026-06-04T07:18:00Z', by: 'off_003' },
      { action: 'responding', timestamp: '2026-06-04T07:22:00Z', by: 'off_003' },
    ],
  },
  {
    id: 'inc_002',
    category: 'fire',
    severity: 'critical',
    status: 'responding',
    location: { lat: 6.5244, lng: 3.3792, address: 'Victoria Island, Lagos', lga: 'Eti-Osa', state: 'Lagos' },
    description: 'Fire outbreak on a 3-storey commercial building near Adeola Odeku. Fire service has been contacted.',
    photos: [],
    reportedAt: '2026-06-04T06:50:00Z',
    reportedBy: { id: 'u_021', name: 'Emeka O.', verified: true },
    assignedOfficer: 'off_001',
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T06:50:00Z', by: 'citizen' },
      { action: 'acknowledged', timestamp: '2026-06-04T06:52:00Z', by: 'off_001' },
      { action: 'fire_service_dispatched', timestamp: '2026-06-04T06:55:00Z', by: 'off_001' },
    ],
  },
  {
    id: 'inc_003',
    category: 'civil_unrest',
    severity: 'medium',
    status: 'active',
    location: { lat: 9.0579, lng: 7.4951, address: 'Area 1, Abuja', lga: 'Abuja Municipal', state: 'FCT Abuja' },
    description: 'Small crowd gathering outside the Ministry of Finance protesting unpaid salaries. Peaceful but growing.',
    photos: [],
    reportedAt: '2026-06-04T08:05:00Z',
    reportedBy: { id: 'u_044', name: 'Fatima A.', verified: true },
    assignedOfficer: null,
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T08:05:00Z', by: 'citizen' },
    ],
  },
  {
    id: 'inc_004',
    category: 'accident',
    severity: 'medium',
    status: 'resolved',
    location: { lat: 6.4550, lng: 3.3841, address: 'Third Mainland Bridge, Lagos', lga: 'Lagos Island', state: 'Lagos' },
    description: 'Two-vehicle collision causing traffic backup. LASTMA and ambulance have been dispatched. One casualty.',
    photos: [],
    reportedAt: '2026-06-04T05:30:00Z',
    reportedBy: { id: 'u_007', name: 'Chukwuma B.', verified: false },
    assignedOfficer: 'off_002',
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T05:30:00Z', by: 'citizen' },
      { action: 'acknowledged', timestamp: '2026-06-04T05:33:00Z', by: 'off_002' },
      { action: 'resolved', timestamp: '2026-06-04T06:45:00Z', by: 'off_002' },
    ],
  },
  {
    id: 'inc_005',
    category: 'kidnapping',
    severity: 'critical',
    status: 'active',
    location: { lat: 4.8147, lng: 7.0498, address: 'Rumuola, Port Harcourt', lga: 'Port Harcourt', state: 'Rivers' },
    description: 'Attempted abduction of a businessman reported by witnesses near GRA junction. Two suspects fled in a Sienna.',
    photos: [],
    reportedAt: '2026-06-04T07:45:00Z',
    reportedBy: { id: 'u_062', name: 'Tunde K.', verified: true },
    assignedOfficer: 'off_004',
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T07:45:00Z', by: 'citizen' },
      { action: 'acknowledged', timestamp: '2026-06-04T07:47:00Z', by: 'off_004' },
      { action: 'alert_issued', timestamp: '2026-06-04T07:50:00Z', by: 'soc_admin' },
    ],
  },
  {
    id: 'inc_006',
    category: 'civil_unrest',
    severity: 'high',
    status: 'responding',
    location: { lat: 12.0022, lng: 8.5920, address: 'Sabon Gari, Kano', lga: 'Kano Municipal', state: 'Kano' },
    description: 'Communal clash between two groups reported at the market. Police patrol dispatched. 3 injuries reported.',
    photos: [],
    reportedAt: '2026-06-04T06:20:00Z',
    reportedBy: { id: 'u_103', name: 'Musa A.', verified: true },
    assignedOfficer: 'off_005',
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T06:20:00Z', by: 'citizen' },
      { action: 'patrol_dispatched', timestamp: '2026-06-04T06:28:00Z', by: 'off_005' },
    ],
  },
  {
    id: 'inc_007',
    category: 'armed_robbery',
    severity: 'low',
    status: 'false_alarm',
    location: { lat: 6.3650, lng: 3.3148, address: 'Badagry Expressway, Lagos', lga: 'Badagry', state: 'Lagos' },
    description: 'Report of suspicious vehicle later confirmed to be a breakdown. False alarm confirmed by patrol.',
    photos: [],
    reportedAt: '2026-06-04T04:00:00Z',
    reportedBy: { id: 'u_anon', name: 'Anonymous', verified: false },
    assignedOfficer: 'off_002',
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T04:00:00Z', by: 'citizen' },
      { action: 'false_alarm_confirmed', timestamp: '2026-06-04T04:22:00Z', by: 'off_002' },
    ],
  },
  {
    id: 'inc_008',
    category: 'other',
    severity: 'low',
    status: 'active',
    location: { lat: 7.3775, lng: 3.9470, address: 'Ring Road, Ibadan', lga: 'Ibadan North', state: 'Oyo' },
    description: 'Power transformer explosion causing fire. PHCN and fire service notified. Road partially blocked.',
    photos: [],
    reportedAt: '2026-06-04T08:30:00Z',
    reportedBy: { id: 'u_201', name: 'Adeola F.', verified: false },
    assignedOfficer: null,
    responseTimeline: [
      { action: 'reported', timestamp: '2026-06-04T08:30:00Z', by: 'citizen' },
    ],
  },
];

// ids match soc-service's real IncidentCategory enum, lowercased by
// useSecurityRepo's normalizeIncident (THEFT/ASSAULT/FIRE/FLOOD/ACCIDENT/
// MEDICAL_EMERGENCY/CIVIL_UNREST/KIDNAPPING/TERRORISM/BANDITRY/
// COMMUNAL_CLASH/OTHER) -- not a placeholder taxonomy.
export const INCIDENT_CATEGORIES = [
  { id: 'theft', label: 'Theft / Robbery', icon: '🔫', color: '#dc2626', bg: '#fee2e2' },
  { id: 'assault', label: 'Assault', icon: '🥊', color: '#b91c1c', bg: '#fee2e2' },
  { id: 'kidnapping', label: 'Kidnapping', icon: '🚨', color: '#7c3aed', bg: '#ede9fe' },
  { id: 'terrorism', label: 'Terrorism / Siege', icon: '💥', color: '#7f1d1d', bg: '#fee2e2' },
  { id: 'banditry', label: 'Banditry', icon: '⚔️', color: '#b45309', bg: '#fef3c7' },
  { id: 'communal_clash', label: 'Communal Clash', icon: '👥', color: '#a16207', bg: '#fef9c3' },
  { id: 'fire', label: 'Fire Outbreak', icon: '🔥', color: '#ea580c', bg: '#fff7ed' },
  { id: 'flood', label: 'Flood', icon: '🌊', color: '#0284c7', bg: '#e0f2fe' },
  { id: 'accident', label: 'Road Accident', icon: '🚗', color: '#2563eb', bg: '#dbeafe' },
  { id: 'medical_emergency', label: 'Medical Emergency', icon: '🚑', color: '#16a34a', bg: '#dcfce7' },
  { id: 'civil_unrest', label: 'Civil Unrest', icon: '📢', color: '#d97706', bg: '#fef3c7' },
  { id: 'other', label: 'Other', icon: '⚠️', color: '#6b7280', bg: '#f3f4f6' },
];

export const SEVERITY_CONFIG = {
  low: { label: 'Low', color: '#16a34a', bg: '#dcfce7', ring: '#bbf7d0', size: 8 },
  medium: { label: 'Medium', color: '#d97706', bg: '#fef3c7', ring: '#fde68a', size: 10 },
  high: { label: 'High', color: '#dc2626', bg: '#fee2e2', ring: '#fca5a5', size: 13 },
  critical: { label: 'Critical', color: '#7f1d1d', bg: '#fee2e2', ring: '#ef4444', size: 16, pulse: true },
};

// keys match soc-service's real IncidentStatus enum, lowercased by
// normalizeIncident (REPORTED/ACKNOWLEDGED/ASSIGNED/IN_RESPONSE/RESOLVED/
// CLOSED) -- not a placeholder taxonomy.
export const STATUS_CONFIG = {
  reported: { label: 'Reported', color: '#2563eb', bg: '#dbeafe' },
  acknowledged: { label: 'Acknowledged', color: '#d97706', bg: '#fef3c7' },
  assigned: { label: 'Assigned', color: '#7c3aed', bg: '#ede9fe' },
  in_response: { label: 'In Response', color: '#ea580c', bg: '#fff7ed' },
  resolved: { label: 'Resolved', color: '#16a34a', bg: '#dcfce7' },
  closed: { label: 'Closed', color: '#6b7280', bg: '#f3f4f6' },
};

export const SECURITY_STATS = {
  activeIncidents: 5,
  respondingIncidents: 2,
  resolvedToday: 1,
  avgResponseTime: '7 mins',
  totalReported: 8,
  criticalCount: 2,
};
