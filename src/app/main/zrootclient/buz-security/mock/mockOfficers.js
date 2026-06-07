export const mockOfficers = [
  {
    id: 'off_001', name: 'Insp. Adeyemi Bola', badge: 'LG-1042',
    zone: { state: 'Lagos', lga: 'Eti-Osa' }, status: 'on_scene',
    currentIncident: 'inc_002', phone: '080-XXX-XXXX',
  },
  {
    id: 'off_002', name: 'Sgt. Chukwudi Obi', badge: 'LG-0887',
    zone: { state: 'Lagos', lga: 'Lagos Island' }, status: 'available',
    currentIncident: null, phone: '080-XXX-XXXX',
  },
  {
    id: 'off_003', name: 'Cpl. Ngozi Eze', badge: 'LG-1155',
    zone: { state: 'Lagos', lga: 'Eti-Osa' }, status: 'responding',
    currentIncident: 'inc_001', phone: '080-XXX-XXXX',
  },
  {
    id: 'off_004', name: 'Insp. Yakubu Sani', badge: 'RV-0341',
    zone: { state: 'Rivers', lga: 'Port Harcourt' }, status: 'on_scene',
    currentIncident: 'inc_005', phone: '080-XXX-XXXX',
  },
  {
    id: 'off_005', name: 'Sgt. Halima Musa', badge: 'KN-0562',
    zone: { state: 'Kano', lga: 'Kano Municipal' }, status: 'responding',
    currentIncident: 'inc_006', phone: '080-XXX-XXXX',
  },
];

export const OFFICER_STATUS_CONFIG = {
  available: { label: 'Available', color: '#16a34a', bg: '#dcfce7' },
  responding: { label: 'Responding', color: '#d97706', bg: '#fef3c7' },
  on_scene: { label: 'On Scene', color: '#dc2626', bg: '#fee2e2' },
  off_duty: { label: 'Off Duty', color: '#6b7280', bg: '#f3f4f6' },
};
