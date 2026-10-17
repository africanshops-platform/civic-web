import { useState } from 'react';
import { Button, CircularProgress, TextField } from '@mui/material';
import useAuth from '../../../../auth/useAuth';
import { useClaimComplete, useClaimStart, useClaimStatus } from './useStudentApi';

const shell = { minHeight: '100vh', background: 'linear-gradient(160deg,#312e81 0%,#4f46e5 45%,#7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
const card = { background: 'white', borderRadius: 28, padding: '38px 34px', width: '100%', maxWidth: 520, boxShadow: '0 25px 60px rgba(30,27,75,.45)' };
const big = { background: '#4338ca', color: '#fff', '&:hover': { background: '#3730a3' }, '&.Mui-disabled': { color: '#fff', opacity: 0.45, background: '#4338ca' }, textTransform: 'none', fontWeight: 800, fontSize: '1.8rem', borderRadius: '14px', py: 1.5 };

/**
 * A student who turned 18 makes the account their own (civic-61 E3-d4): an email address of their own proved with a code, a password
 * only they know, and their name. They have 90 days; nothing else on the student pages opens until this is done.
 */
export default function StudentClaimPage() {
  const { signOut } = useAuth();
  const status = useClaimStatus();
  const start = useClaimStart();
  const complete = useClaimComplete();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [name, setName] = useState(null);
  const [done, setDone] = useState(null);

  const s = status.data?.data;
  const fullName = name ?? s?.fullName ?? '';
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const completeOk = code.length === 6 && password.length >= 8 && password === again && fullName.trim().length >= 2;

  if (status.isLoading) return <div style={{ ...shell, color: 'white' }}><CircularProgress color="inherit" /></div>;

  if (status.isError) {
    return (
      <div style={shell}>
        <div style={card}>
          <h1 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: '2.6rem', color: '#1e1b4b' }}>This login can not be claimed</h1>
          <p style={{ color: '#6b7280', fontSize: '1.6rem' }}>{status.error?.response?.data?.message ?? 'Please ask your school or support to help.'}</p>
          <Button onClick={signOut} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '1.6rem' }}>Sign out</Button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div style={shell}>
        <div style={card}>
          <div style={{ fontSize: '5rem', lineHeight: 1 }}>🎉</div>
          <h1 style={{ margin: '12px 0 6px', fontWeight: 900, fontSize: '3rem', color: '#1e1b4b' }}>The account is yours</h1>
          <p style={{ color: '#374151', fontSize: '1.7rem' }}>
            From now on you sign in with <b>{done.email}</b> and the password you just chose. Your school record is now under your own account, and your parent or guardian can no longer see it.
          </p>
          {!done.schoolLinked && <p style={{ color: '#92400e', background: '#fffbeb', borderRadius: 12, padding: '10px 14px', fontSize: '1.5rem' }}>Your school record will move across within a day.</p>}
          <Button fullWidth variant="contained" onClick={signOut} sx={{ ...big, mt: 2 }}>Go to sign in</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={shell}>
      <form
        style={card}
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 1 && emailOk) start.mutate({ email: email.trim() }, { onSuccess: () => setStep(2) });
          if (step === 2 && completeOk) complete.mutate({ code, newPassword: password, fullName: fullName.trim() }, { onSuccess: (r) => setDone(r.data) });
        }}
      >
        <div style={{ fontSize: '5rem', lineHeight: 1 }}>🎂</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: 2, color: '#6366f1', marginTop: 8 }}>STEP {step} OF 2</div>
        <h1 style={{ margin: '4px 0 6px', fontWeight: 900, fontSize: '3rem', color: '#1e1b4b' }}>You are 18: claim your account</h1>
        <p style={{ margin: '0 0 22px', color: '#6b7280', fontSize: '1.6rem' }}>
          This login was set up by your parent or guardian. Make it your own with an email address and a password only you know.
          {s?.daysLeft != null && <> You have <b>{s.daysLeft} days</b> left to do this.</>}
        </p>

        {step === 1 && (
          <>
            <TextField fullWidth type="email" label="Your own email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" helperText="We send a 6-digit code to prove it is yours." sx={{ mb: 3 }} />
            <Button type="submit" fullWidth variant="contained" disabled={!emailOk || start.isLoading} sx={big}>{start.isLoading ? 'Sending…' : 'Send me the code'}</Button>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ margin: '0 0 14px', color: '#374151', fontSize: '1.5rem' }}>We sent a code to <b>{email.trim()}</b>. It works for 15 minutes.</p>
            <TextField fullWidth label="The 6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputProps={{ inputMode: 'numeric', style: { letterSpacing: 6, fontSize: '2rem' } }} sx={{ mb: 2 }} />
            <TextField fullWidth label="Your name" value={fullName} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth type="password" label="Your new password (8 or more characters)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" sx={{ mb: 2 }} />
            <TextField fullWidth type="password" label="Type the new password again" value={again} onChange={(e) => setAgain(e.target.value)} error={Boolean(again) && again !== password} helperText={again && again !== password ? 'The two passwords are not the same' : ' '} sx={{ mb: 1 }} />
            <Button type="submit" fullWidth variant="contained" disabled={!completeOk || complete.isLoading} sx={big}>{complete.isLoading ? 'Saving…' : 'Make this account mine'}</Button>
            <Button onClick={() => setStep(1)} sx={{ mt: 1, textTransform: 'none', fontWeight: 700, fontSize: '1.5rem' }}>Use a different email</Button>
          </>
        )}
      </form>
    </div>
  );
}
