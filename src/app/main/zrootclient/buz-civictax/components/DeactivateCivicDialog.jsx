import { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useDeactivationPreview, useRefundPrepaid, useDeactivateCivic, useWithdrawCivicWallet } from '../hooks/useCivicTaxRepo';
import PinPrompt from './PinPrompt';

const naira = (n) => `₦${Number(n || 0).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
const koboToNaira = (k) => Number(k || 0) / 100;

function Step({ n, done, title, detail, action }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ width: 28, height: 28, borderRadius: 14, background: done ? '#16a34a' : '#fed7aa', color: done ? 'white' : '#9a3412', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>{done ? '✓' : n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>{detail}</div>
      </div>
      {action}
    </div>
  );
}

/** Guided deactivation: nothing is stranded — prepaid months are refunded, the civic wallet is emptied, then the profile is deactivated. */
export default function DeactivateCivicDialog({ open, onClose, onDone }) {
  const { data: preview, isLoading } = useDeactivationPreview(open);
  const refund = useRefundPrepaid();
  const withdraw = useWithdrawCivicWallet();
  const deactivate = useDeactivateCivic();
  const [askPin, setAskPin] = useState(false);

  const heldKobo = koboToNaira(preview?.heldPrepaid?.totalKobo);
  const heldCount = (preview?.heldPrepaid?.months ?? []).length;
  const balance = preview?.civicWallet?.balance ?? 0;
  const account = preview?.civicWallet?.accountNumber;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Deactivate your civic profile</DialogTitle>
      <DialogContent>
        {isLoading ? <CircularProgress size={24} /> : (
          <>
            <div style={{ fontSize: 14, color: '#4b5563', marginBottom: 8 }}>
              Before you deactivate, all your money comes back to your spending wallet. Future unpaid months are cancelled. You can become a civic user again later and your subscription calendar restarts from that day.
            </div>
            <Step n={1} done={heldCount === 0} title="Prepaid months" detail={heldCount === 0 ? 'Nothing is held.' : `${heldCount} month(s) paid ahead (${naira(heldKobo)}) will be returned to your civic wallet.`}
              action={heldCount > 0 && <Button size="small" variant="contained" disabled={refund.isLoading} onClick={() => refund.mutate()}>{refund.isLoading ? '…' : 'Return'}</Button>} />
            <Step n={2} done={balance === 0 && heldCount === 0} title="Civic wallet" detail={balance === 0 ? 'Your civic wallet is empty.' : `${naira(balance)} will move back to your spending wallet.`}
              action={balance > 0 && heldCount === 0 && <Button size="small" variant="contained" onClick={() => setAskPin(true)}>Move back</Button>} />
            <Step n={3} done={false} title="Deactivate" detail={preview?.unpaidPastDueMonths ? `You still have ${preview.unpaidPastDueMonths} unpaid past month(s) on record.` : 'Your civic profile is removed; your history is kept.'}
              action={<Button size="small" color="error" variant="contained" disabled={!preview?.canDeactivate || deactivate.isLoading} onClick={() => deactivate.mutate(undefined, { onSuccess: () => { onClose(); onDone?.(); } })}>{deactivate.isLoading ? '…' : 'Deactivate'}</Button>} />
          </>
        )}
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
      <PinPrompt open={askPin} title="Move money back" onClose={() => setAskPin(false)}
        onConfirm={(pin) => withdraw.mutate({ accountNumber: account, amountNaira: balance, pin }, { onSuccess: () => setAskPin(false) })} busy={withdraw.isLoading} />
    </Dialog>
  );
}
