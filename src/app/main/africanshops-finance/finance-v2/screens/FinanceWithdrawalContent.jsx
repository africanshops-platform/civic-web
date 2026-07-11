import { useState, useEffect, useRef, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useWithdrawalInitiate,
  useWithdrawalConfirm,
  useBeneficiaries,
  useAddBeneficiary,
  useDeleteBeneficiary,
  useBanksList,
  useResolveAccountNumber,
} from '../hooks/useFintechApi';
import { useFinanceTheme } from '../FinanceThemeContext';

const F = {
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  body:        'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:       'clamp(1.44rem, 2vw,   1.76rem)',
  small:       'clamp(1.3rem,  1.8vw, 1.56rem)',
  amountLg:    'clamp(2rem,    3.2vw, 2.8rem)',
};

function fieldSx(tokens) {
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      background: tokens.pageBg,
      '& fieldset': { borderColor: tokens.borderColor },
      '&:hover fieldset': { borderColor: tokens.accentSolid },
      '&.Mui-focused fieldset': { borderColor: tokens.accentSolid },
    },
    '& input': { color: tokens.textPrimary, fontSize: 'clamp(1.5rem, 2.2vw, 1.9rem)' },
    '& .MuiInputLabel-root': { color: tokens.textMuted, fontSize: 'clamp(1.44rem, 2vw, 1.76rem)' },
    '& .MuiInputLabel-root.Mui-focused': { color: tokens.accentSolid },
    '& .MuiFormHelperText-root': { color: tokens.textMuted, fontSize: 'clamp(1.3rem, 1.8vw, 1.56rem)' },
  };
}

const OTP_DURATION = 300;

function OtpTimer({ expiresAt, onExpired, tokens }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const expires = new Date(expiresAt).getTime();
    const tick = () => {
      const secs = Math.max(0, Math.floor((expires - Date.now()) / 1000));
      setRemaining(secs);
      if (secs === 0) onExpired();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpired]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const pct = expiresAt ? (remaining / OTP_DURATION) * 100 : 100;

  return (
    <div className="mb-16">
      <div className="flex justify-between mb-6">
        <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>OTP expires in</Typography>
        <Typography style={{ fontSize: F.small, fontWeight: 700, color: remaining < 60 ? tokens.danger : tokens.accentSolid }}>{mm}:{ss}</Typography>
      </div>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ borderRadius: 2, height: 4, background: tokens.borderColor, '& .MuiLinearProgress-bar': { background: pct < 20 ? tokens.danger : tokens.accentSolid, borderRadius: 2 } }}
      />
    </div>
  );
}

