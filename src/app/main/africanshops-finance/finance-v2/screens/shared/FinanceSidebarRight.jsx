import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { formatKobo } from '../../hooks/useFintechApi';
import { useFinanceTheme } from '../../FinanceThemeContext';
import FxRateChip from './FxRateChip';

const F = {
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  body:        'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:       'clamp(1.44rem, 2vw,   1.76rem)',
  small:       'clamp(1.3rem,  1.8vw, 1.56rem)',
  balanceLg:   'clamp(2rem,    3.2vw, 2.8rem)',
};

function StatRow({ label, value, color, isLoading, tokens }) {
  return (
    <div className="flex items-center justify-between py-8 border-b" style={{ borderColor: tokens.borderColor }}>
      <Typography style={{ fontSize: F.small, color: tokens.textSecondary }}>{label}</Typography>
      {isLoading ? (
        <Skeleton variant="text" width={80} />
      ) : (
        <Typography style={{ fontSize: F.small, fontWeight: 700, color }}>{value}</Typography>
      )}
    </div>
  );
}

function TxRow({ tx, tokens }) {
  const isCredit = tx?.direction === 'CREDIT' || tx?.type === 'CREDIT';
  const dotColor = isCredit ? tokens.success : tokens.danger;
  const dotBg = isCredit ? tokens.successBg : tokens.dangerBg;
  return (
    <div className="flex items-center gap-10 py-10">
      <div
        className="w-36 h-36 rounded-full flex items-center justify-center shrink-0"
        style={{ background: dotBg }}
      >
        <FuseSvgIcon size={16} style={{ color: dotColor }}>
          {isCredit ? 'heroicons-solid:arrow-down' : 'heroicons-solid:arrow-up'}
        </FuseSvgIcon>
      </div>
      <div className="flex-1 min-w-0">
        <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary }} className="truncate">
          {tx?.narration ?? tx?.description ?? 'Transaction'}
        </Typography>
        <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>
          {tx?.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '—'}
        </Typography>
      </div>
      <Typography style={{ fontSize: F.small, fontWeight: 700, color: dotColor, whiteSpace: 'nowrap' }}>
        {isCredit ? '+' : '-'}{formatKobo(tx?.amount ?? tx?.amountKobo)}
      </Typography>
    </div>
  );
}

export default function FinanceSidebarRight({ balance, balanceLoading, recentTx, account }) {
  const { tokens } = useFinanceTheme();
  const flatCard = {
    background: tokens.cardBg,
    border: `1px solid ${tokens.cardBorder}`,
    boxShadow: tokens.cardShadow,
  };
  const avail = parseFloat(balance?.availableBalance ?? 0) / 100;
  const pending = parseFloat(balance?.pendingBalance ?? 0) / 100;
  const reserved = parseFloat(balance?.reservedBalance ?? 0) / 100;

  return (
    <div
      // flex-1, not h-full — see FinanceSidebarLeft.jsx for why percentage
      // height never resolves against .FusePageSimple-sidebarContent.
      className="flex flex-col flex-1 py-24 px-16 gap-20"
      style={{ background: tokens.sidebarBg, borderLeft: `1px solid ${tokens.sidebarBorder}` }}
    >
      {/* Balance Summary */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Typography
          className="uppercase tracking-widest font-semibold mb-12"
          style={{ fontSize: F.small, color: tokens.textMuted }}
        >
          Balance
        </Typography>
        <div className="rounded-2xl p-16" style={flatCard}>
          {balanceLoading ? (
            <Skeleton variant="text" width="70%" sx={{ height: 36 }} />
          ) : (
            <Typography style={{ fontSize: F.balanceLg, fontWeight: 800, color: tokens.textPrimary, marginBottom: 4 }}>
              ₦{avail.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </Typography>
          )}
          <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginBottom: 12 }}>
            Available Balance · NGN
          </Typography>

          <StatRow label="Pending"  value={`₦${pending.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}  color={tokens.warning} isLoading={balanceLoading} tokens={tokens} />
          <StatRow label="Reserved" value={`₦${reserved.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`} color={tokens.info} isLoading={balanceLoading} tokens={tokens} />

          {balance?.isFrozen && (
            <div className="mt-10 flex items-center gap-8 rounded-lg p-8" style={{ background: tokens.dangerBg, border: `1px solid ${tokens.danger}33` }}>
              <FuseSvgIcon size={14} style={{ color: tokens.danger }}>heroicons-solid:lock-closed</FuseSvgIcon>
              <Typography style={{ fontSize: F.small, color: tokens.danger }}>Account Frozen</Typography>
            </div>
          )}
        </div>
      </motion.div>

      {/* Account Info */}
      {account && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
          <Typography
            className="uppercase tracking-widest font-semibold mb-12"
            style={{ fontSize: F.small, color: tokens.textMuted }}
          >
            Account
          </Typography>
          <div className="rounded-2xl p-16" style={flatCard}>
            <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Account Number</Typography>
            <Typography style={{ fontSize: F.body, fontWeight: 700, color: tokens.textPrimary, letterSpacing: '0.1em', marginTop: 2, marginBottom: 10 }}>
              {account?.accountNumber ?? '—'}
            </Typography>
            <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Account Name</Typography>
            <Typography style={{ fontSize: F.label, fontWeight: 600, color: tokens.textPrimary, marginTop: 2 }}>
              {account?.accountName ?? '—'}
            </Typography>
          </div>
        </motion.div>
      )}

      {/* Exchange Rate */}
      <FxRateChip tokens={tokens} />

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="flex-1">
        <Typography
          className="uppercase tracking-widest font-semibold mb-12"
          style={{ fontSize: F.small, color: tokens.textMuted }}
        >
          Recent
        </Typography>
        <div className="rounded-2xl px-16 py-8" style={flatCard}>
          {!recentTx || recentTx.length === 0 ? (
            <Typography style={{ fontSize: F.small, color: tokens.textMuted, padding: '16px 0', textAlign: 'center' }}>
              No recent transactions
            </Typography>
          ) : (
            recentTx.slice(0, 5).map((tx, i) => <TxRow key={tx?.id ?? i} tx={tx} tokens={tokens} />)
          )}
        </div>
      </motion.div>

      {/* Support */}
      <div className="rounded-xl p-12" style={{ background: tokens.accentSoft, border: `1px solid ${tokens.accentSolid}33` }}>
        <div className="flex items-center gap-8 mb-4">
          <FuseSvgIcon size={16} style={{ color: tokens.accentSolid }}>heroicons-outline:chat-bubble-left-ellipsis</FuseSvgIcon>
          <Typography style={{ fontSize: F.label, fontWeight: 600, color: tokens.textPrimary }}>Need help?</Typography>
        </div>
        <Typography style={{ fontSize: F.small, color: tokens.textMuted, lineHeight: 1.5 }}>
          Contact support for any issues with your account.
        </Typography>
      </div>
    </div>
  );
}
