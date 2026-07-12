import { useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useFinanceTheme } from '../../FinanceThemeContext';
import { F } from '../../financeUiTokens';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Buckets transactions into the trailing 6 calendar months (oldest first) and
// sums CREDIT vs DEBIT kobo per month — purely client-side, no new backend
// endpoint needed since useTransactionHistory already returns direction+amount+createdAt.
function bucketByMonth(transactions) {
  const now = new Date();
  const buckets = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()], inKobo: 0, outKobo: 0 });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));

  for (const tx of transactions ?? []) {
    const created = tx?.createdAt ? new Date(tx.createdAt) : null;
    if (!created) continue;
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    const bucket = byKey.get(key);
    if (!bucket) continue;
    const amount = Math.abs(parseFloat(tx?.amount ?? 0));
    if (tx?.direction === 'CREDIT') bucket.inKobo += amount;
    else bucket.outKobo += amount;
  }
  return buckets;
}

export default function CashflowChart({ transactions, isLoading }) {
  const { tokens } = useFinanceTheme();
  const [hoverIdx, setHoverIdx] = useState(null);
  const buckets = useMemo(() => bucketByMonth(transactions), [transactions]);
  const maxKobo = useMemo(
    () => Math.max(1, ...buckets.map((b) => Math.max(b.inKobo, b.outKobo))),
    [buckets]
  );

  const chartH = 140;

  return (
    <div>
      <div className="flex items-center justify-between mb-14">
        <Typography className="uppercase tracking-widest font-semibold" style={{ fontSize: F.small, color: tokens.textMuted }}>
          Cashflow · Last 6 Months
        </Typography>
        <div className="flex items-center gap-14">
          <span className="flex items-center gap-6">
            <span className="w-8 h-8 rounded-full" style={{ background: tokens.success }} />
            <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>In</Typography>
          </span>
          <span className="flex items-center gap-6">
            <span className="w-8 h-8 rounded-full" style={{ background: tokens.danger }} />
            <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Out</Typography>
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-end gap-16" style={{ height: chartH }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 rounded-lg animate-pulse" style={{ height: `${40 + (i % 3) * 20}%`, background: tokens.borderColor }} />
          ))}
        </div>
      ) : (
        <div className="flex items-end gap-16" style={{ height: chartH }} onMouseLeave={() => setHoverIdx(null)}>
          {buckets.map((b, i) => {
            const inH = Math.max(3, (b.inKobo / maxKobo) * chartH);
            const outH = Math.max(3, (b.outKobo / maxKobo) * chartH);
            const active = hoverIdx === i;
            return (
              <div
                key={b.key}
                className="flex-1 flex flex-col items-center gap-8 cursor-default"
                onMouseEnter={() => setHoverIdx(i)}
              >
                <div className="relative flex items-end gap-3" style={{ height: chartH, width: '100%' }}>
                  {active && (b.inKobo > 0 || b.outKobo > 0) && (
                    <div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg px-8 py-4 whitespace-nowrap z-10"
                      style={{ background: tokens.heroBg, transform: 'translate(-50%, -100%)' }}
                    >
                      <Typography style={{ fontSize: F.small, color: tokens.heroText, fontWeight: 600 }}>
                        +₦{(b.inKobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 })} / -₦{(b.outKobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 })}
                      </Typography>
                    </div>
                  )}
                  <motion.div
                    className="flex-1 rounded-t-md"
                    style={{ background: tokens.success, opacity: active ? 1 : 0.85 }}
                    initial={{ height: 0 }}
                    animate={{ height: inH }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  />
                  <motion.div
                    className="flex-1 rounded-t-md"
                    style={{ background: tokens.danger, opacity: active ? 1 : 0.85 }}
                    initial={{ height: 0 }}
                    animate={{ height: outH }}
                    transition={{ duration: 0.5, delay: i * 0.05 + 0.03 }}
                  />
                </div>
                <Typography style={{ fontSize: F.small, color: tokens.textMuted, fontWeight: active ? 700 : 500 }}>
                  {b.label}
                </Typography>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
