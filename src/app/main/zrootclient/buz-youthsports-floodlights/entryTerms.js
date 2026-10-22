/** What a citizen is told about entering a tournament (civic-54): the fee, who may enter, the regional places and the ladder. */

export const naira = (kobo) => `₦${(Number(kobo) / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;

export const isPaid = (t) => Number(t?.entryFeeKobo ?? 0) > 0;

/** Plain-language lines, in the order shown. Empty when the tournament is free and open to everyone. */
export function entryTerms(t) {
  const out = [];
  if (isPaid(t)) out.push({ key: 'fee', text: `Entry fee ${naira(t.entryFeeKobo)}, paid from your wallet when you enter.` });
  const e = t?.eligibility;
  if (e?.level === 'LGA') out.push({ key: 'area', text: `Open to residents of ${t.lga ?? 'this local government'}.` });
  if (e?.level === 'STATE') out.push({ key: 'area', text: `Open to residents of ${t.state ?? 'this state'}.` });
  if (e?.quotaPerRegion) out.push({ key: 'quota', text: `Up to ${e.quotaPerRegion} places per ${e.level === 'COUNTRY' ? 'state' : 'local government'}, so every area is represented.` });
  if (t?.feedsInto?.topK) out.push({ key: 'ladder', text: `The top ${t.feedsInto.topK} move up to the next level automatically, free of any entry fee.` });
  return out;
}

/** Whether the pay button may be pressed, and why not (payments readiness comes from the gateway). */
export function payState({ paymentsReady, hasAccount, balanceNaira, feeKobo }) {
  if (paymentsReady === false) return { ok: false, reason: 'Payments are temporarily unavailable. Please try again in a moment.' };
  if (!hasAccount) return { ok: false, reason: 'Set up your wallet first to pay an entry fee.' };
  if (typeof balanceNaira === 'number' && balanceNaira * 100 < feeKobo) return { ok: false, reason: `Your wallet has ${naira(balanceNaira * 100)}; add money to enter.` };
  return { ok: true, reason: null };
}
