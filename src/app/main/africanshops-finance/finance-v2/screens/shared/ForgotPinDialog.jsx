import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useRequestPinReset, useConfirmPinReset } from '../../hooks/useFintechApi';
import { F, fieldSx } from '../../financeUiTokens';

/**
 * Retail-4 (2026-07-12): every account always HAS a PIN (required at
 * creation) — this exists for when the owner genuinely doesn't remember what
 * they set, not a "no PIN configured" state. Email-OTP stands in for the old
 * PIN that changeAccountPin would otherwise require.
 */
export default function ForgotPinDialog({ open, onClose, tokens, onReset }) {
  const { mutate: requestReset, isLoading: requesting } = useRequestPinReset();
  const { mutate: confirmReset, isLoading: confirming } = useConfirmPinReset();

  const [step, setStep] = useState('request'); // request -> verify -> success
  const [devOtp, setDevOtp] = useState(null);
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [error, setError] = useState('');

  function reset() {
    setStep('request');
    setDevOtp(null);
    setOtp('');
    setNewPin('');
    setConfirmNewPin('');
    setError('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleRequest() {
    setError('');
    try {
      const res = await requestReset();
      setDevOtp(res?._devOtp ?? null);
      setStep('verify');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirm() {
    setError('');
    try {
      await confirmReset({ otp, newPin, confirmNewPin });
      setStep('success');
    } catch (err) {
      setError(err.message);
    }
  }

  function PinDots({ value }) {
    return (
      <div className="flex gap-8 justify-center my-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full transition-all duration-200"
            style={{ background: i < value.length ? tokens.accentSolid : tokens.borderColor, transform: i < value.length ? 'scale(1.15)' : 'scale(1)' }}
          />
        ))}
      </div>
    );
  }

  const pinsMatch = newPin.length === 6 && newPin === confirmNewPin;

  return (
    <Dialog open={open} onClose={requesting || confirming ? undefined : handleClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: '20px', background: tokens.cardBg } }}>
      <DialogContent sx={{ p: 3 }}>
        <div className="flex items-center justify-between mb-16">
          <Typography style={{ fontSize: F.body, fontWeight: 700, color: tokens.textPrimary }}>Reset Transaction PIN</Typography>
          <IconButton size="small" onClick={handleClose} disabled={requesting || confirming}>
            <FuseSvgIcon size={18} style={{ color: tokens.textMuted }}>heroicons-outline:x-mark</FuseSvgIcon>
          </IconButton>
        </div>

        {step === 'request' && (
          <div>
            <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginBottom: 20 }}>
              We'll email a verification code to your registered address. Enter it to set a new PIN — no need to remember the old one.
            </Typography>
            {error && <Alert severity="error" sx={{ borderRadius: '10px', fontSize: F.small, mb: 2 }}>{error}</Alert>}
            <Button
              variant="contained" fullWidth disabled={requesting} onClick={handleRequest}
              sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body }}
            >
              {requesting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Send Verification Code'}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div>
            <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary, marginBottom: 4 }}>Verification code</Typography>
            <TextField
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              fullWidth
              inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: 22, letterSpacing: 10, color: tokens.textPrimary } }}
              placeholder="Enter 6-digit code"
              sx={{ ...fieldSx(tokens), mb: 2 }}
            />
            {devOtp && <Typography style={{ fontSize: F.small, color: tokens.warning, textAlign: 'center', marginBottom: 12 }}>DEV OTP: {devOtp}</Typography>}

            <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary, marginBottom: 4 }}>New 6-digit PIN</Typography>
            <PinDots value={newPin} />
            <TextField
              type="password"
              value={newPin}
              onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              fullWidth
              inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: 20, letterSpacing: 8, color: tokens.textPrimary } }}
              placeholder="••••••"
              sx={{ ...fieldSx(tokens), mb: 2 }}
            />

            <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary, marginBottom: 4 }}>Confirm new PIN</Typography>
            <PinDots value={confirmNewPin} />
            <TextField
              type="password"
              value={confirmNewPin}
              onChange={e => setConfirmNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              fullWidth
              inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: 20, letterSpacing: 8, color: tokens.textPrimary } }}
              placeholder="••••••"
              error={confirmNewPin.length === 6 && !pinsMatch}
              helperText={confirmNewPin.length === 6 && !pinsMatch ? 'PINs do not match' : ''}
              sx={fieldSx(tokens)}
            />

            {error && <Alert severity="error" sx={{ borderRadius: '10px', fontSize: F.small, mt: 2 }}>{error}</Alert>}

            <Button
              variant="contained" fullWidth disabled={otp.length < 6 || !pinsMatch || confirming} onClick={handleConfirm}
              sx={{ mt: 2, background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}
            >
              {confirming ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Set New PIN'}
            </Button>
            <Button onClick={reset} sx={{ mt: 1, color: tokens.textMuted, textTransform: 'none', width: '100%', fontSize: F.small }}>Start over</Button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="w-56 h-56 rounded-full flex items-center justify-center mx-auto mb-16" style={{ background: tokens.successBg }}>
              <FuseSvgIcon size={28} style={{ color: tokens.success }}>heroicons-solid:check</FuseSvgIcon>
            </div>
            <Typography style={{ fontSize: F.body, fontWeight: 700, color: tokens.textPrimary, marginBottom: 8 }}>PIN reset</Typography>
            <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginBottom: 20 }}>
              Use your new PIN for transactions from now on.
            </Typography>
            <Button
              variant="contained" fullWidth
              onClick={() => { reset(); onReset?.(); onClose(); }}
              sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body }}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
