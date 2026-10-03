import { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

/** Small PIN entry dialog. */
export default function PinPrompt({ open, title, onClose, onConfirm, busy }) {
  const [pin, setPin] = useState('');
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent style={{ paddingTop: 8 }}>
        <TextField label="Transaction PIN" type="password" value={pin} autoFocus fullWidth
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} inputProps={{ inputMode: 'numeric', autoComplete: 'off' }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={pin.length < 4 || busy} onClick={() => { onConfirm(pin); setPin(''); }}>{busy ? <CircularProgress size={18} color="inherit" /> : 'Confirm'}</Button>
      </DialogActions>
    </Dialog>
  );
}
