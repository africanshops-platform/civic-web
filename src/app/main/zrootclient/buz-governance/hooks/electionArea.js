// Pure helpers for "my area" on the governance screens. The area rule is the same one the gateway applies when a citizen votes
// (voter-eligibility.ts): national votes match the country, community and local-area votes the LGA and state, state votes the state.

const norm = (v) => String(v ?? '').trim().toLowerCase();

/** Is this election open to someone who lives at `dwelling` ({ country, state, lga } as names)? No dwelling means "unknown", never a match. */
export function electionInArea(election, dwelling) {
  if (!dwelling) return false;
  const j = election.jurisdiction ?? {};
  if (election.level === 'FEDERAL') return !j.country || norm(dwelling.country) === norm(j.country);
  if ((election.level === 'COMMUNITY' || election.level === 'LOCAL_GOVT') && j.lga) {
    return norm(dwelling.lga) === norm(j.lga) && norm(dwelling.state) === norm(j.state);
  }
  return norm(dwelling.state) === norm(j.state);
}

const toRad = (d) => (d * Math.PI) / 180;

/** Great-circle distance in km between two { latitude, longitude } points. */
export function distanceKm(a, b) {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** The voting location closest to `point`, with its distance, or null when there are none. */
export function nearestLocation(locations, point) {
  return (locations ?? [])
    .filter((l) => typeof l.latitude === 'number' && typeof l.longitude === 'number')
    .map((l) => ({ location: l, km: distanceKm(point, l) }))
    .reduce((best, c) => (!best || c.km < best.km ? c : best), null);
}

/** Filters kept in the address bar so a filtered list can be shared and survives a refresh. */
export const FILTER_KEYS = ['q', 'level', 'status', 'area'];

export function readFilters(searchParams) {
  return {
    search: searchParams.get('q') ?? '',
    level: searchParams.get('level') ?? '',
    status: searchParams.get('status') ?? '',
    area: searchParams.get('area') === '1',
  };
}

export function writeFilters(searchParams, next) {
  const out = new URLSearchParams(searchParams);
  const set = (key, value) => { if (value) out.set(key, value); else out.delete(key); };
  set('q', next.search);
  set('level', next.level);
  set('status', next.status);
  set('area', next.area ? '1' : '');
  return out;
}
