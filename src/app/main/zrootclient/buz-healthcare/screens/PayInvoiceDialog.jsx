import { useRef, useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { naira, nairaToKobo, walletPayState } from '../careRules';
import { usePayInvoice } from '../hooks/useHealthcareRepo';

const newKey = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pay-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

/** Pay (part of) a clinic bill from the health wallet. One request key per opening, so a double tap or a retry never pays twice. */
export default function PayInvoiceDialog({ invoice, wallet, paymentsReady, forDependant, onClose }) {
  const payableKobo = Number(invoice?.walletPayableKobo ?? 0);
  const [amount, setAmount] = useState(String(payableKobo / 100));
  const [pin, setPin] = useState('');
  const key = useRef(newKey());
  const pay = usePayInvoice(forDependant);
  const kobo = nairaToKobo(amount);
  const state = walletPayState({ paymentsReady, open: wallet?.open, balanceKobo: wallet?.balanceKobo, wantKobo: kobo });
  const tooMuch = kobo != null && kobo > payableKobo;
  const go = () => pay.mutate(
    { invoiceId: invoice.id, amountKobo: String(kobo), requestId: key.current, transactionPin: pin },
    { onSuccess: onClose, onError: () => { key.current = newKey(); } },
  );
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Pay from your health wallet</DialogTitle>
      <DialogContent style={{ paddingTop: 8 }}>
        <p style={{ marginTop: 0 }} data-testid="pay-summary">
          {invoice.facilityName}: {naira(invoice.owedKobo)} is owed. Your health wallet has {naira(wallet?.balanceKobo)}. The clinic is paid once it closes your visit; until then it is held safely.
        </p>
        <TextField label="Amount (₦)" value={amount} onChange={(e) => setAmount(e.target.value)} fullWidth inputProps={{ inputMode: 'decimal' }} error={tooMuch} helperText={tooMuch ? `At most ${naira(payableKobo)}` : ' '} />
        <TextField label="Transaction PIN" type="password" value={pin} fullWidth onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} inputProps={{ inputMode: 'numeric', autoComplete: 'off' }} />
        {!state.ok && kobo != null && <div style={{ color: '#b45309', marginTop: 8 }} data-testid="pay-blocked">{state.reason}</div>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!state.ok || tooMuch || pin.length < 4 || pay.isLoading} onClick={go}>
          {pay.isLoading ? <CircularProgress size={18} color="inherit" /> : kobo ? `Pay ${naira(kobo)}` : 'Pay'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
