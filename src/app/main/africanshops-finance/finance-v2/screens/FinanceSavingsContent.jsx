import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { useSavingsBalance, useOpenSavings, formatNaira } from '../hooks/useFintechApi';
import { useFinanceTheme } from '../FinanceThemeContext';

const F = {
  pageTitle:   'clamp(2.8rem,  4.5vw, 4rem)',
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  body:        'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:       'clamp(1.44rem, 2vw,   1.76rem)',
  small:       'clamp(1.3rem,  1.8vw, 1.56rem)',
  balanceLg:   'clamp(2.4rem,  4vw,   3.5rem)',
};

const container = { show: { transition: { staggerChildren: 0.08 } } };
const item      = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

// Retail-3 (2026-07-11, revised): savings keeps GREEN as its dedicated accent
// (growth/savings is a natural fit for the semantic-positive color, same as
// the reference design's own savings-goal progress bars) rather than orange —
// orange stays reserved for brand/primary-CTA contexts elsewhere.
export default function FinanceSavingsContent() {
  const { account } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow };
  const { data: savings, isLoading, refetch } = useSavingsBalance(account?.accountNumber);
  const { mutate: openSavings, isLoading: opening, error: openError } = useOpenSavings();
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  const noSavings = !isLoading && savings === null;
  const hasSavings = !isLoading && savings != null;
  const balance  = parseFloat(savings?.balance ?? 0);
  const reserved = parseFloat(savings?.reservedBalance ?? 0);

  async function handleOpen() {
    setError('');
    try {
      await openSavings(account?.accountNumber);
      setSuccess('Savings account opened successfully!');
      refetch();
    } catch (err) { setError(err.message); }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <CircularProgress sx={{ color: tokens.accentSolid }} />
      </div>
    );
  }

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>Savings Account</Typography>
      <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginBottom: 28 }}>Grow your money securely</Typography>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-20 max-w-2xl">
        {noSavings && (
          <motion.div variants={item}>
            <div className="rounded-3xl p-32 text-center" style={card}>
              <div className="w-80 h-80 rounded-3xl flex items-center justify-center mx-auto mb-24" style={{ background: tokens.successBg }}>
                <FuseSvgIcon size={40} style={{ color: tokens.success }}>heroicons-outline:banknotes</FuseSvgIcon>
              </div>
              <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary, marginBottom: 8 }}>
                Open a Savings Account
              </Typography>
              <Typography style={{ fontSize: F.body, color: tokens.textSecondary, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
                Separate your savings from your main wallet. Earn interest and build your financial future.
              </Typography>

              <div className="grid grid-cols-3 gap-12 mb-28 max-w-sm mx-auto">
                {[
                  { icon: 'heroicons-outline:shield-check', label: 'Secure' },
                  { icon: 'heroicons-outline:arrow-trending-up', label: 'Grow' },
                  { icon: 'heroicons-outline:lock-closed', label: 'Protected' },
                ].map(f => (
                  <div key={f.label} className="rounded-xl p-12 text-center" style={{ background: tokens.successBg }}>
                    <FuseSvgIcon size={22} style={{ color: tokens.success }} className="mx-auto">{f.icon}</FuseSvgIcon>
                    <Typography style={{ fontSize: F.small, color: tokens.textPrimary, marginTop: 6 }}>{f.label}</Typography>
                  </div>
                ))}
              </div>

              {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px', background: tokens.successBg, color: tokens.success, fontSize: F.small }}>{success}</Alert>}
              {(error || openError) && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', background: tokens.dangerBg, color: tokens.danger, fontSize: F.small }}>{error || openError}</Alert>}

              <Button variant="contained" onClick={handleOpen} disabled={opening}
                sx={{ background: `linear-gradient(135deg, ${tokens.success} 0%, #047857 100%)`, borderRadius: '12px', fontWeight: 700, py: 1.5, px: 4, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}>
                {opening ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Open Savings Account'}
              </Button>
            </div>
          </motion.div>
        )}

        {hasSavings && (
          <>
            <motion.div variants={item}>
              <div className="rounded-3xl p-28 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${tokens.success} 0%, #047857 100%)` }}>
                <div className="relative z-10">
                  <div className="flex items-center gap-12 mb-16">
                    <div className="w-44 h-44 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.16)' }}>
                      <FuseSvgIcon size={24} className="text-white">heroicons-solid:banknotes</FuseSvgIcon>
                    </div>
                    <div>
                      <Typography className="uppercase tracking-widest font-semibold" style={{ fontSize: F.small, color: 'rgba(255,255,255,0.7)' }}>Savings Balance</Typography>
                      <Typography style={{ fontSize: F.small, color: 'rgba(255,255,255,0.55)' }}>{savings?.walletId ?? 'NGN Savings Wallet'}</Typography>
                    </div>
                  </div>
                  <Typography style={{ fontSize: F.balanceLg, fontWeight: 800, color: 'white', marginBottom: 8 }}>
                    {formatNaira(balance, savings?.currency ?? 'NGN')}
                  </Typography>
                  {reserved > 0 && (
                    <Typography style={{ fontSize: F.body, color: 'rgba(255,255,255,0.7)' }}>+ {formatNaira(reserved)} reserved</Typography>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-2 gap-14">
              {[
                { label: 'Currency', value: savings?.currency ?? 'NGN', icon: 'heroicons-outline:globe-alt' },
                { label: 'Wallet ID', value: savings?.walletId?.slice(-8) ?? '—', icon: 'heroicons-outline:identification', mono: true },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-16 flex items-center gap-14" style={card}>
                  <div className="w-44 h-44 rounded-xl flex items-center justify-center shrink-0" style={{ background: tokens.successBg }}>
                    <FuseSvgIcon size={22} style={{ color: tokens.success }}>{s.icon}</FuseSvgIcon>
                  </div>
                  <div>
                    <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>{s.label}</Typography>
                    <Typography style={{ fontSize: F.body, fontWeight: 700, color: tokens.textPrimary, fontFamily: s.mono ? 'monospace' : 'inherit' }}>{s.value}</Typography>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={item}>
              <div className="rounded-2xl p-20" style={{ background: tokens.successBg }}>
                <div className="flex items-center gap-10 mb-14">
                  <FuseSvgIcon size={20} style={{ color: tokens.success }}>heroicons-outline:information-circle</FuseSvgIcon>
                  <Typography style={{ fontSize: F.label, fontWeight: 600, color: tokens.success }}>About Your Savings</Typography>
                </div>
                <ul className="space-y-10">
                  {[
                    'Savings balance is separate from your main wallet',
                    'Transfers between main and savings wallets coming soon',
                    'Balance shown is in Naira (not kobo)',
                    'Contact support for deposit and withdrawal options',
                  ].map(tip => (
                    <li key={tip} className="flex items-start gap-10">
                      <div className="w-5 h-5 rounded-full shrink-0 mt-4" style={{ background: tokens.success }} />
                      <Typography style={{ fontSize: F.body, color: tokens.textSecondary, lineHeight: 1.5 }}>{tip}</Typography>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
