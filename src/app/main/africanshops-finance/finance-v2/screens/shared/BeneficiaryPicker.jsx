import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
  useBeneficiaries,
  useAddBeneficiary,
  useDeleteBeneficiary,
  useResolveAccountNumber,
} from '../../hooks/useFintechApi';
import { F, fieldSx } from '../../financeUiTokens';

/**
 * Shared by withdrawal (requireVerified) and external-transfer (!requireVerified):
 * a withdrawal destination must be provably the caller's own KYC-matched account,
 * but an external transfer can go to anyone's saved, Paystack-resolved beneficiary.
 */
export default function BeneficiaryPicker({ account, tokens, card, selectedId, onSelect, banks, banksLoading, bankNameByCode, requireVerified = true }) {
  const { data: beneficiaries, isLoading, refetch } = useBeneficiaries(account?.accountNumber);
  const { mutate: resolveAccount, isLoading: resolving } = useResolveAccountNumber();
  const { mutate: addBeneficiary, isLoading: adding } = useAddBeneficiary();
  const { mutate: deleteBeneficiary, isLoading: deleting } = useDeleteBeneficiary();

  const [showAddForm, setShowAddForm] = useState(false);
  const [addStep, setAddStep] = useState('input'); // 'input' | 'preview'
  const [bankSearch, setBankSearch] = useState('');
  const [beneficiarySearch, setBeneficiarySearch] = useState('');
  const [addForm, setAddForm] = useState({ beneficiaryBankCode: '', beneficiaryAccountNumber: '', beneficiaryNickname: '' });
  const [preview, setPreview] = useState(null); // { account_name, account_number, bank_id }
  const [addError, setAddError] = useState('');
  const [addNotice, setAddNotice] = useState(null);

  const list = beneficiaries ?? [];
  const hasLoadedEmpty = isLoading === false && list.length === 0;

  // Gated on isLoading being definitely false — not just list.length, which is
  // [] (falsy-empty) during the fetch too. Without that gate this fires the
  // instant the component mounts, before we actually know whether the user
  // has saved beneficiaries, flashing the add-form even when they don't need it.
  useEffect(() => {
    if (hasLoadedEmpty) setShowAddForm(true);
  }, [hasLoadedEmpty]);

  const filteredList = list.filter(b => {
    const q = beneficiarySearch.toLowerCase();
    if (!q) return true;
    return (b.beneficiaryNickname ?? '').toLowerCase().includes(q) || (b.beneficiaryAccountName ?? '').toLowerCase().includes(q);
  });

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

  // The account is resolved+persisted here (the backend requires every payout
  // destination to be a real Beneficiary row — never freeform bank details at
  // send time), but that's plumbing, not a user decision: whether to actually
  // KEEP it as a beneficiary for next time is asked AFTER the transaction
  // succeeds (see FinanceWithdrawalContent's post-success checkbox), not now.
  async function handleUseAccount() {
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
      if (requireVerified && !savedBeneficiary?.isVerified) {
        setAddNotice({
          verified: false,
          message: 'This account could not be auto-verified as yours, so it can’t be used for withdrawals. Use Send to Bank instead, or add a beneficiary that matches your KYC name.',
        });
        return;
      }
      await refetch();
      setShowAddForm(false);
      // Tag so the parent screen knows this wasn't picked from an
      // already-saved list — that's what drives the post-success "save for
      // next time" prompt.
      onSelect({ ...savedBeneficiary, _isNewlyAdded: true });
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

  const hasSavedBeneficiaries = isLoading === false && list.length > 0;
  const showingList = hasSavedBeneficiaries === true && showAddForm === false;

  return (
    <div className="rounded-3xl p-24 space-y-16" style={card}>
      <div className="flex items-start justify-between">
        <div>
          <Typography style={{ fontSize: F.body, fontWeight: 600, color: tokens.textPrimary }}>Send to</Typography>
          <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginTop: 2 }}>
            {showingList === true ? 'Select a saved beneficiary, or add a new account' : 'Enter the bank account you want to send to'}
          </Typography>
        </div>
        {hasSavedBeneficiaries === true && (
          <IconButton
            size="small"
            onClick={() => { setShowAddForm(v => !v); setAddStep('input'); setAddError(''); }}
            title={showAddForm === true ? 'Back to saved beneficiaries' : 'Add a new account'}
            sx={{ background: tokens.accentSoft, borderRadius: '10px' }}
          >
            <FuseSvgIcon size={18} style={{ color: tokens.accentSolid }}>
              {showAddForm === true ? 'heroicons-outline:reply' : 'heroicons-outline:plus'}
            </FuseSvgIcon>
          </IconButton>
        )}
      </div>

      {isLoading === true && <CircularProgress size={20} sx={{ color: tokens.accentSolid }} />}

      {showingList === true && (
        <div className="space-y-8">
          {list.length > 5 && (
            <TextField
              placeholder="Search beneficiaries by name..."
              size="small"
              fullWidth
              value={beneficiarySearch}
              onChange={e => setBeneficiarySearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><FuseSvgIcon size={16} style={{ color: tokens.textMuted }}>heroicons-outline:search</FuseSvgIcon></InputAdornment>,
              }}
              sx={fieldSx(tokens)}
            />
          )}
          {filteredList.length === 0 && (
            <Typography style={{ fontSize: F.small, color: tokens.textMuted, textAlign: 'center', padding: '12px 0' }}>
              No beneficiaries match your search
            </Typography>
          )}
          {filteredList.map(b => {
            const selectable = requireVerified ? b.isVerified : true;
            return (
              <button
                key={b.id}
                onClick={() => selectable && onSelect(b)}
                disabled={!selectable}
                className="w-full text-left rounded-xl px-16 py-12 flex items-center justify-between transition-all duration-150"
                style={{
                  cursor: selectable ? 'pointer' : 'not-allowed',
                  background: selectedId === b.id ? tokens.accentSoft : tokens.pageBg,
                  border: `1px solid ${selectedId === b.id ? tokens.accentSolid : tokens.borderColor}`,
                  opacity: selectable ? 1 : 0.6,
                }}
              >
                <div>
                  <Typography style={{ fontSize: F.small, fontWeight: 600, color: tokens.textPrimary }}>
                    {b.beneficiaryNickname ? `${b.beneficiaryNickname} — ` : ''}{b.beneficiaryAccountName}
                  </Typography>
                  <Typography style={{ fontSize: F.small, color: tokens.textMuted, fontFamily: 'monospace' }}>
                    {bankNameByCode[b.beneficiaryBankCode] ?? b.beneficiaryBankCode} · {b.beneficiaryAccountNumber}
                  </Typography>
                  {!b.isVerified && requireVerified && (
                    <Typography style={{ fontSize: F.small, color: tokens.warning, marginTop: 4 }}>
                      Pending verification — cannot be used for withdrawals yet
                    </Typography>
                  )}
                  {!b.isVerified && !requireVerified && (
                    <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginTop: 4 }}>
                      Not KYC-matched as your own account
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
            );
          })}
        </div>
      )}

      {showAddForm === true && addStep === 'input' && (
        <div className="space-y-12">
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

      {showAddForm === true && addStep === 'preview' && (
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
            onClick={handleUseAccount}
            sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body }}
          >
            {adding ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Use this account'}
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
