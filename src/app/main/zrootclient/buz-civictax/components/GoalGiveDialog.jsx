import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useCivicSubscriptionsReadiness, useGiveToGoal } from '../hooks/useCivicTaxRepo';
import { MIN_GIFT_NAIRA } from '../goalFunding';

const PRESETS = [500, 1000, 5000, 10000];

/** A voluntary gift to a goal. Fails closed: the button stays off while payment services are not ready. */
export default function GoalGiveDialog({ goal, onClose, toLga = false }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const give = useGiveToGoal();
  const readiness = useCivicSubscriptionsReadiness();
  const down = readiness.data?.healthy === false;
  const value = parseInt(amount, 10);
  const valid = Number.isFinite(value) && value >= MIN_GIFT_NAIRA;

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{toLga ? `Give to ${goal.lga} local government` : `Give to ${goal.goal?.title} · ${goal.lga}`}</DialogTitle>
      <DialogContent className="flex flex-col gap-3" style={{ paddingTop: 8 }}>
        {give.isSuccess ? (
          <Alert severity="success">Thank you. Your gift was received and will go to {toLga ? 'your local government' : 'this goal'}.</Alert>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PRESETS.map((p) => (
                <Button key={p} size="small" variant={String(p) === amount ? 'contained' : 'outlined'} onClick={() => setAmount(String(p))}>
                  ₦{p.toLocaleString()}
                </Button>
              ))}
            </div>
            <TextField label="Amount (₦)" size="small" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} />
            <TextField label="A note (optional)" size="small" value={note} onChange={(e) => setNote(e.target.value)} inputProps={{ maxLength: 200 }} />
            <small style={{ color: '#6b7280' }}>
              This is a voluntary gift from your civic wallet{toLga ? ', to the local government\'s own revenue wallet (not a subscription)' : ''}. It is not part of your subscription and cannot be refunded.
            </small>
            {down && <Alert severity="warning">Payments are temporarily unavailable. Please try again shortly.</Alert>}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{give.isSuccess ? 'Close' : 'Cancel'}</Button>
        {!give.isSuccess && (
          <Button
            variant="contained"
            disabled={!valid || down || give.isLoading}
            onClick={() => give.mutate(toLga ? { state: goal.state, lga: goal.lga, amount: value, note } : { adoptionId: goal.id, amount: value, note })}
          >
            {give.isLoading ? 'Giving…' : `Give ₦${valid ? value.toLocaleString() : ''}`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
