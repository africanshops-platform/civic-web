import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { useFxRates } from '../../hooks/useFintechApi';
import { useFinanceTheme } from '../../FinanceThemeContext';
import { F } from '../../financeUiTokens';

// FxRate.rate is stored as toAmount/fromAmount × 1_000_000 (see ledger schema).
// For a seeded NGN→USD row that means "USD per NGN" — invert to show the
// conventional "1 USD = ₦X" quote traders and users actually expect.
function invertRateToNgnPerUsd(rateRaw) {
  const rate = parseFloat(rateRaw ?? 0);
  if (!rate) return null;
  return 1_000_000 / rate;
}

export default function FxRateChip({ tokens: tokensProp }) {
  const { tokens: themeTokens } = useFinanceTheme();
  const tokens = tokensProp ?? themeTokens;
  const { data: rates, isLoading } = useFxRates();

  const pair = (rates ?? []).find(
    (r) => r?.fromCurrency === 'NGN' && r?.toCurrency === 'USD'
  );

  const ngnPerUsd = pair ? invertRateToNgnPerUsd(pair.rate) : null;
  const buyNgnPerUsd = pair?.buyRate ? invertRateToNgnPerUsd(pair.buyRate) : null;
  const sellNgnPerUsd = pair?.sellRate ? invertRateToNgnPerUsd(pair.sellRate) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
      <Typography className="uppercase tracking-widest font-semibold mb-12" style={{ fontSize: F.small, color: tokens.textMuted }}>
        Exchange Rate
      </Typography>
      <div
        className="rounded-2xl p-16"
        style={{ background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow }}
      >
        {isLoading ? (
          <Skeleton variant="text" width="70%" sx={{ height: 32 }} />
        ) : !ngnPerUsd ? (
          <div className="flex items-center gap-8">
            <FuseSvgIcon size={16} style={{ color: tokens.textMuted }}>heroicons-outline:currency-dollar</FuseSvgIcon>
            <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Rate not configured yet</Typography>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-8 mb-4">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center shrink-0"
                style={{ background: tokens.accentSoft }}
              >
                <FuseSvgIcon size={14} style={{ color: tokens.accentSolid }}>heroicons-solid:currency-dollar</FuseSvgIcon>
              </div>
              <Typography style={{ fontSize: F.body, fontWeight: 800, color: tokens.textPrimary }}>
                1 USD = ₦{ngnPerUsd.toLocaleString('en-NG', { maximumFractionDigits: 2 })}
              </Typography>
            </div>
            {(buyNgnPerUsd || sellNgnPerUsd) && (
              <div className="flex items-center gap-14 mt-8 pt-8" style={{ borderTop: `1px solid ${tokens.borderColor}` }}>
                {buyNgnPerUsd && (
                  <div>
                    <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>You buy</Typography>
                    <Typography style={{ fontSize: F.small, fontWeight: 700, color: tokens.success }}>
                      ₦{buyNgnPerUsd.toLocaleString('en-NG', { maximumFractionDigits: 2 })}
                    </Typography>
                  </div>
                )}
                {sellNgnPerUsd && (
                  <div>
                    <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>You sell</Typography>
                    <Typography style={{ fontSize: F.small, fontWeight: 700, color: tokens.danger }}>
                      ₦{sellNgnPerUsd.toLocaleString('en-NG', { maximumFractionDigits: 2 })}
                    </Typography>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
