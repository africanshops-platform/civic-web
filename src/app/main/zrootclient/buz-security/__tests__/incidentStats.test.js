import { incidentStats } from '../incidentStats';

const incident = (status, severity = 'medium') => ({ status, severity });

describe('security figures', () => {
  it('counts the reports the server returned', () => {
    const list = [incident('reported'), incident('acknowledged'), incident('in_response', 'critical'), incident('resolved', 'critical')];
    expect(incidentStats(list, 4)).toEqual({ total: 4, active: 2, responding: 1, resolved: 1, critical: 1 });
  });

  it('shows zeros, not made-up numbers, when there is nothing', () => {
    expect(incidentStats([], 0)).toEqual({ total: 0, active: 0, responding: 0, resolved: 0, critical: 0 });
  });

  it('shows a dash when only part of the list was loaded', () => {
    expect(incidentStats([incident('reported')], 300)).toMatchObject({ total: 300, active: '—', resolved: '—' });
  });
});