function BeneficiaryPicker({ account, tokens, card, selectedId, onSelect, banks, banksLoading, bankNameByCode }) {
  const { data: beneficiaries, isLoading, refetch } = useBeneficiaries(account?.accountNumber);
  const { mutate: resolveAccount, isLoading: resolving } = useResolveAccountNumber();
  const { mutate: addBeneficiary, isLoading: adding } = useAddBeneficiary();
  const { mutate: deleteBeneficiary, isLoading: deleting } = useDeleteBeneficiary();

  const [showAddForm, setShowAddForm] = useState(false);
  const [addStep, setAddStep] = useState('input'); // 'input' | 'preview'
  const [bankSearch, setBankSearch] = useState('');
  const [addForm, setAddForm] = useState({ beneficiaryBankCode: '', beneficiaryAccountNumber: '', beneficiaryNickname: '' });
  const [preview, setPreview] = useState(null); // { account_name, account_number, bank_id }
  const [addError, setAddError] = useState('');
  const [addNotice, setAddNotice] = useState(null);

  const list = beneficiaries ?? [];

  useEffect(() => {
    if (list.length === 0) setShowAddForm(true);
  }, [list.length]);

  function updateAddForm(key, value) {
    setAddForm(f => ({ ...f, [key]: value }));
    setAddError('');
  }

  async function handleVerify() {
    setAddError('');
    try {
      const resolved = await resolveAccount({
        accountNumber: addForm.beneficiaryAccountNumber,
        bankCode: addForm.beneficiaryBankCode,
      });
      setPreview(resolved);
      setAddStep('preview');
    } catch (err) {
      setAddError(err.message);
    }
  }

  async function handleConfirmSave() {
    setAddError('');
    setAddNotice(null);
    try {
      const savedBeneficiary = await addBeneficiary({
        accountNumber: account.accountNumber,
        beneficiaryBankCode: addForm.beneficiaryBankCode,
        beneficiaryAccountNumber: addForm.beneficiaryAccountNumber,
        beneficiaryNickname: addForm.beneficiaryNickname || undefined,
      });
      setAddForm({ beneficiaryBankCode: '', beneficiaryAccountNumber: '', beneficiaryNickname: '' });
      setPreview(null);
      setAddStep('input');
      setAddNotice({
        verified: savedBeneficiary?.isVerified,
        message: savedBeneficiary?.isVerified
          ? 'Beneficiary verified and added — ready for withdrawals'
          : 'Beneficiary added but could not be auto-verified — pending admin review before it can receive withdrawals',
      });
      await refetch();
      setShowAddForm(false);
      if (savedBeneficiary?.isVerified && savedBeneficiary?.id) onSelect(savedBeneficiary);
    } catch (err) {
      setAddError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteBeneficiary(id, account.accountNumber);
      if (selectedId === id) onSelect(null);
      await refetch();
    } catch {
      // surfaced via hook's own error state; nothing else to do here
    }
  }

  const filteredBanks = (banks ?? []).filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()));
  const selectedBankName = bankNameByCode[addForm.beneficiaryBankCode] ?? '';

  return (
    <div className="rounded-3xl p-24 space-y-16" style={card}>
      <Typography style={{ fontSize: F.body, fontWeight: 600, color: tokens.textPrimary }}>Withdraw to</Typography>

      {isLoading && <CircularProgress size={20} sx={{ color: tokens.accentSolid }} />}

      {!isLoading && list.length > 0 && !showAddForm && (
        <div className="space-y-8">
          {list.map(b => (
            <button
              key={b.id}
              onClick={() => b.isVerified && onSelect(b)}
              disabled={!b.isVerified}
              className="w-full text-left rounded-xl px-16 py-12 flex items-center justify-between transition-all duration-150"
              style={{
                cursor: b.isVerified ? 'pointer' : 'not-allowed',
                background: selectedId === b.id ? tokens.accentSoft : tokens.pageBg,
                border: `1px solid ${selectedId === b.id ? tokens.accentSolid : tokens.borderColor}`,
                opacity: b.isVerified ? 1 : 0.6,
              }}
            >
              <div>
                <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary }}>
                  {b.beneficiaryNickname ? `${b.beneficiaryNickname} — ` : ''}{b.beneficiaryAccountName}
                </Typography>
                <Typography style={{ fontSize: F.small, color: tokens.textMuted, fontFamily: 'monospace' }}>
                  {bankNameByCode[b.beneficiaryBankCode] ?? b.beneficiaryBankCode} · {b.beneficiaryAccountNumber}
                </Typography>
                {!b.isVerified && (
                  <Typography style={{ fontSize: F.small, color: tokens.warning, marginTop: 4 }}>
                    Pending verification — cannot be used for withdrawals yet
                  </Typography>
                )}
              </div>
              <div className="flex items-center gap-8">
                {b.isVerified && <FuseSvgIcon size={18} style={{ color: tokens.success }}>heroicons-solid:check-circle</FuseSvgIcon>}
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }} disabled={deleting}>
                  <FuseSvgIcon size={16} style={{ color: tokens.textMuted }}>heroicons-outline:trash</FuseSvgIcon>
                </IconButton>
              </div>
            </button>
          ))}
          <Button onClick={() => setShowAddForm(true)} sx={{ color: tokens.accentSolid, textTransform: 'none', fontWeight: 600, fontSize: F.small }}>
            + Add new beneficiary
          </Button>
        </div>
      )}

      {showAddForm && addStep === 'input' && (
        <div className="space-y-12">
          {list.length > 0 && (
            <Button onClick={() => setShowAddForm(false)} sx={{ color: tokens.textMuted, textTransform: 'none', fontSize: F.small, p: 0 }}>
              ← Back to saved beneficiaries
            </Button>
          )}

          <FormControl fullWidth sx={fieldSx(tokens)}>
            <InputLabel id="bank-select-label">Bank</InputLabel>
            <Select
              labelId="bank-select-label"
              label="Bank"
              value={addForm.beneficiaryBankCode}
              onChange={e => updateAddForm('beneficiaryBankCode', e.target.value)}
              onOpen={() => setBankSearch('')}
              renderValue={() => selectedBankName}
              MenuProps={{ PaperProps: { style: { maxHeight: 360 } } }}
            >
              <Box className="sticky top-0 z-10 p-8" style={{ background: tokens.cardBg }}>
                <TextField
                  placeholder="Search banks..."
                  size="small"
                  fullWidth
                  autoFocus
                  value={bankSearch}
                  onChange={e => setBankSearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  onKeyDown={e => e.stopPropagation()}
                />
              </Box>
              {banksLoading && <MenuItem disabled><CircularProgress size={16} sx={{ mr: 1 }} />Loading banks...</MenuItem>}
              {!banksLoading && filteredBanks.length === 0 && <MenuItem disabled>No banks match your search</MenuItem>}
              {!banksLoading && filteredBanks.map(b => (
                <MenuItem key={b.code} value={b.code}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Account Number"
            value={addForm.beneficiaryAccountNumber}
            onChange={e => updateAddForm('beneficiaryAccountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
            fullWidth inputProps={{ maxLength: 10 }} sx={fieldSx(tokens)}
          />
          <TextField
            label="Nickname (optional)"
            value={addForm.beneficiaryNickname}
            onChange={e => updateAddForm('beneficiaryNickname', e.target.value)}
            fullWidth helperText="e.g. My Zenith Account" sx={fieldSx(tokens)}
          />

          {addError && <Alert severity="error" sx={{ borderRadius: '10px', fontSize: F.small }}>{addError}</Alert>}

          <Button
            variant="contained"
            fullWidth
            disabled={!addForm.beneficiaryBankCode || addForm.beneficiaryAccountNumber.length !== 10 || resolving}
            onClick={handleVerify}
            sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}
          >
            {resolving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Verify Account'}
          </Button>
        </div>
      )}

      {showAddForm && addStep === 'preview' && (
        <div className="space-y-12">
          <div className="rounded-2xl p-16" style={{ background: tokens.pageBg, border: `1px solid ${tokens.borderColor}` }}>
            <div className="flex items-center gap-8 mb-12">
              <FuseSvgIcon size={18} style={{ color: tokens.success }}>heroicons-solid:check-circle</FuseSvgIcon>
              <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary }}>Account resolved</Typography>
            </div>
            <div className="flex justify-between mb-8">
              <Typography style={{ fontSize: F.small, color: tokens.textSecondary }}>Bank</Typography>
              <Typography style={{ fontSize: F.small, color: tokens.textPrimary }}>{selectedBankName}</Typography>
            </div>
            <div className="flex justify-between mb-8">
              <Typography style={{ fontSize: F.small, color: tokens.textSecondary }}>Account Number</Typography>
              <Typography style={{ fontSize: F.small, color: tokens.textPrimary, fontFamily: 'monospace' }}>{preview?.account_number}</Typography>
            </div>
            <div className="flex justify-between">
              <Typography style={{ fontSize: F.small, color: tokens.textSecondary }}>Account Name</Typography>
              <Typography style={{ fontSize: F.small, fontWeight: 700, color: tokens.textPrimary }}>{preview?.account_name}</Typography>
            </div>
          </div>

          {addError && <Alert severity="error" sx={{ borderRadius: '10px', fontSize: F.small }}>{addError}</Alert>}

          <Button
            variant="contained"
            fullWidth
            disabled={adding}
            onClick={handleConfirmSave}
            sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body }}
          >
            {adding ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Confirm & Save Beneficiary'}
          </Button>
          <Button onClick={() => setAddStep('input')} sx={{ color: tokens.textMuted, textTransform: 'none', width: '100%', fontSize: F.small }}>
            ← Edit details
          </Button>
        </div>
      )}

      {addNotice && (
        <Alert severity={addNotice.verified ? 'success' : 'warning'} sx={{ borderRadius: '10px', fontSize: F.small }}>
          {addNotice.message}
        </Alert>
      )}
    </div>
  );
}

export default function FinanceWithdrawalContent() {
  const { account, balance } = useOutletContext();
  const { mutate: initiate, isLoading: initiating } = useWithdrawalInitiate();
  const { mutate: confirm, isLoading: confirming } = useWithdrawalConfirm();
  const { data: banks, isLoading: banksLoading } = useBanksList();
  const { tokens } = useFinanceTheme();
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow };
  const errorAlertSx = { borderRadius: '10px', background: tokens.dangerBg, color: tokens.danger, fontSize: F.small, '& .MuiAlert-icon': { color: tokens.danger } };

  const bankNameByCode = useMemo(() => {
    const map = {};
    (banks ?? []).forEach(b => { map[b.code] = b.name; });
    return map;
  }, [banks]);

  const [step, setStep] = useState('form');
  const [form, setForm] = useState({ amountNGN: '' });
  const [beneficiary, setBeneficiary] = useState(null);
  const [otp, setOtp] = useState('');
  const [btxData, setBtxData] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [otpExpired, setOtpExpired] = useState(false);

  const idempotencyKey = useRef(`WD-${crypto.randomUUID()}`);

  const availableNGN = parseFloat(balance?.availableBalance ?? 0) / 100;
  const amountNGN = parseFloat(form.amountNGN || 0);

  function update(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    setError('');
  }

  async function handleInitiate() {
    setError('');
    try {
      const payload = {
        amountKobo: Math.round(amountNGN * 100),
        beneficiaryId: beneficiary.id,
        idempotencyKey: idempotencyKey.current,
      };
      const res = await initiate(payload);
      setBtxData(res);
      setStep('otp');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirm() {
    if (otpExpired) { setError('OTP has expired. Please start a new withdrawal.'); return; }
    setError('');
    try {
      const res = await confirm({ btxId: btxData.btxId, otp });
      setResult(res);
      setStep('success');
    } catch (err) {
      setError(err.message);
      if (err.status === 410) setOtpExpired(true);
    }
  }

  function restart() {
    setStep('form');
    setForm({ amountNGN: '' });
    setBeneficiary(null);
    setOtp('');
    setBtxData(null);
    setResult(null);
    setError('');
    setOtpExpired(false);
    idempotencyKey.current = `WD-${crypto.randomUUID()}`;
  }

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24 flex justify-center">
      <div className="w-full max-w-md">
        <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>Withdraw Funds</Typography>
        <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginBottom: 24 }}>Send money to any Nigerian bank account</Typography>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-16">
              <div className="rounded-3xl p-24 space-y-16" style={card}>
                <div className="flex items-center justify-between rounded-xl px-16 py-12" style={{ background: tokens.accentSoft }}>
                  <Typography style={{ fontSize: F.small, color: tokens.textSecondary }}>Available</Typography>
                  <Typography style={{ fontSize: F.body, fontWeight: 700, color: tokens.success }}>₦{availableNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Typography>
                </div>

                <TextField
                  label="Amount (₦)"
                  value={form.amountNGN}
                  onChange={e => update('amountNGN', e.target.value.replace(/[^0-9.]/g, ''))}
                  fullWidth
                  error={amountNGN > availableNGN && amountNGN > 0}
                  helperText={amountNGN > availableNGN && amountNGN > 0 ? 'Exceeds available balance' : ''}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Typography style={{ color: tokens.textMuted, fontSize: F.body }}>₦</Typography></InputAdornment> }}
                  sx={{ ...fieldSx(tokens), '& .MuiFormHelperText-root.Mui-error': { color: tokens.danger } }}
                />
              </div>

              <BeneficiaryPicker
                account={account}
                tokens={tokens}
                card={card}
                selectedId={beneficiary?.id}
                onSelect={setBeneficiary}
                banks={banks}
                banksLoading={banksLoading}
                bankNameByCode={bankNameByCode}
              />

              {error && <Alert severity="error" sx={{ ...errorAlertSx, mt: 2 }}>{error}</Alert>}

              <Button
                variant="contained"
                fullWidth
                disabled={!form.amountNGN || !beneficiary || amountNGN > availableNGN || amountNGN <= 0 || initiating}
                onClick={handleInitiate}
                sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}
              >
                {initiating ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Request Withdrawal'}
              </Button>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="rounded-3xl p-24" style={card}>
                <div className="rounded-2xl p-16 mb-20" style={{ background: tokens.pageBg, border: `1px solid ${tokens.borderColor}` }}>
                  <div className="flex justify-between mb-8">
                    <Typography style={{ fontSize: F.small, color: tokens.textSecondary }}>Amount</Typography>
                    <Typography style={{ fontSize: F.amountLg, fontWeight: 700, color: tokens.accentSolid }}>₦{amountNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Typography>
                  </div>
                  <div className="flex justify-between mb-8">
                    <Typography style={{ fontSize: F.small, color: tokens.textSecondary }}>Bank</Typography>
                    <Typography style={{ fontSize: F.body, color: tokens.textPrimary }}>{bankNameByCode[beneficiary?.beneficiaryBankCode] ?? beneficiary?.beneficiaryBankCode}</Typography>
                  </div>
                  <div className="flex justify-between mb-8">
                    <Typography style={{ fontSize: F.small, color: tokens.textSecondary }}>Account</Typography>
                    <Typography style={{ fontSize: F.body, color: tokens.textPrimary, fontFamily: 'monospace' }}>{beneficiary?.beneficiaryAccountNumber}</Typography>
                  </div>
                  {typeof btxData?.commissionKobo === 'number' && (
                    <>
                      <div className="flex justify-between mb-8 pt-8" style={{ borderTop: `1px dashed ${tokens.borderColor}` }}>
                        <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>Platform fee</Typography>
                        <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>-₦{(btxData.commissionKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Typography>
                      </div>
                      <div className="flex justify-between">
                        <Typography style={{ fontSize: F.small, fontWeight: 700, color: tokens.textPrimary }}>You receive</Typography>
                        <Typography style={{ fontSize: F.body, fontWeight: 700, color: tokens.success }}>₦{(btxData.netAmountKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Typography>
                      </div>
                    </>
                  )}
                </div>

                <Typography style={{ fontSize: F.body, fontWeight: 600, color: tokens.textPrimary, marginBottom: 4 }}>Enter OTP</Typography>
                <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginBottom: 16 }}>
                  A 6-digit code was sent to your registered email/phone
                </Typography>

                {btxData?.expiresAt && <OtpTimer expiresAt={btxData.expiresAt} onExpired={() => setOtpExpired(true)} tokens={tokens} />}

                <div className="flex gap-8 justify-center mb-16">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-40 h-48 rounded-xl flex items-center justify-center font-bold border transition-all"
                      style={{ fontSize: F.body, background: tokens.pageBg, borderColor: i < otp.length ? tokens.accentSolid : tokens.borderColor, color: tokens.textPrimary }}
                    >
                      {otp[i] ? '•' : ''}
                    </div>
                  ))}
                </div>

                <TextField
                  type="password"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  fullWidth
                  inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: 24, letterSpacing: 14, color: tokens.textPrimary } }}
                  placeholder="Enter 6-digit OTP"
                  sx={fieldSx(tokens)}
                />

                {btxData?._devOtp && (
                  <Typography style={{ fontSize: F.small, color: tokens.warning, textAlign: 'center', marginTop: 8 }}>DEV OTP: {btxData._devOtp}</Typography>
                )}

                {error && <Alert severity="error" sx={{ ...errorAlertSx, mt: 2 }}>{error}</Alert>}

                {otpExpired
                  ? (
                    <div className="mt-16 text-center">
                      <Typography style={{ fontSize: F.body, color: tokens.danger, marginBottom: 12 }}>OTP expired</Typography>
                      <Button onClick={restart} sx={{ color: tokens.accentSolid, textTransform: 'none', fontWeight: 700, fontSize: F.label }}>Start New Withdrawal</Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        fullWidth
                        disabled={otp.length < 6 || confirming}
                        onClick={handleConfirm}
                        sx={{ mt: 2, background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}
                      >
                        {confirming ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Confirm Withdrawal'}
                      </Button>
                      <Button onClick={restart} sx={{ mt: 1, color: tokens.textMuted, textTransform: 'none', width: '100%', fontSize: F.small }}>Cancel</Button>
                    </>
                  )
                }
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="rounded-3xl p-32" style={card}>
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                  className="w-72 h-72 rounded-full flex items-center justify-center mx-auto mb-20"
                  style={{ background: tokens.successBg }}
                >
                  <FuseSvgIcon size={36} style={{ color: tokens.success }}>heroicons-solid:check</FuseSvgIcon>
                </motion.div>
                <Typography style={{ fontSize: F.sectionHead, fontWeight: 800, color: tokens.textPrimary, marginBottom: 8 }}>Withdrawal Submitted!</Typography>
                <Typography style={{ fontSize: F.body, color: tokens.textSecondary, marginBottom: 24 }}>
                  {result?.message ?? 'Funds will arrive within minutes.'}
                </Typography>
                {result?.transferCode && (
                  <div className="rounded-xl p-12 mb-20" style={{ background: tokens.pageBg, border: `1px solid ${tokens.borderColor}` }}>
                    <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginBottom: 4 }}>Transfer Code</Typography>
                    <Typography style={{ fontSize: F.body, fontFamily: 'monospace', color: tokens.textPrimary }}>{result.transferCode}</Typography>
                  </div>
                )}
                <Button
                  variant="contained"
                  onClick={restart}
                  sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, px: 4, textTransform: 'none', fontSize: F.body }}
                >
                  New Withdrawal
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
