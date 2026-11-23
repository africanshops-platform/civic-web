import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useVerify2faLogin } from 'app/configs/data/server-calls/auth/admin-auth';
import { cleanTwoFactorCode, twoFactorCodeProblem } from '../twoFactorLogin';

/**
 * The second step of sign-in for an account with the authenticator on. Only a correct code (or an unused backup code) creates the session;
 * on success the mutation stores it and the page reloads, exactly like a password-only sign-in.
 */
function TwoFactorLoginStep({ tempToken, onBack }) {
  const [code, setCode] = useState('');
  const [problem, setProblem] = useState(null);
  const verify = useVerify2faLogin();

  const serverMessage = verify.error?.response?.data?.message ?? verify.error?.message;
  const expired = verify.error?.response?.status === 401 && /expired|temp/i.test(String(serverMessage ?? ''));

  function submit(e) {
    e.preventDefault();
    const msg = twoFactorCodeProblem(code);
    setProblem(msg);
    if (msg) return;
    verify.mutate({ tempToken, totpCode: cleanTwoFactorCode(code) });
  }

  return (
    <form name="twoFactorForm" noValidate className="mt-32 flex w-full flex-col justify-center" onSubmit={submit}>
      <Typography className="mb-8 text-lg font-semibold">Two-step verification</Typography>
      <Typography className="mb-24" color="text.secondary">
        Open your authenticator app and enter the 6-digit code. Lost your phone? Use one of your 8-character backup codes.
      </Typography>

      <TextField
        label="Authenticator or backup code"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setProblem(null);
        }}
        autoFocus
        fullWidth
        autoComplete="one-time-code"
        inputProps={{ inputMode: 'text', maxLength: 12, 'aria-label': 'Authenticator or backup code' }}
        error={Boolean(problem) || Boolean(verify.error)}
        helperText={
          problem ||
          (verify.error
            ? expired
              ? 'This sign-in took too long. Go back and sign in again.'
              : serverMessage || 'That code was not accepted. Try again.'
            : ' ')
        }
      />

      <Button
        variant="contained"
        className="mt-16 w-full"
        aria-label="Verify and sign in"
        type="submit"
        size="large"
        disabled={!code || verify.isLoading}
        sx={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', fontWeight: 600, height: '48px' }}
      >
        {verify.isLoading ? 'Verifying...' : 'Verify and sign in'}
      </Button>
      <Button className="mt-8 w-full" onClick={onBack} aria-label="Back to sign in">
        Back to sign in
      </Button>
    </form>
  );
}

export default TwoFactorLoginStep;
