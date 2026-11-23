import { useState } from 'react';
import Button from '@mui/material/Button';
import { PendingButton, ProcessingState } from 'app/shared-components/loading';
import { useVerify2faLogin } from 'app/configs/data/server-calls/auth/admin-auth';
import { toast } from 'react-toastify';
import CodeEntry from './CodeEntry';
import { cleanTwoFactorCode, isValidLoginCode } from '../twoFactorLogin';

/**
 * The second step of sign-in for an account with the authenticator on, laid out like the customer app: six single-digit boxes (a pasted
 * code fills them all) with a switch to a plain field for an 8-character backup code. Only a correct code creates the session; on success
 * the mutation stores it and the page moves on, exactly like a password-only sign-in.
 */
function TwoFactorLoginStep({ tempToken, onBack }) {
  const [code, setCode] = useState('');
  const verify = useVerify2faLogin();
  const clean = cleanTwoFactorCode(code);

  const submit = () => {
    if (!isValidLoginCode(clean) || verify.isLoading) return;
    verify.mutate(
      { tempToken, totpCode: clean },
      {
        onError: (error) => {
          const message = error?.response?.data?.message ?? 'That code was not accepted. Try again.';
          toast.error(message);
          // The challenge is gone (expired, or too many wrong codes): start again from the password.
          if (error?.response?.status === 429 || /challenge|login again/i.test(message)) onBack();
          else setCode('');
        },
      },
    );
  };

  return (
    <div className="mt-32 flex w-full flex-col justify-center">
      <h3 className="mb-8 text-xl font-bold">Enter your code</h3>
      <p className="mb-24 text-sm text-gray-500">
        Open your authenticator app and enter the 6-digit code for AfricanShops. You can paste it too.
      </p>
      {/* One fixed-height area, so the form never jumps: the code boxes while typing, the branded spiral while the code is checked. */}
      <div style={{ minHeight: 190, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {verify.isLoading ? (
          <ProcessingState title="Checking your code" subtitle="" />
        ) : (
          <CodeEntry value={code} onChange={setCode} onSubmit={submit} autoFocus />
        )}
      </div>
      <PendingButton
        variant="contained"
        className="mt-16 w-full"
        aria-label="Verify and sign in"
        disabled={!isValidLoginCode(clean)}
        pending={verify.isLoading}
        pendingLabel="Checking…"
        onClick={submit}
        size="large"
        sx={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          color: 'white',
          fontWeight: 600,
          height: '48px',
          '&:disabled': { background: '#e5e7eb', color: '#9ca3af' },
        }}
      >
        Verify and sign in
      </PendingButton>
      <Button className="mt-8" onClick={onBack} aria-label="Back to sign in">
        Back to sign in
      </Button>
    </div>
  );
}

export default TwoFactorLoginStep;
