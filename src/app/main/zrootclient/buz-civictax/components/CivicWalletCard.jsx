import { memo, useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import { useMyCivicWallet, useSpendingBalance, useFundCivicWallet, useWithdrawCivicWallet } from '../hooks/useCivicTaxRepo';

const F = { meta: 'clamp(1.2rem, 1.8vw, 1.5rem)', body: 'clamp(1.3rem, 2vw, 1.64rem)', big: 'clamp(2rem, 4vw, 3rem)' };
const naira = (n) => `₦${Number(n || 0).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;

function MoveDialog({ mode, onClose, accountNumber, civicBalance, spendingBalance }) {
  const fund = useFundCivicWallet();
  const withdraw = useWithdrawCivicWallet();
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const isFund = mode === 'fund';
  const move = isFund ? fund : withdraw;
  const max = isFund ? spendingBalance : civicBalance;
  let actionLabel = 'Move back';
  if (move.isLoading) actionLabel = null;
  else if (isFund) actionLabel = 'Fund';
  const valid = Number(amount) > 0 && Number(amount) <= max && pin.length >= 4;

  const submit = () => move.mutate({ accountNumber, amountNaira: Number(amount), pin }, { onSuccess: () => { setAmount(''); setPin(''); onClose(); } });

  return (
    <Dialog open={Boolean(mode)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isFund ? 'Fund your civic wallet' : 'Move money back to your spending wallet'}</DialogTitle>
      <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
        <div style={{ fontSize: F.meta, color: '#6b7280' }}>
          {isFund ? `From your spending wallet (${naira(spendingBalance)} available). Civic subscriptions and campaign contributions are paid from the civic wallet.` : `Your civic wallet has ${naira(civicBalance)}.`}
        </div>
        <TextField label="Amount (₦)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus
          error={Number(amount) > max} helperText={Number(amount) > max ? `You only have ${naira(max)} here` : ' '} />
        <TextField label="Transaction PIN" type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputProps={{ inputMode: 'numeric', autoComplete: 'off' }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={!valid || move.isLoading}
          sx={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', fontWeight: 800, textTransform: 'none' }}>
          {move.isLoading ? <CircularProgress size={18} color="inherit" /> : actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** The citizen's civic wallet: balance, fund from the spending wallet, and move money back. Opened automatically. */
function CivicWalletCard() {
  const { data: wallet, isLoading } = useMyCivicWallet();
  const { data: spending = 0 } = useSpendingBalance();
  const [mode, setMode] = useState(null);

  return (
    <div style={{ borderRadius: 20, background: 'white', border: '1.5px solid #fdba74', padding: 'clamp(14px, 2vw, 20px)', marginBottom: 'clamp(16px, 2.4vw, 24px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <AccountBalanceWallet style={{ color: '#ea580c', fontSize: 'clamp(28px, 4vw, 40px)' }} />
        <div>
          <div style={{ fontSize: F.meta, color: '#6b7280', fontWeight: 600 }}>Civic wallet</div>
          {isLoading ? <CircularProgress size={20} /> : <div style={{ fontWeight: 900, fontSize: F.big, color: '#1f2937', lineHeight: 1.1 }}>{naira(wallet?.balance)}</div>}
          <div style={{ fontSize: F.meta, color: '#9ca3af' }}>Spending wallet: {naira(spending)}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button variant="contained" disabled={!wallet?.accountNumber} onClick={() => setMode('fund')}
          sx={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', fontWeight: 800, borderRadius: '12px', textTransform: 'none' }}>
          Fund civic wallet
        </Button>
        <Button variant="outlined" disabled={!wallet?.accountNumber || !wallet?.balance} onClick={() => setMode('withdraw')}
          sx={{ borderColor: '#fdba74', color: '#ea580c', fontWeight: 700, borderRadius: '12px', textTransform: 'none' }}>
          Move back to spending
        </Button>
      </div>
      <MoveDialog mode={mode} onClose={() => setMode(null)} accountNumber={wallet?.accountNumber} civicBalance={wallet?.balance ?? 0} spendingBalance={spending} />
    </div>
  );
}

export default memo(CivicWalletCard);
