export const naira = (kobo) => `₦${(Number(kobo || 0) / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

/** How far a goal is to its target, 0-100, or null when no target was set. */
export function pctOfTarget(raisedKobo, targetKobo) {
  if (!targetKobo || Number(targetKobo) <= 0) return null;
  return Math.min(100, Math.round((Number(raisedKobo || 0) / Number(targetKobo)) * 100));
}

/** Goals grouped by LGA, newest places first by name; a search text matches the LGA, state or goal title. */
export function filterGoals(goals, search) {
  const q = (search || '').trim().toLowerCase();
  if (!q) return goals;
  return goals.filter((g) => [g.lga, g.state, g.goal?.title].some((t) => (t || '').toLowerCase().includes(q)));
}

export const MIN_GIFT_NAIRA = 100;
