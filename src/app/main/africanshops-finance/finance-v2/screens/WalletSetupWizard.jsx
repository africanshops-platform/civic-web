import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateFintechAccount } from '../hooks/useFintechApi';
import { useSelector } from 'react-redux';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import { useFinanceTheme } from '../FinanceThemeContext';

const STEPS = ['Welcome', 'Set PIN', 'Confirm PIN', 'Done'];

export default function WalletSetupWizard({ onComplete }) {
  const user = useSelector(selectUser);
  const displayName = user?.name ?? user?.name ?? '';
  const { mutate, isLoading, error } = useCreateFintechAccount();
  const { tokens } = useFinanceTheme();
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow };
  const fieldSx = {
    mt: 2,
    '& .MuiOutlinedInput-root': { borderRadius: '12px', background: tokens.pageBg, '& fieldset': { borderColor: tokens.borderColor }, '&:hover fieldset': { borderColor: tokens.accentSolid }, '&.Mui-focused fieldset': { borderColor: tokens.accentSolid } },
    '& input': { color: tokens.textPrimary },
  };
  const btnSx = { mt: 2, background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } };

  const [step, setStep] = useState(0);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [accountData, setAccountData] = useState(null);
  const [pinError, setPinError] = useState('');

  async function handleCreate() {
    setPinError('');
    if (pin.length !== 6) { setPinError('PIN must be 6 digits'); return; }
    if (pin !== confirmPin) { setPinError('PINs do not match'); return; }
    try {
      // Retail-8 (2026-07-12) bugfix: email was never sent here, so the
      // backend's `if (data.email && userType !== 'ADMIN')` gate silently
      // skipped Paystack DVA provisioning for every account ever created
      // through this wizard — not just old ones. phone is optional on the
      // backend side but passed too since it reads data.phone as well.
      const result = await mutate({ accountName: displayName, accountPin: pin, userType: 'USER', email: user?.email, phone: user?.phoneNumber });
      setAccountData(result);
      setStep(3);
    } catch {}
  }

  function PinDots({ value, total = 6 }) {
    return (
      <div className="flex gap-10 justify-center my-8">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-full transition-all duration-200"
            style={{
              background: i < value.length ? tokens.accentSolid : tokens.borderColor,
              transform: i < value.length ? 'scale(1.15)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    );
  }

  const content = [
    // Step 0: Welcome
    <motion.div key="s0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <div
        className="w-80 h-80 rounded-3xl flex items-center justify-center mx-auto mb-24"
        style={{ background: tokens.accentGradient }}
      >
        <FuseSvgIcon size={40} className="text-white">heroicons-solid:cash</FuseSvgIcon>
      </div>
      <Typography className="text-3xl font-extrabold mb-12" style={{ color: tokens.textPrimary }}>Set up your wallet</Typography>
      <Typography className="text-base mb-8" style={{ color: tokens.textSecondary }}>
        Hi {displayName || 'there'}! Your Africanshops Finance wallet unlocks payments,<br className="hidden md:block" /> transfers, savings, and multi-currency accounts.
      </Typography>
      <div className="grid grid-cols-3 gap-12 my-24 max-w-xs mx-auto">
        {[
          { icon: 'heroicons-outline:refresh', label: 'Transfers' },
          { icon: 'heroicons-outline:cash', label: 'Savings' },
          { icon: 'heroicons-outline:globe-alt', label: 'Multi-FX' },
        ].map(f => (
          <div key={f.label} className="rounded-xl p-12 text-center" style={card}>
            <FuseSvgIcon size={20} style={{ color: tokens.accentSolid }} className="mx-auto">{f.icon}</FuseSvgIcon>
            <Typography className="text-xs mt-6" style={{ color: tokens.textPrimary }}>{f.label}</Typography>
          </div>
        ))}
      </div>
      <Button variant="contained" fullWidth onClick={() => setStep(1)} sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: 16 }}>
        Get Started
      </Button>
    </motion.div>,

    // Step 1: Set PIN
    <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <div className="w-56 h-56 rounded-2xl flex items-center justify-center mx-auto mb-20" style={{ background: tokens.accentSoft }}>
        <FuseSvgIcon size={28} style={{ color: tokens.accentSolid }}>heroicons-outline:lock-closed</FuseSvgIcon>
      </div>
      <Typography className="text-2xl font-bold mb-8" style={{ color: tokens.textPrimary }}>Create transaction PIN</Typography>
      <Typography className="text-sm mb-24" style={{ color: tokens.textMuted }}>
        This 6-digit PIN will authorise every transaction
      </Typography>
      <PinDots value={pin} />
      <TextField
        type="password"
        inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*', style: { textAlign: 'center', fontSize: 24, letterSpacing: 12, color: tokens.textPrimary } }}
        value={pin}
        onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="••••••"
        fullWidth
        sx={fieldSx}
      />
      <Button variant="contained" fullWidth disabled={pin.length < 6} onClick={() => setStep(2)} sx={btnSx}>
        Continue
      </Button>
    </motion.div>,

    // Step 2: Confirm PIN
    <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <Typography className="text-2xl font-bold mb-8" style={{ color: tokens.textPrimary }}>Confirm your PIN</Typography>
      <Typography className="text-sm mb-24" style={{ color: tokens.textMuted }}>Enter the same 6-digit PIN again</Typography>
      <PinDots value={confirmPin} />
      <TextField
        type="password"
        inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*', style: { textAlign: 'center', fontSize: 24, letterSpacing: 12, color: tokens.textPrimary } }}
        value={confirmPin}
        onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="••••••"
        fullWidth
        sx={fieldSx}
      />
      {(pinError || error) && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: '10px', background: tokens.dangerBg, color: tokens.danger }}>
          {pinError || error}
        </Alert>
      )}
      <Button variant="contained" fullWidth disabled={confirmPin.length < 6 || isLoading} onClick={handleCreate} sx={btnSx}>
        {isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Activate Wallet'}
      </Button>
      <Button onClick={() => { setStep(1); setConfirmPin(''); }} sx={{ mt: 1, color: tokens.textMuted, textTransform: 'none' }}>
        Back
      </Button>
    </motion.div>,

    // Step 3: Done
    <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
        className="w-80 h-80 rounded-full flex items-center justify-center mx-auto mb-24"
        style={{ background: tokens.successBg }}
      >
        <FuseSvgIcon size={40} style={{ color: tokens.success }}>heroicons-solid:check</FuseSvgIcon>
      </motion.div>
      <Typography className="text-3xl font-extrabold mb-12" style={{ color: tokens.textPrimary }}>Wallet activated!</Typography>
      {accountData && (
        <div className="rounded-2xl p-20 my-20 text-left max-w-xs mx-auto" style={card}>
          <Typography className="text-xs mb-4" style={{ color: tokens.textMuted }}>Account Number</Typography>
          <Typography className="text-xl font-bold tracking-widest" style={{ color: tokens.textPrimary }}>{accountData.accountNumber}</Typography>
          <Typography className="text-xs mt-12" style={{ color: tokens.textMuted }}>Account Name</Typography>
          <Typography className="text-sm font-semibold" style={{ color: tokens.textPrimary }}>{accountData.accountName}</Typography>
        </div>
      )}
      <Button variant="contained" fullWidth onClick={onComplete} sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: 16 }}>
        Go to Dashboard
      </Button>
    </motion.div>,
  ];

  return (
    <div className="flex items-center justify-center min-h-screen px-16 py-24">
      {/* Step indicator */}
      <div className="w-full max-w-sm">
        <div className="flex gap-6 mb-32 justify-center">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className="h-2 rounded-full flex-1 transition-all duration-400"
              style={{ background: i <= step ? tokens.accentSolid : tokens.borderColor, maxWidth: 60 }}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          {content[step]}
        </AnimatePresence>
      </div>
    </div>
  );
}
