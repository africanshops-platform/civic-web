import { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { naira, nairaToKobo } from '../careRules';
import { useFundHealthWallet, useHealthWallet, useHealthWalletReadiness, useOpenHealthWallet, useWithdrawHealthWallet } from '../hooks/useHealthcareRepo';

const card = { background: 'white', borderRadius: 16, padding: 18, border: '1px solid #e5e7eb', marginBottom: 12 };

/** Add money to, or take unspent money back from, the health wallet. Both need the transaction PIN. */
function MoveDialog({ kind, open, onClose, balanceKobo }) {
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const fund = useFundHealthWallet();
  const withdraw = useWithdrawHealthWallet();
  const op = kind === 'fund' ? fund : withdraw;
  const kobo = nairaToKobo(amount);
  const tooMuch = kind === 'withdraw' && kobo != null && kobo > Number(balanceKobo ?? 0);
  const send = () => op.mutate({ amountKobo: kobo, transactionPin: pin }, { onSuccess: () => { setAmount(''); setPin(''); onClose(); } });
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{kind === 'fund' ? 'Add money to your health wallet' : 'Move money back to your wallet'}</DialogTitle>
      <DialogContent style={{ paddingTop: 8 }}>
        <p style={{ marginTop: 0 }}>
          {kind === 'fund' ? 'The money comes from your wallet and can only be used to pay clinic bills. You can move what you have not spent back at any time.' : `You have ${naira(balanceKobo)} in your health wallet.`}
        </p>
        <TextField label="Amount (₦)" value={amount} onChange={(e) => setAmount(e.target.value)} fullWidth inputProps={{ inputMode: 'decimal' }} error={tooMuch} helperText={tooMuch ? 'That is more than you have here.' : ' '} />
        <TextField label="Transaction PIN" type="password" value={pin} fullWidth onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} inputProps={{ inputMode: 'numeric', autoComplete: 'off' }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={kobo == null || tooMuch || pin.length < 4 || op.isLoading} onClick={send}>
          {op.isLoading ? <CircularProgress size={18} color="inherit" /> : kind === 'fund' ? 'Add money' : 'Move back'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** The person's health wallet at the top of Bills. Shows nothing at all until the platform switches the feature on. */
export default function HealthWalletCard() {
  const wallet = useHealthWallet();
  const ready = useHealthWalletReadiness(Boolean(wallet.data?.enabled));
  const open = useOpenHealthWallet();
  const [dialog, setDialog] = useState(null);
  if (!wallet.data?.enabled) return null;
  const paymentsDown = ready.data?.healthy === false;
  return (
    <div style={card} data-testid="health-wallet-card">
      <b>Health wallet</b>
      {wallet.data.open ? (
        <>
          <div style={{ fontSize: '2.4rem', fontWeight: 800 }}>{naira(wallet.data.balanceKobo)}</div>
          <div style={{ color: '#6b7280', fontSize: '1.4rem', marginBottom: 8 }}>Set aside for clinic bills. You pay a bill from here, and the clinic is paid once the visit is closed.</div>
          <Button size="small" variant="contained" disabled={paymentsDown} onClick={() => setDialog('fund')} style={{ marginRight: 8 }}>Add money</Button>
          <Button size="small" variant="outlined" disabled={paymentsDown} onClick={() => setDialog('withdraw')}>Move back</Button>
          {paymentsDown && <div style={{ color: '#b45309', fontSize: '1.4rem', marginTop: 8 }} data-testid="wallet-down">Payments are temporarily unavailable. Please try again in a moment.</div>}
          <MoveDialog kind={dialog ?? 'fund'} open={Boolean(dialog)} onClose={() => setDialog(null)} balanceKobo={wallet.data.balanceKobo} />
        </>
      ) : (
        <>
          <div style={{ color: '#6b7280', fontSize: '1.4rem', margin: '4px 0 8px' }}>Open a wallet just for clinic bills, add money when you like, and pay a bill in one tap.</div>
          <Button size="small" variant="contained" disabled={paymentsDown || open.isLoading} onClick={() => open.mutate()}>
            {open.isLoading ? <CircularProgress size={18} color="inherit" /> : 'Open health wallet'}
          </Button>
        </>
      )}
    </div>
  );
}
