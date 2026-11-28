/** One of the citizen's campaign contributions as the server sends it (kobo amounts, upper-case status). */
export function normalizeContribution(c) {
  return {
    ...c,
    amountNaira: Number(c.amountKobo ?? 0) / 100,
    campaignTitle: c.campaignTitle ?? c.campaign?.title ?? 'Civic campaign',
    lga: c.campaign?.lga ?? null,
    status: String(c.status ?? '').toLowerCase(),
  };
}

/** Totals over the loaded rows. Only completed contributions count as given; partial lists get no totals. */
export function contributionStats(rows = [], total = rows.length) {
  const all = Math.max(total || 0, rows.length);
  if (rows.length < all) return { count: all, complete: false };
  const given = rows.filter((c) => c.status === 'completed');
  return {
    count: all,
    complete: true,
    givenNaira: given.reduce((sum, c) => sum + c.amountNaira, 0),
    campaigns: new Set(given.map((c) => c.campaignId)).size,
    lgas: new Set(given.map((c) => c.lga).filter(Boolean)).size,
  };
}
