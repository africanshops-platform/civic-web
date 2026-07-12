import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { useAppSelector } from 'app/store/hooks';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { useVerifyWalletFunding, formatKobo } from '../hooks/useFintechApi';
import { useFinanceTheme } from '../FinanceThemeContext';
import { F, fieldSx } from '../financeUiTokens';

const container = { show: { transition: { staggerChildren: 0.08 } } };
const item      = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

// Retail-8 (2026-07-12): drives liquidity into the default wallet via card
// checkout — same react-paystack inline popup already used on bookings/
// marketplace/foodmart, verified+credited the same way charge.success does.
export default function FinanceFundAccountContent() {
  const { account, balance, balanceLoading, refetchFinanceData } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const user = useAppSelector(selectUser);
  const { mutate: verifyFunding, isLoading: verifying, error: verifyError } = useVerifyWalletFunding();

  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState('');

  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow };
  const amountNaira = parseFloat(amount);
  const amountValid = amountNaira >= 100;
  const reference = `AFSHFUND${account?.accountNumber ?? ''}${Date.now()}`;

  // Retail-8 (2026-07-12) bugfix: <PaystackButton> renders its own DOM and
  // silently drops any `style`/custom prop it doesn't explicitly recognize —
  // that's why no visible/clickable button showed up regardless of amount.
  // usePaystackPayment instead just returns a trigger function, so this
  // component owns the actual <button> element and its styling entirely.
  const initializePayment = usePaystackPayment({
    reference,
    email: user?.email,
    amount: amountValid ? Math.round(amountNaira * 100) : 0,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  });

  async function handleSuccess(paystackResponse) {
    setSuccess('');
    try {
      await verifyFunding(account?.accountNumber, paystackResponse.reference);
      setSuccess('Payment confirmed — your balance has been updated.');
      setAmount('');
      refetchFinanceData?.();
    } catch {
      // error surfaced via verifyError
    }
  }

  function handleFundClick() {
    if (!amountValid || !user?.email) return;
    initializePayment({ onSuccess: handleSuccess, onClose: () => {} });
  }

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>Fund Account</Typography>
      <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginBottom: 28 }}>Add money to your default wallet from a card</Typography>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-20 max-w-2xl">
        {/* Account details */}
        <motion.div variants={item}>
          <div className="rounded-3xl p-28 relative overflow-hidden" style={{ background: tokens.heroBg }}>
            <div className="relative z-10">
              <Typography className="uppercase tracking-widest font-semibold" style={{ fontSize: F.small, color: tokens.heroTextMuted }}>
                Default Wallet
              </Typography>
              <Typography style={{ fontSize: 'clamp(2.2rem, 3.6vw, 3rem)', fontWeight: 800, color: tokens.heroText, marginTop: 8, marginBottom: 16 }}>
                {balanceLoading ? '—' : formatKobo(balance?.availableBalance)}
              </Typography>
              <div className="flex items-center gap-24 flex-wrap">
                <div>
                  <Typography style={{ fontSize: F.small, color: tokens.heroTextMuted }}>Account Number</Typography>
                  <Typography style={{ fontSize: F.label, fontWeight: 700, color: tokens.heroText, letterSpacing: '0.08em' }}>
                    {account?.accountNumber ?? '—'}
                  </Typography>
                </div>
                <div>
                  <Typography style={{ fontSize: F.small, color: tokens.heroTextMuted }}>Account Name</Typography>
                  <Typography style={{ fontSize: F.label, fontWeight: 700, color: tokens.heroText }}>
                    {account?.accountName ?? '—'}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fund via card */}
        <motion.div variants={item}>
          <div className="rounded-2xl p-24" style={card}>
            <div className="flex items-center gap-12 mb-20">
              <div className="w-40 h-40 rounded-xl flex items-center justify-center" style={{ background: tokens.accentSoft }}>
                <FuseSvgIcon size={20} style={{ color: tokens.accentSolid }}>heroicons-outline:credit-card</FuseSvgIcon>
              </div>
              <div>
                <Typography style={{ fontSize: F.label, fontWeight: 700, color: tokens.textPrimary }}>Fund with Card</Typography>
                <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Instant — via Paystack</Typography>
              </div>
            </div>

            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>{success}</Alert>}
            {verifyError && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>{verifyError}</Alert>}

            <div className="max-w-xs">
              <TextField
                label="Amount (₦)"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
                sx={{ ...fieldSx(tokens), mb: 3 }}
              />
            </div>

            {verifying ? (
              <div className="flex items-center gap-10">
                <CircularProgress size={20} sx={{ color: tokens.accentSolid }} />
                <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Confirming payment…</Typography>
              </div>
            ) : (
              <button
                onClick={handleFundClick}
                disabled={!amountValid}
                className="rounded-xl font-semibold"
                style={{
                  fontSize: F.body,
                  padding: '12px 24px',
                  border: 'none',
                  background: amountValid ? tokens.accentGradient : tokens.borderColor,
                  color: amountValid ? '#ffffff' : tokens.textMuted,
                  cursor: amountValid ? 'pointer' : 'not-allowed',
                }}
              >
                {amountValid ? `Fund ₦${amountNaira.toLocaleString('en-NG')}` : 'Enter an amount'}
              </button>
            )}

            <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginTop: 16, maxWidth: 420, lineHeight: 1.5 }}>
              Minimum ₦100. Funds land in your default wallet immediately after payment confirms.
            </Typography>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
