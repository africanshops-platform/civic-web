import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import {
  useChangePin,
  useTransferLimits,
  useSetTransferLimits,
} from '../hooks/useFintechApi';
import { useFinanceTheme } from '../FinanceThemeContext';
import { F, fieldSx } from '../financeUiTokens';
import TransactionPinField from './shared/TransactionPinField';
import ForgotPinDialog from './shared/ForgotPinDialog';

const container = { show: { transition: { staggerChildren: 0.08 } } };
const item      = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

// Retail-7 (2026-07-12): consolidates two previously-scattered concerns —
// PIN management (was only reachable inline mid-transaction) and self-service
// transfer limits (new) — into one settings home, matching the shop-dashboard
// pattern the founder referenced when first asking for a transaction PIN.
function ChangePinCard({ account, tokens, card }) {
  const { mutate: changePin, isLoading, error: apiError } = useChangePin();
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const pinsMatch = newPin.length === 6 && newPin === confirmNewPin;
  const canSubmit = oldPin.length === 6 && pinsMatch && !isLoading;

  async function handleSubmit() {
    setSuccess('');
    try {
      await changePin(account?.accountNumber, { oldPin, newPin, confirmNewPin });
      setSuccess('PIN changed successfully.');
      setOldPin('');
      setNewPin('');
      setConfirmNewPin('');
    } catch {
      // error surfaced via apiError
    }
  }

  return (
    <div className="rounded-2xl p-24" style={card}>
      <div className="flex items-center gap-12 mb-20">
        <div className="w-40 h-40 rounded-xl flex items-center justify-center" style={{ background: tokens.accentSoft }}>
          <FuseSvgIcon size={20} style={{ color: tokens.accentSolid }}>heroicons-outline:lock-closed</FuseSvgIcon>
        </div>
        <div>
          <Typography style={{ fontSize: F.label, fontWeight: 700, color: tokens.textPrimary }}>Transaction PIN</Typography>
          <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Confirms every withdrawal, transfer, and payout</Typography>
        </div>
      </div>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>{success}</Alert>}
      {apiError && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>{apiError}</Alert>}

      <div className="grid gap-16 max-w-sm">
        <TransactionPinField value={oldPin} onChange={setOldPin} tokens={tokens} label="Current PIN" />
        <TransactionPinField value={newPin} onChange={setNewPin} tokens={tokens} label="New PIN" />
        <div>
          <TransactionPinField value={confirmNewPin} onChange={setConfirmNewPin} tokens={tokens} label="Confirm new PIN" />
          {confirmNewPin.length === 6 && !pinsMatch && (
            <Typography style={{ fontSize: F.small, color: tokens.danger, textAlign: 'center', marginTop: 4 }}>PINs do not match</Typography>
          )}
        </div>
      </div>

      <div className="flex items-center gap-16 mt-20">
        <Button
          variant="contained" disabled={!canSubmit} onClick={handleSubmit}
          sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.2, px: 3, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}
        >
          {isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Change PIN'}
        </Button>
        <Button onClick={() => setForgotOpen(true)} sx={{ color: tokens.textMuted, textTransform: 'none', fontSize: F.small }}>
          Forgot PIN?
        </Button>
      </div>

      <ForgotPinDialog open={forgotOpen} onClose={() => setForgotOpen(false)} tokens={tokens} />
    </div>
  );
}

function LimitField({ label, value, onChange, tokens }) {
  return (
    <div>
      <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary, marginBottom: 6 }}>{label}</Typography>
      <TextField
        value={value}
        onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ''))}
        fullWidth
        placeholder="No limit"
        InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
        sx={fieldSx(tokens)}
      />
    </div>
  );
}

function TransferLimitsCard({ account, tokens, card }) {
  const { data: limits, isLoading, refetch } = useTransferLimits(account?.accountNumber);
  const { mutate: setLimits, isLoading: saving, error: apiError } = useSetTransferLimits();
  const [perTx, setPerTx] = useState('');
  const [daily, setDaily] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!limits) return;
    setPerTx(limits.perTransactionLimitKobo != null ? String(limits.perTransactionLimitKobo / 100) : '');
    setDaily(limits.dailyTransferLimitKobo != null ? String(limits.dailyTransferLimitKobo / 100) : '');
  }, [limits]);

  async function handleSave() {
    setSuccess('');
    try {
      await setLimits(account?.accountNumber, {
        perTransactionLimitKobo: perTx === '' ? null : Math.round(parseFloat(perTx) * 100),
        dailyTransferLimitKobo: daily === '' ? null : Math.round(parseFloat(daily) * 100),
      });
      setSuccess('Transfer limits updated. Increases take effect in 24h; decreases apply immediately.');
      refetch();
    } catch {
      // error surfaced via apiError
    }
  }

  const pending = limits?.pendingChange;

  return (
    <div className="rounded-2xl p-24" style={card}>
      <div className="flex items-center gap-12 mb-20">
        <div className="w-40 h-40 rounded-xl flex items-center justify-center" style={{ background: tokens.infoBg }}>
          <FuseSvgIcon size={20} style={{ color: tokens.info }}>heroicons-outline:shield-check</FuseSvgIcon>
        </div>
        <div>
          <Typography style={{ fontSize: F.label, fontWeight: 700, color: tokens.textPrimary }}>Transfer Limits</Typography>
          <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Optional caps for your own peace of mind</Typography>
        </div>
      </div>

      {isLoading ? (
        <CircularProgress size={24} sx={{ color: tokens.accentSolid }} />
      ) : (
        <>
          {pending && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>
              A limit increase is scheduled for {new Date(pending.effectiveAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}.
            </Alert>
          )}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>{success}</Alert>}
          {apiError && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: F.small }}>{apiError}</Alert>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 max-w-lg">
            <LimitField label="Per-transaction limit" value={perTx} onChange={setPerTx} tokens={tokens} />
            <LimitField label="Daily total limit" value={daily} onChange={setDaily} tokens={tokens} />
          </div>

          <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginTop: 14, maxWidth: 480, lineHeight: 1.5 }}>
            Lowering a limit applies immediately. Raising it — or clearing it entirely — takes effect 24 hours later,
            so a compromised PIN can't be used to raise your own limit and drain the account in one session.
          </Typography>

          <Button
            variant="contained" disabled={saving} onClick={handleSave}
            sx={{ mt: 3, background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.2, px: 3, textTransform: 'none', fontSize: F.body }}
          >
            {saving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save Limits'}
          </Button>
        </>
      )}
    </div>
  );
}

export default function FinanceSettingsContent() {
  const { account } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow };

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>Settings</Typography>
      <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginBottom: 28 }}>Security and account preferences</Typography>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-20 max-w-3xl">
        <motion.div variants={item}><ChangePinCard account={account} tokens={tokens} card={card} /></motion.div>
        <motion.div variants={item}><TransferLimitsCard account={account} tokens={tokens} card={card} /></motion.div>
      </motion.div>
    </div>
  );
}
