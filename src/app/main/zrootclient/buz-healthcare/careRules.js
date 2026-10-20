/** Helpers for the My care page (civic-70/71). Money arrives as kobo strings and is shown as naira. */
export const naira = (kobo) => `₦${(Number(kobo ?? 0) / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
export const dateOf = (v) => (v ? new Date(v).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

export const INVOICE_WORDS = { OPEN: 'Not paid yet', PART_PAID: 'Part paid', PAID: 'Paid', WAIVED: 'Waived by the facility' };
export const WALLET_PAYMENT_WORDS = { PENDING: 'Being confirmed', HELD: 'Paid, held until the visit is closed', SETTLED: 'Paid to the clinic', REFUNDED: 'Returned to your health wallet' };
export const DOSE_WORDS = { GIVEN: 'Given', DUE: 'Due now', OVERDUE: 'Overdue', UPCOMING: 'Coming up' };
export const ANC_WORDS = { DONE: 'Done', DUE: 'Due', MISSED: 'Missed', UPCOMING: 'Coming up' };
export const CONDITION_WORDS = { HYPERTENSION: 'High blood pressure', DIABETES: 'Diabetes', ASTHMA: 'Asthma', EPILEPSY: 'Epilepsy', OTHER: 'Long-term condition' };

/** What the next thing to do is, for the top of the page: overdue doses, a due antenatal visit, a review this week, or nothing. */
export function nextSteps({ imm, pregnancy, plans }) {
  const out = [];
  const overdue = (imm?.doses ?? []).filter((d) => d.state === 'OVERDUE').length;
  const due = (imm?.doses ?? []).filter((d) => d.state === 'DUE').length;
  if (overdue) out.push(`${overdue} vaccine dose${overdue === 1 ? ' is' : 's are'} overdue. Take the child to a clinic.`);
  else if (due) out.push(`${due} vaccine dose${due === 1 ? ' is' : 's are'} due now.`);
  const visit = (pregnancy?.schedule ?? []).find((s) => s.state === 'DUE' || s.state === 'MISSED');
  if (visit) out.push(visit.state === 'MISSED' ? `Antenatal visit ${visit.contact} (week ${visit.weeks}) was missed. Book the next one.` : `Antenatal visit ${visit.contact} (week ${visit.weeks}) is due.`);
  for (const p of plans ?? []) {
    const days = Math.ceil((new Date(p.nextReviewAt).getTime() - Date.now()) / 86_400_000);
    if (days < 0) out.push(`${CONDITION_WORDS[p.condition] ?? p.condition}: your review is ${-days} day${days === -1 ? '' : 's'} overdue.`);
    else if (days <= 7) out.push(`${CONDITION_WORDS[p.condition] ?? p.condition}: your review is this week.`);
  }
  return out;
}

/** A reading from the form: whole numbers for blood pressure and pulse, a decimal for sugar; empty fields left out. */
export function readingFrom(form) {
  const out = {};
  for (const k of ['systolic', 'diastolic', 'pulse']) if (String(form[k] ?? '').trim()) out[k] = Math.round(Number(form[k]));
  if (String(form.glucoseMmol ?? '').trim()) out.glucoseMmol = Number(form.glucoseMmol);
  return out;
}

export const readingReady = (r) => Object.values(r).some((v) => Number.isFinite(v)) && (r.systolic == null) === (r.diastolic == null);

/** Seconds left on a health ID code (never negative). */
export const secondsLeft = (expiresAt, now = Date.now()) => Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));

/** Naira text ("1,500" or "₦1500.50") to whole kobo, or null when it is not a positive amount with at most two decimals. */
export function nairaToKobo(text) {
  const t = String(text ?? '').replace(/[₦,\s]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  const [whole, frac = ''] = t.split('.');
  const kobo = Number(whole) * 100 + Number(`${frac}00`.slice(0, 2));
  return kobo > 0 ? kobo : null;
}

/** Whether a payment from the health wallet can be started, and if not, what to tell the person. */
export function walletPayState({ paymentsReady, open, balanceKobo, wantKobo }) {
  if (paymentsReady === false) return { ok: false, reason: 'Payments are temporarily unavailable. Please try again in a moment.' };
  if (!open) return { ok: false, reason: 'Open your health wallet first.' };
  if (!(wantKobo > 0)) return { ok: false, reason: 'Enter an amount.' };
  if (Number(balanceKobo ?? 0) < wantKobo) return { ok: false, reason: `Your health wallet has ${naira(balanceKobo)}. Add money first.` };
  return { ok: true, reason: null };
}
