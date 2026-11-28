/**
 * Figures for the public civic landing page, worked out from the campaigns the server returned.
 * Nothing is shown that cannot be worked out: totals are left out when only part of the list was loaded.
 */
export function landingStats(campaigns = [], total = 0) {
  if (!campaigns.length) return [];
  const count = Math.max(total, campaigns.length);
  if (count > campaigns.length) return [{ emoji: '📋', value: count.toLocaleString(), label: 'Campaigns' }];
  const raised = campaigns.reduce((sum, c) => sum + (Number(c.raisedAmount) || 0), 0);
  return [
    { emoji: '💰', value: `₦${raised.toLocaleString('en-NG', { maximumFractionDigits: 2 })}`, label: 'Raised so far' },
    { emoji: '📋', value: count.toLocaleString(), label: 'Campaigns' },
    { emoji: '🔥', value: campaigns.filter((c) => c.status === 'active').length.toLocaleString(), label: 'Active now' },
    { emoji: '🏆', value: campaigns.filter((c) => c.status === 'completed').length.toLocaleString(), label: 'Completed' },
  ];
}
