import { useState } from 'react';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel } from '@mui/material';
import { toast } from 'react-toastify';
import {
  useChildLogin,
  useDeleteChildLogin,
  usePauseChildLogin,
  useResetChildLogin,
  useResumeChildLogin,
  useTurnOnChildLogin,
} from '../hooks/useEducationRepo';

const card = { background: 'white', borderRadius: 22, border: '1px solid #e5e7eb', marginBottom: 20, overflow: 'hidden' };
const band = { background: 'linear-gradient(135deg,#4338ca,#6d28d9)', color: 'white', padding: '22px 28px', display: 'flex', gap: 16, alignItems: 'center' };
const mono = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: 2 };

// Placeholder wording until counsel approves it (the platform switch stays off until then).
const CONSENT_TEXT = 'I am this child\'s parent or guardian. I agree to the child having a school login, and I will keep the password safe and not share it outside the family.';

const when = (v) => (v ? new Date(v).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null);

const copy = async (text, what) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied`);
  } catch {
    toast.info('Select the text and copy it by hand');
  }
};

function Field({ label, value, big }) {
  return (
    <div style={{ flex: 1, minWidth: 220 }}>
      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#f5f3ff', border: '1px dashed #a78bfa', borderRadius: 14, padding: '12px 16px' }}>
        <span style={{ ...mono, fontWeight: 800, fontSize: big ? '2.4rem' : '2rem', color: '#312e81', flex: 1, wordBreak: 'break-all' }}>{value}</span>
        <Button size="small" onClick={() => copy(value, label)} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '1.4rem' }}>Copy</Button>
      </div>
    </div>
  );
}

/** The one time the password is on screen. Closing it is the guardian's choice; reset gives a new one. */
function Reveal({ name, secret, onDone }) {
  return (
    <div style={{ padding: 28, background: '#fffbeb', borderTop: '1px solid #fde68a' }}>
      <div style={{ fontWeight: 900, fontSize: '2.1rem', color: '#92400e', marginBottom: 6 }}>Give these to {name}. They are shown only once.</div>
      <div style={{ color: '#78350f', fontSize: '1.6rem', marginBottom: 18 }}>
        We do not keep the password. {name} will choose their own the first time they sign in. If this is lost, reset it and you get a new one.
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
        <Field label="Username" value={secret.username} />
        <Field label="One-time password" value={secret.oneTimePassword} big />
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={() => copy(`Username: ${secret.username}\nPassword: ${secret.oneTimePassword}`, 'Both')} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '1.5rem', borderRadius: '12px' }}>Copy both</Button>
        <Button variant="contained" onClick={onDone} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '1.5rem', borderRadius: '12px', background: '#4338ca' }}>I have saved it</Button>
      </div>
    </div>
  );
}

const STATUS_LOOK = {
  ACTIVE: ['Active', '#dcfce7', '#166534'],
  SUSPENDED: ['Paused', '#fef3c7', '#92400e'],
  DISABLED: ['Ended', '#f3f4f6', '#4b5563'],
};

function StatusChip({ account }) {
  const [label, bg, fg] = account.lockedMinutes ? [`Locked for about ${account.lockedMinutes} min`, '#fee2e2', '#991b1b'] : STATUS_LOOK[account.status] ?? STATUS_LOOK.ACTIVE;
  return <span style={{ padding: '6px 14px', borderRadius: 999, fontWeight: 800, fontSize: '1.4rem', background: bg, color: fg }}>{label}</span>;
}

/**
 * The guardian's controls for their child's own school login (civic-61 E3-d2). Hidden unless the child was added through the
 * household and the platform switch is on. Every rule (age, guardianship, consent) is enforced by the server.
 */
export default function StudentLoginSection({ studentId, childName }) {
  const isWard = String(studentId).startsWith('dep:');
  const { data, isError } = useChildLogin(isWard ? studentId : null);
  const turnOn = useTurnOnChildLogin(studentId);
  const reset = useResetChildLogin(studentId);
  const pause = usePauseChildLogin(studentId);
  const resume = useResumeChildLogin(studentId);
  const remove = useDeleteChildLogin(studentId);
  const [agree, setAgree] = useState(false);
  const [secret, setSecret] = useState(null);
  const [confirm, setConfirm] = useState(null);

  if (!isWard || isError || !data?.data?.enabled) return null;

  const { account, minAge } = data.data;
  const name = childName || 'your child';
  const busy = turnOn.isLoading || reset.isLoading || pause.isLoading || resume.isLoading || remove.isLoading;

  const doTurnOn = () => turnOn.mutate(agree, { onSuccess: (r) => { setSecret(r.data); setAgree(false); } });
  const doConfirmed = () => {
    const kind = confirm;
    setConfirm(null);
    if (kind === 'reset') reset.mutate(undefined, { onSuccess: (r) => setSecret(r.data) });
    if (kind === 'delete') remove.mutate(undefined, { onSuccess: () => setSecret(null) });
  };

  return (
    <div style={card}>
      <div style={band}>
        <div style={{ fontSize: '3.6rem', lineHeight: 1 }}>🎒</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: '2.2rem' }}>Student login</div>
          <div style={{ opacity: 0.9, fontSize: '1.55rem' }}>Let {name} sign in to see their own school pages. You stay in control.</div>
        </div>
        {account && <StatusChip account={account} />}
      </div>

      {!account && (
        <div style={{ padding: 28 }}>
          <ul style={{ margin: '0 0 18px', paddingLeft: 22, listStyle: 'disc', color: '#374151', fontSize: '1.7rem', lineHeight: 1.7 }}>
            <li>{name} sees only their own class, timetable, grades, attendance and school notices.</li>
            <li>No payments, voting, posting or anything else on the platform.</li>
            <li>Available for children aged {minAge} and over. You can reset, pause or delete the login at any time.</li>
          </ul>
          <FormControlLabel
            control={<Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />}
            label={<span style={{ fontSize: '1.6rem', color: '#374151' }}>{CONSENT_TEXT}</span>}
            sx={{ alignItems: 'flex-start', mb: 2 }}
          />
          <div>
            <Button variant="contained" disabled={!agree || busy} onClick={doTurnOn} sx={{ textTransform: 'none', fontWeight: 800, fontSize: '1.6rem', borderRadius: '12px', background: '#4338ca', px: 3.5, py: 1.25 }}>
              Turn on {name}'s login
            </Button>
          </div>
        </div>
      )}

      {account && secret && <Reveal name={name} secret={secret} onDone={() => setSecret(null)} />}

      {account && !secret && (
        <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 20 }}>
            <div><div style={{ color: '#6b7280', fontSize: '1.4rem' }}>Username</div><div style={{ ...mono, fontWeight: 800, fontSize: '2rem', color: '#111827' }}>{account.username}</div></div>
            <div><div style={{ color: '#6b7280', fontSize: '1.4rem' }}>Last signed in</div><div style={{ fontWeight: 700, fontSize: '1.8rem', color: '#111827' }}>{when(account.lastLoginAt) ?? 'Not yet'}</div></div>
            <div><div style={{ color: '#6b7280', fontSize: '1.4rem' }}>Password issued</div><div style={{ fontWeight: 700, fontSize: '1.8rem', color: '#111827' }}>{when(account.passwordIssuedAt)}</div></div>
          </div>
          {account.lockedMinutes ? (
            <div style={{ background: '#fef2f2', color: '#991b1b', borderRadius: 12, padding: '12px 16px', fontSize: '1.6rem', marginBottom: 18 }}>
              Too many wrong passwords were tried, so this login is locked. Resetting the password unlocks it straight away.
            </div>
          ) : null}
          {account.status !== 'DISABLED' ? (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="outlined" disabled={busy} onClick={() => setConfirm('reset')} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '1.5rem', borderRadius: '12px' }}>Reset password</Button>
              {account.status === 'SUSPENDED' ? (
                <Button variant="contained" disabled={busy} onClick={() => resume.mutate()} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '1.5rem', borderRadius: '12px', background: '#16a34a' }}>Turn back on</Button>
              ) : (
                <Button variant="outlined" color="warning" disabled={busy} onClick={() => pause.mutate()} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '1.5rem', borderRadius: '12px' }}>Pause login</Button>
              )}
              <Button color="error" disabled={busy} onClick={() => setConfirm('delete')} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '1.5rem' }}>Delete login</Button>
            </div>
          ) : (
            <div style={{ color: '#6b7280', fontSize: '1.6rem' }}>
              This login has ended because {name} is no longer in your household. Delete it to tidy up.
              <div style={{ marginTop: 12 }}><Button color="error" onClick={() => setConfirm('delete')} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '1.5rem' }}>Delete login</Button></div>
            </div>
          )}
        </div>
      )}

      <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '2rem' }}>{confirm === 'delete' ? 'Delete this login?' : 'Reset the password?'}</DialogTitle>
        <DialogContent sx={{ fontSize: '1.6rem', color: '#374151' }}>
          {confirm === 'delete'
            ? `${name} will be signed out and the login removed for good. Their school record is not touched, and you can make a new login later.`
            : `${name} will be signed out and the old password stops working. You will get a new one-time password to give them.`}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)} sx={{ textTransform: 'none', fontSize: '1.5rem' }}>Cancel</Button>
          <Button variant="contained" color={confirm === 'delete' ? 'error' : 'primary'} onClick={doConfirmed} sx={{ textTransform: 'none', fontSize: '1.5rem', fontWeight: 700 }}>
            {confirm === 'delete' ? 'Delete login' : 'Reset password'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
