const naira = (kobo) => `₦${(Number(kobo) / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
const longDate = (iso) =>
  new Date(`${String(iso).slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Tells a citizen about a scheduled change to the monthly subscription rate (civic-18). Renders nothing when none is scheduled. */
export default function RateChangeBanner({ notice }) {
  const next = notice?.scheduled;
  if (!next) return null;
  return (
    <div
      data-testid="rate-change-banner"
      style={{ marginBottom: 'clamp(16px, 2.4vw, 24px)', padding: 'clamp(12px, 1.8vw, 18px)', borderRadius: 16, background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1.5px solid #fcd34d' }}
    >
      <div style={{ fontWeight: 800, color: '#92400e' }}>The monthly rate is changing</div>
      <div style={{ color: '#a16207', marginTop: 2 }}>
        From <b>{longDate(next.effectiveFrom)}</b> the monthly subscription is <b>{naira(next.amountKobo)}</b> (now {naira(notice.currentAmountKobo)}).
        Months before that date, and months you have already paid, keep their rate.
      </div>
    </div>
  );
}
