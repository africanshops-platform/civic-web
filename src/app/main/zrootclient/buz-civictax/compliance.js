/**
 * Months paid this year, counted by MONTH: a month can carry more than one bill (a monthly one and one added by an
 * officer), so counting bills could show 14 of 12. A month counts as paid only when all of its bills are settled.
 */
export function yearCompliance(obligations = [], year = new Date().getFullYear()) {
  const months = new Map();
  obligations
    .filter((o) => String(o.monthKey).startsWith(`${year}-`))
    .forEach((o) => {
      const m = months.get(o.monthKey) ?? { paid: true, due: false };
      months.set(o.monthKey, { paid: m.paid && o.uiStatus === 'paid', due: m.due || (o.uiStatus !== 'upcoming' && !o.isFutureMonth) });
    });
  const list = [...months.values()];
  const paidMonths = list.filter((m) => m.paid).length;
  const dueMonths = list.filter((m) => m.due).length;
  // The score is about months that have come due, so paying ahead cannot push it past 100.
  const duePaid = list.filter((m) => m.due && m.paid).length;
  return {
    paidMonths,
    dueMonths,
    complianceScore: dueMonths ? Math.round((duePaid / dueMonths) * 100) : 100,
    eligible: paidMonths >= 2,
  };
}
