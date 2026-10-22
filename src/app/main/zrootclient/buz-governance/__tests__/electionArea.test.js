import { electionInArea, nearestLocation, distanceKm, readFilters, writeFilters } from '../hooks/electionArea';

const abuja = { country: 'Nigeria', state: 'FCT', lga: 'Abuja' };
const el = (level, jurisdiction) => ({ level, jurisdiction: { country: 'Nigeria', state: 'FCT', lga: null, ...jurisdiction } });

describe('electionInArea', () => {
  it('matches a community or local vote on LGA and state, ignoring case and spacing', () => {
    expect(electionInArea(el('COMMUNITY', { lga: ' abuja ' }), abuja)).toBe(true);
    expect(electionInArea(el('LOCAL_GOVT', { lga: 'Gwagwalada' }), abuja)).toBe(false);
    expect(electionInArea(el('COMMUNITY', { lga: 'Abuja', state: 'Kano' }), abuja)).toBe(false);
  });
  it('matches a state vote on the state and a national vote on the country', () => {
    expect(electionInArea(el('STATE', {}), abuja)).toBe(true);
    expect(electionInArea(el('STATE', { state: 'Kano' }), abuja)).toBe(false);
    expect(electionInArea(el('FEDERAL', {}), abuja)).toBe(true);
    expect(electionInArea(el('FEDERAL', { country: 'Ghana' }), abuja)).toBe(false);
  });
  it('never matches when the citizen has not set where they live', () => {
    expect(electionInArea(el('FEDERAL', {}), null)).toBe(false);
  });
});

describe('nearestLocation', () => {
  const near = { id: 'a', latitude: 9.0765, longitude: 7.3986 };
  const far = { id: 'b', latitude: 6.5244, longitude: 3.3792 };
  it('picks the closest location and reports the distance', () => {
    const r = nearestLocation([far, near], { latitude: 9.08, longitude: 7.4 });
    expect(r.location.id).toBe('a');
    expect(r.km).toBeLessThan(1);
  });
  it('is null with no locations and skips ones without coordinates', () => {
    expect(nearestLocation([], { latitude: 1, longitude: 1 })).toBeNull();
    expect(nearestLocation([{ id: 'x' }], { latitude: 1, longitude: 1 })).toBeNull();
  });
  it('measures Abuja to Lagos at roughly 530 km', () => {
    expect(Math.round(distanceKm(near, far) / 10) * 10).toBeGreaterThanOrEqual(520);
  });
});

describe('filters in the address bar', () => {
  it('round-trips and drops empty values', () => {
    const params = writeFilters(new URLSearchParams('page=2'), { search: 'ward', level: 'STATE', status: '', area: true });
    expect(params.toString()).toBe('page=2&q=ward&level=STATE&area=1');
    expect(readFilters(params)).toEqual({ search: 'ward', level: 'STATE', status: '', area: true });
    expect(writeFilters(params, { search: '', level: '', status: '', area: false }).toString()).toBe('page=2');
  });
});
