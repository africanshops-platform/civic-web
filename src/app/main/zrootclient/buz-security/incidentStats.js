/**
 * Security figures worked out from the reports the server returned. There is no response-time data, so none is shown.
 * When only part of the list was loaded, the counts that need the whole list show a dash.
 */
const OPEN_NEW = ['reported', 'acknowledged'];
const OPEN_RESPONDING = ['assigned', 'in_response'];

export const isOpenIncident = (i) => OPEN_NEW.includes(i.status) || OPEN_RESPONDING.includes(i.status);

export function incidentStats(incidents = [], total = incidents.length) {
  const all = Math.max(total || 0, incidents.length);
  const complete = incidents.length >= all;
  const count = (test) => (complete ? incidents.filter(test).length : '—');
  return {
    total: all,
    active: count((i) => OPEN_NEW.includes(i.status)),
    responding: count((i) => OPEN_RESPONDING.includes(i.status)),
    resolved: count((i) => i.status === 'resolved' || i.status === 'closed'),
    critical: count((i) => i.severity === 'critical' && isOpenIncident(i)),
  };
}
