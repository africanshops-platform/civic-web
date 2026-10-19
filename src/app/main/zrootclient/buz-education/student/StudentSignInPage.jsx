import { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { useStudentSignIn } from './useStudentApi';

const shell = { minHeight: '100vh', background: 'linear-gradient(160deg,#312e81 0%,#4f46e5 45%,#7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
const card = { background: 'white', borderRadius: 28, padding: '40px 36px', width: '100%', maxWidth: 460, boxShadow: '0 25px 60px rgba(30,27,75,.45)' };

/** A child's own sign-in: the school username and the password their parent or guardian gave them. */
export default function StudentSignInPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const signIn = useStudentSignIn();
  const ready = username.trim().length >= 4 && password.length >= 6;

  const submit = (e) => {
    e.preventDefault();
    if (ready) signIn.mutate({ username: username.trim(), password });
  };

  return (
    <div style={shell}>
      <form style={card} onSubmit={submit}>
        <div style={{ fontSize: '5.2rem', lineHeight: 1 }}>🎒</div>
        <h1 style={{ margin: '14px 0 4px', fontWeight: 900, fontSize: '3.2rem', color: '#1e1b4b' }}>Student sign in</h1>
        <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: '1.7rem' }}>See your class, timetable, grades and school notices.</p>
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          autoComplete="username"
          inputProps={{ 'aria-label': 'Username', style: { fontSize: '1.9rem', letterSpacing: 2 } }}
          helperText="Your school number, for example GRS260002"
          sx={{ mb: 2.5 }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          inputProps={{ style: { fontSize: '1.9rem' } }}
          sx={{ mb: 3 }}
        />
        <Button type="submit" fullWidth variant="contained" disabled={!ready || signIn.isLoading} sx={{ background: '#4338ca', color: '#fff', '&:hover': { background: '#3730a3' }, '&.Mui-disabled': { color: '#fff', opacity: 0.45, background: '#4338ca' }, textTransform: 'none', fontWeight: 800, fontSize: '1.9rem', borderRadius: '14px', py: 1.6 }}>
          {signIn.isLoading ? 'Signing in…' : 'Sign in'}
        </Button>
        <p style={{ margin: '22px 0 0', color: '#6b7280', fontSize: '1.45rem', textAlign: 'center' }}>
          Forgot your password? Ask your parent or guardian to reset it for you.
        </p>
      </form>
    </div>
  );
}
