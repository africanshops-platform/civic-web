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
import { useVerifyWalletFunding, useProvisionMyDva } from '../hooks/useFintechApi';
import { useFinanceTheme } from '../FinanceThemeContext';
import { F, fieldSx } from '../financeUiTokens';

const container = { show: { transition: { staggerChildren: 0.08 } } };
const item      = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function CopyField({ label, value, tokens, mono = true }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl p-16 flex items-center justify-between gap-16" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)' }}>
      <div className="min-w-0">
        <Typography style={{ fontSize: F.small, color: 'rgba(255,255,255,0.65)' }}>{label}</Typography>
        <Typography
          className="truncate"
          style={{ fontSize: F.label, fontWeight: 700, color: '#ffffff', fontFamily: mono ? 'monospace' : 'inherit', letterSpacing: mono ? '0.06em' : 'normal' }}
        >
          {value ?? '—'}
        </Typography>
      </div>
      <button
        onClick={handleCopy}
        disabled={!value}
        className="flex items-center gap-6 rounded-lg px-12 py-8 font-semibold shrink-0 cursor-pointer"
        style={{ fontSize: F.small, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.24)', color: '#ffffff' }}
      >
        <FuseSvgIcon size={16} style={{ color: '#ffffff' }}>{copied ? 'heroicons-solid:check' : 'heroicons-outline:clipboard-list'}</FuseSvgIcon>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

// Retail-8 (2026-07-12): shows the account's Paystack Dedicated Virtual
// Account (NUBAN) — provisioned automatically at account creation
// (PaystackDvaService.provisionDva) — so any Nigerian bank transfer to that
// number lands directly in this wallet. Also offers the same card-checkout
// action as Fund Account, as a secondary funding path.
export default function FinanceReceiveMoneyContent() {
  const { account, refetchFinanceData } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const user = useAppSelector(selectUser);
  const { mutate: verifyFunding, isLoading: verifying, error: verifyError } = useVerifyWalletFunding();
  const { mutate: provisionDva, isLoading: provisioning, error: provisionError } = useProvisionMyDva();

  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState('');
  const [dvaJustProvisioned, setDvaJustProvisioned] = useState(null);

  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow };
  const dvaProvisioned = dvaJustProvisioned ?? (account?.dvaProvisioned && account?.dvaAccountNumber);
  const amountNaira = parseFloat(amount);
  const amountValid = amountNaira >= 100;
  const reference = `AFSHFUND${account?.accountNumber ?? ''}${Date.now()}`;

  // Retail-8 (2026-07-12) bugfix: <PaystackButton> silently drops props it
  // doesn't recognize (like custom style), which is why no visible/clickable
  // button ever showed up. usePaystackPayment just returns a trigger
  // function — this component owns the actual <button> element instead.
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

  async function handleProvisionDva() {
    try {
      const result = await provisionDva(account?.accountNumber);
      setDvaJustProvisioned({ dvaAccountNumber: result.dvaAccountNumber, dvaBankName: result.dvaBankName });
      refetchFinanceData?.();
    } catch {
      // error surfaced via provisionError
    }
  }

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>Receive Money</Typography>
      <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginBottom: 28 }}>
        Share your account details to receive bank transfers directly into your wallet
      </Typography>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-20 max-w-2xl">
        <motion.div variants={item}>
          <div className="rounded-3xl p-28 relative overflow-hidden" style={{ background: tokens.heroBg }}>
            <div className="relative z-10">
              <div className="flex items-center gap-12 mb-20">
                <div className="w-44 h-44 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.16)' }}>
                  <FuseSvgIcon size={22} className="text-white">heroicons-outline:library</FuseSvgIcon>
                </div>
                <div>
                  <Typography className="uppercase tracking-widest font-semibold" style={{ fontSize: F.small, color: 'rgba(255,255,255,0.7)' }}>
                    Your NUBAN Account
                  </Typography>
                  <Typography style={{ fontSize: F.small, color: 'rgba(255,255,255,0.55)' }}>
                    Any Nigerian bank can send here
                  </Typography>
                </div>
              </div>

              {!dvaProvisioned ? (
                <div>
                  <Typography style={{ fontSize: F.body, color: 'rgba(255,255,255,0.75)', marginBottom: 16 }}>
                    You don't have a receive-money account yet — set one up to get a dedicated NUBAN number.
                  </Typography>
                  {provisionError && (
                    <Typography style={{ fontSize: F.small, color: '#fca5a5', marginBottom: 12 }}>{provisionError}</Typography>
                  )}
                  <button
                    onClick={handleProvisionDva}
                    disabled={provisioning}
                    className="rounded-xl font-semibold px-20 py-10"
                    style={{ fontSize: F.body, border: 'none', background: 'rgba(255,255,255,0.18)', color: '#ffffff', cursor: provisioning ? 'default' : 'pointer' }}
                  >
                    {provisioning ? 'Setting up…' : 'Set Up My Receive-Money Account'}
                  </button>
                </div>
              ) : (
                <div className="grid gap-12">
                  <CopyField label="Account Number" value={dvaJustProvisioned?.dvaAccountNumber ?? account.dvaAccountNumber} tokens={tokens} />
                  <CopyField label="Bank Name" value={dvaJustProvisioned?.dvaBankName ?? account.dvaBankName} tokens={tokens} mono={false} />
                  <CopyField label="Account Name" value={account.accountName} tokens={tokens} mono={false} />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Fund via card — secondary option */}
        <motion.div variants={item}>
          <div className="rounded-2xl p-24" style={card}>
            <div className="flex items-center gap-12 mb-20">
              <div className="w-40 h-40 rounded-xl flex items-center justify-center" style={{ background: tokens.accentSoft }}>
                <FuseSvgIcon size={20} style={{ color: tokens.accentSolid }}>heroicons-outline:credit-card</FuseSvgIcon>
              </div>
              <div>
                <Typography style={{ fontSize: F.label, fontWeight: 700, color: tokens.textPrimary }}>Or Fund with Card</Typography>
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
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
