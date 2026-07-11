import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { useWallets, useOpenWallet, useCrossCurrencyTransfer, CURRENCIES, CURRENCY_SYMBOLS } from '../hooks/useFintechApi';
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
  };
}

// Per-currency gradient cards stay deliberately colorful — full-bleed gradient
// with white text works on any page background, same pattern as the hero card.
const WALLET_COLORS = {
  NGN: ['#f97316', '#ea580c'], GHS: ['#059669', '#047857'], KES: ['#dc2626', '#b91c1c'],
  ZAR: ['#2563eb', '#1d4ed8'], UGX: ['#7c3aed', '#6d28d9'], TZS: ['#0891b2', '#0e7490'],
  XOF: ['#d97706', '#b45309'], XAF: ['#16a34a', '#15803d'], EGP: ['#dc2626', '#991b1b'],
  MAD: ['#9333ea', '#7e22ce'],
};

function WalletCard({ wallet, index }) {
  const colors = WALLET_COLORS[wallet?.currency] ?? ['#6366f1', '#4f46e5'];
  const symbol = CURRENCY_SYMBOLS[wallet?.currency] ?? wallet?.currency;
  const balance = parseFloat(wallet?.balance ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl p-20 relative overflow-hidden cursor-default"
      style={{ background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-16">
          <div>
            <Typography className="font-bold uppercase tracking-widest" style={{ fontSize: F.small, color: 'rgba(255,255,255,0.7)' }}>{wallet?.currency}</Typography>
            <Typography style={{ fontSize: F.small, color: 'rgba(255,255,255,0.55)' }}>{wallet?.accountType ?? 'Multi-Currency'}</Typography>
          </div>
          <div className="w-40 h-40 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
            <Typography style={{ fontSize: F.body, fontWeight: 700, color: 'white' }}>{symbol}</Typography>
          </div>
        </div>

        <Typography style={{ fontSize: F.amountLg, fontWeight: 800, color: 'white', marginBottom: 4 }}>
          {symbol}{balance.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>

        {wallet?.isFrozen && (
          <div className="flex items-center gap-6 mt-8 rounded-lg px-10 py-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <FuseSvgIcon size={14} className="text-white">heroicons-solid:lock-closed</FuseSvgIcon>
            <Typography style={{ fontSize: F.small, color: 'white' }}>Frozen</Typography>
          </div>
        )}

        <Typography className="truncate mt-10" style={{ fontSize: F.small, color: 'rgba(255,255,255,0.5)' }}>
          {wallet?.walletId ?? '—'}
        </Typography>
      </div>
    </motion.div>
  );
}

export default function FinanceWalletsContent() {
  const { account } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow };
  const dialogPaperSx = { borderRadius: '24px', background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, overflow: 'hidden' };
  const { data: wallets, isLoading, refetch } = useWallets(account?.accountNumber);
  const { mutate: openWallet, isLoading: opening } = useOpenWallet();
  const { mutate: crossTransfer, isLoading: transferring } = useCrossCurrencyTransfer();

  const [openDialog, setOpenDialog] = useState(false);
  const [transferDialog, setTransferDialog] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [openError, setOpenError] = useState('');
  const [openSuccess, setOpenSuccess] = useState('');

  const [xfer, setXfer] = useState({ receiverAccountNumber: '', senderCurrency: 'NGN', receiverCurrency: 'GHS', senderAmountNGN: '', description: '' });
  const [xferError, setXferError] = useState('');
  const [xferSuccess, setXferSuccess] = useState('');

  const walletList = wallets?.wallets ?? wallets ?? [];
  const existingCurrencies = walletList.map(w => w?.currency);

  async function handleOpenWallet() {
    setOpenError('');
    try {
      await openWallet(account?.accountNumber, selectedCurrency);
      setOpenSuccess(`${selectedCurrency} wallet opened!`);
      refetch();
      setTimeout(() => { setOpenDialog(false); setOpenSuccess(''); setSelectedCurrency(''); }, 1500);
    } catch (err) {
      setOpenError(err.message);
    }
  }

  async function handleCrossTransfer() {
    setXferError('');
    try {
      await crossTransfer({
        senderAccountNumber: account?.accountNumber,
        receiverAccountNumber: xfer.receiverAccountNumber,
        senderCurrency: xfer.senderCurrency,
        receiverCurrency: xfer.receiverCurrency,
        senderAmountKobo: Math.round(parseFloat(xfer.senderAmountNGN || 0) * 100),
        idempotencyKey: `XFX-${crypto.randomUUID()}`,
        description: xfer.description,
      });
      setXferSuccess('Cross-currency transfer sent!');
      setTimeout(() => {
        setTransferDialog(false);
        setXferSuccess('');
        setXfer({ receiverAccountNumber: '', senderCurrency: 'NGN', receiverCurrency: 'GHS', senderAmountNGN: '', description: '' });
      }, 1800);
    } catch (err) {
      setXferError(err.message);
    }
  }

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <div className="flex items-center justify-between mb-28">
        <div>
          <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>Multi-Currency Wallets</Typography>
          <Typography style={{ fontSize: F.body, color: tokens.textMuted }}>Manage your African currency accounts</Typography>
        </div>
        <div className="flex gap-10">
          <Button
            onClick={() => setTransferDialog(true)}
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrows-right-left</FuseSvgIcon>}
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: F.label,
              color: tokens.info, border: `1px solid ${tokens.info}55`,
              background: tokens.infoBg,
              '&:hover': { background: tokens.infoBg, border: `1px solid ${tokens.info}` },
            }}
          >
            Cross Transfer
          </Button>
          <Button
            onClick={() => setOpenDialog(true)}
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
            variant="contained"
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: F.label,
              background: tokens.accentGradient,
            }}
          >
            New Wallet
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
          {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: '16px' }} />)}
        </div>
      ) : walletList.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-48 rounded-3xl" style={card}>
          <FuseSvgIcon size={48} style={{ color: tokens.textMuted, margin: '0 auto 16px', display: 'block' }}>heroicons-outline:wallet</FuseSvgIcon>
          <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary, marginBottom: 8 }}>No wallets yet</Typography>
          <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginBottom: 20 }}>Open your first currency wallet to get started</Typography>
          <Button onClick={() => setOpenDialog(true)} variant="contained" sx={{ background: tokens.accentGradient, borderRadius: '12px', textTransform: 'none', fontWeight: 700, fontSize: F.body }}>Open First Wallet</Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
          {walletList.map((w, i) => <WalletCard key={w?.walletId ?? i} wallet={w} index={i} />)}
        </div>
      )}

      {/* Open Wallet Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => { setOpenDialog(false); setOpenError(''); setOpenSuccess(''); setSelectedCurrency(''); }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>Open New Wallet</Typography>
          <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginBottom: 20 }}>Select a currency for your new wallet</Typography>
          <div className="grid grid-cols-4 gap-8 mb-20">
            {CURRENCIES.filter(c => !existingCurrencies.includes(c)).map(c => (
              <button
                key={c}
                onClick={() => setSelectedCurrency(c)}
                className="rounded-xl py-10 text-center cursor-pointer transition-all duration-150"
                style={{
                  background: selectedCurrency === c ? `${WALLET_COLORS[c]?.[0]}22` : tokens.pageBg,
                  border: `1px solid ${selectedCurrency === c ? (WALLET_COLORS[c]?.[0] ?? tokens.accentSolid) : tokens.borderColor}`,
                }}
              >
                <Typography style={{ fontSize: F.small, fontWeight: 700, color: selectedCurrency === c ? (WALLET_COLORS[c]?.[0] ?? tokens.accentSolid) : tokens.textSecondary }}>{c}</Typography>
                <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>{CURRENCY_SYMBOLS[c]}</Typography>
              </button>
            ))}
          </div>
          {openSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px', background: tokens.successBg, color: tokens.success, fontSize: F.small }}>{openSuccess}</Alert>}
          {openError && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', background: tokens.dangerBg, color: tokens.danger, fontSize: F.small }}>{openError}</Alert>}
          <Button
            variant="contained"
            fullWidth
            disabled={!selectedCurrency || opening}
            onClick={handleOpenWallet}
            sx={{ background: tokens.accentGradient, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}
          >
            {opening ? <CircularProgress size={20} sx={{ color: 'white' }} /> : `Open ${selectedCurrency || 'Wallet'}`}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Cross Transfer Dialog */}
      <Dialog
        open={transferDialog}
        onClose={() => { setTransferDialog(false); setXferError(''); setXferSuccess(''); }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary, marginBottom: 4 }}>Cross-Currency Transfer</Typography>
          <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginBottom: 20 }}>Send money across different currencies</Typography>
          <div className="space-y-12">
            <TextField label="Receiver Account Number" value={xfer.receiverAccountNumber} onChange={e => setXfer(f => ({ ...f, receiverAccountNumber: e.target.value }))} fullWidth size="small" sx={fieldSx(tokens)} />
            <div className="grid grid-cols-2 gap-10">
              {['senderCurrency', 'receiverCurrency'].map(key => (
                <div key={key}>
                  <Typography style={{ fontSize: F.small, color: tokens.textMuted, marginBottom: 6 }}>{key === 'senderCurrency' ? 'From' : 'To'}</Typography>
                  <div className="flex flex-wrap gap-4">
                    {CURRENCIES.map(c => (
                      <button key={c} onClick={() => setXfer(f => ({ ...f, [key]: c }))} className="rounded-lg px-8 py-4 cursor-pointer transition-all"
                        style={{ fontSize: F.small, background: xfer[key] === c ? tokens.accentSoft : tokens.pageBg, border: `1px solid ${xfer[key] === c ? tokens.accentSolid : tokens.borderColor}`, color: xfer[key] === c ? tokens.accentSolid : tokens.textSecondary, fontWeight: xfer[key] === c ? 700 : 400 }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <TextField label={`Amount (${xfer.senderCurrency})`} value={xfer.senderAmountNGN} onChange={e => setXfer(f => ({ ...f, senderAmountNGN: e.target.value.replace(/[^0-9.]/g, '') }))} fullWidth size="small" sx={fieldSx(tokens)} />
            <TextField label="Description" value={xfer.description} onChange={e => setXfer(f => ({ ...f, description: e.target.value }))} fullWidth size="small" sx={fieldSx(tokens)} />
          </div>
          {xferSuccess && <Alert severity="success" sx={{ mt: 2, borderRadius: '10px', background: tokens.successBg, color: tokens.success, fontSize: F.small }}>{xferSuccess}</Alert>}
          {xferError && <Alert severity="error" sx={{ mt: 2, borderRadius: '10px', background: tokens.dangerBg, color: tokens.danger, fontSize: F.small }}>{xferError}</Alert>}
          <Button
            variant="contained"
            fullWidth
            disabled={!xfer.receiverAccountNumber || !xfer.senderAmountNGN || transferring}
            onClick={handleCrossTransfer}
            sx={{ mt: 2, background: `linear-gradient(135deg, ${tokens.info} 0%, #1e3a8a 100%)`, borderRadius: '12px', fontWeight: 700, py: 1.5, textTransform: 'none', fontSize: F.body, '&:disabled': { background: tokens.borderColor, color: tokens.textMuted } }}
          >
            {transferring ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Send Transfer'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
