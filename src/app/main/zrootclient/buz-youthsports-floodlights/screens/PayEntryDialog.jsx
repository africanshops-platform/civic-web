import { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { naira } from '../entryTerms';

/** Takes the entry fee of a paid tournament: shows what will be charged and asks for the transaction PIN. */
export default function PayEntryDialog({ open, tournament, onClose, onConfirm, busy, balanceNaira }) {
  const [pin, setPin] = useState('');
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Pay {naira(tournament?.entryFeeKobo)} to enter</DialogTitle>
      <DialogContent style={{ paddingTop: 8 }}>
        <p style={{ marginTop: 0 }} data-testid="pay-summary">
          {tournament?.name}: {naira(tournament?.entryFeeKobo)} is taken from your wallet
          {typeof balanceNaira === 'number' ? ` (balance ${naira(balanceNaira * 100)})` : ''}. Your place is held while you pay.
        </p>
        <TextField
          label="Transaction PIN"
          type="password"
          value={pin}
          autoFocus
          fullWidth
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputProps={{ inputMode: 'numeric', autoComplete: 'off' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={pin.length < 4 || busy} onClick={() => { onConfirm(pin); setPin(''); }}>
          {busy ? <CircularProgress size={18} color="inherit" /> : `Pay ${naira(tournament?.entryFeeKobo)}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
