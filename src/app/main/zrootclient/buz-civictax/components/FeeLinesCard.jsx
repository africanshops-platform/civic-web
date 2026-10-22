const naira = (kobo) => `₦${(Number(kobo) / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
const monthName = (m) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const LINE_LABEL = { SELF: 'You', SPOUSE: 'Spouse cover', CHILD: null, FLAT: null };

/**
 * The household fee for one month (civic-57 CP-6): the month's final fee, the amount built up so far day by day, and the
 * lines it is made of. A covered spouse sees that they owe nothing and what their spouse pays to cover them.
 * Shows nothing when the household fee is not in use for the month.
 */
export default function FeeLinesCard({ data }) {
  if (!data?.active) return null;

  if (data.role === 'COVERED') {
    return (
      <div
        data-testid="fee-lines-covered"
        style={{ marginBottom: 'clamp(16px, 2.4vw, 24px)', padding: 'clamp(12px, 1.8vw, 18px)', borderRadius: 16, background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1.5px solid #93c5fd' }}
      >
        <div style={{ fontWeight: 800, color: '#1e3a8a' }}>Your couple subscription for {monthName(data.month)}</div>
        <div style={{ color: '#1d4ed8', marginTop: 2 }}>
          Your spouse pays for both of you, so you owe nothing this month.
          {data.coveredBy && (
            <> Your spouse's cover for you comes to <b>{naira(data.coveredBy.coverKobo)}</b> for {monthName(data.month)}{data.coveredBy.fromDay > 1 ? `, from day ${data.coveredBy.fromDay}` : ''}.</>
          )}
        </div>
      </div>
    );
  }

  if (!data.lines?.length) return null;
  const pct = data.monthKobo > 0 ? Math.min(100, Math.round((data.accruedKobo / data.monthKobo) * 100)) : 0;
  return (
    <div
      data-testid="fee-lines"
      style={{ marginBottom: 'clamp(16px, 2.4vw, 24px)', padding: 'clamp(14px, 2vw, 20px)', borderRadius: 16, background: '#fff', border: '1.5px solid #fed7aa' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 800, color: '#9a3412' }}>Your fee for {monthName(data.month)}</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#ea580c' }} data-testid="fee-month-total">{naira(data.monthKobo)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#78716c' }}>Built up so far</div>
          <div style={{ fontSize: 22, fontWeight: 800 }} data-testid="fee-accrued">{naira(data.accruedKobo)}</div>
          <div style={{ color: '#78716c', fontSize: 13 }}>{data.dayOfMonth} of {data.days} days</div>
        </div>
      </div>
      <div style={{ height: 10, borderRadius: 6, background: '#ffedd5', marginTop: 10, overflow: 'hidden' }} aria-label={`${pct}% of the month's fee built up`}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#f97316' }} />
      </div>
      <div style={{ marginTop: 10 }}>
        {data.lines.map((l, i) => (
          <div key={`${l.kind}-${i}`} data-testid="fee-line" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: i ? '1px solid #f5f5f4' : 'none' }}>
            <span>{LINE_LABEL[l.kind] ?? l.subjectLabel}</span>
            <span>{naira(l.accruedKobo)} of {naira(l.monthKobo)}</span>
          </div>
        ))}
      </div>
      <div style={{ color: '#78716c', fontSize: 12, marginTop: 8 }}>
        Each day adds a share of the month's fee. You still pay the month's bill as one amount; the build-up only shows how much of it has accrued.
      </div>
    </div>
  );
}
