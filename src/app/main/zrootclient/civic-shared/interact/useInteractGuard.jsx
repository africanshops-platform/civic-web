import { useCallback, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { setSessionRedirectUrl } from '@fuse/core/FuseAuthorization/sessionRedirectUrl';
import useCivicWebAuth from 'src/app/hooks/useCivicWebAuth';
import { getIsCivicUser } from 'app/configs/data/server-calls/auth/userapp/a_civic_user/useCivicUserRepo';
import { KYC_STATUS_KEY } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';
import KycGuard from '../kyc/KycGuard';
import CivicUserGuard from '../civic-user/CivicUserGuard';

/** Runs the pending action the moment the verification flow inside the dialog finishes (children only render once eligible). */
function RunThenClose({ action, onDone }) {
  const ran = useRef(false);
  if (!ran.current) {
    ran.current = true;
    Promise.resolve().then(() => {
      try { action?.(); } finally { onDone(); }
    });
  }
  return null;
}

/**
 * Public to browse, gated to engage (standing civic rule): wrap an ACTION handler with `guard(fn)`.
 *  - guest            -> sent to sign in, and brought back to this page afterwards
 *  - signed in, not yet identity-verified / activated civic user -> the existing KYC + civic activation flow opens in a dialog,
 *    and the action runs as soon as the user is eligible
 *  - eligible         -> the action runs at once
 * Render `{gateDialog}` once in the screen. The server still enforces KYC + civic user on every mutation.
 */
export default function useInteractGuard() {
  const { isAuthenticated } = useCivicWebAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const [pending, setPending] = useState(null);

  const guard = useCallback(
    (fn) => (...args) => {
      if (!isAuthenticated) {
        // The app's own post-login redirect: after signing in the user lands back on this page.
        setSessionRedirectUrl(location.pathname + location.search);
        navigate('/sign-in');
        return undefined;
      }
      const kyc = qc.getQueryData(KYC_STATUS_KEY);
      const verified = (kyc?.data ?? kyc)?.kycStatus === 'FULLY_VERIFIED';
      if (verified && getIsCivicUser()) return fn(...args);
      setPending(() => () => fn(...args));
      return undefined;
    },
    [isAuthenticated, navigate, location, qc],
  );

  const gateDialog = (
    <Dialog open={Boolean(pending)} onClose={() => setPending(null)} fullScreen>
      <IconButton aria-label="Close" onClick={() => setPending(null)} sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1400 }}>
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: 0 }}>
        {pending ? (
          <KycGuard>
            <CivicUserGuard>
              <RunThenClose action={pending} onDone={() => setPending(null)} />
            </CivicUserGuard>
          </KycGuard>
        ) : null}
      </DialogContent>
    </Dialog>
  );

  return { guard, gateDialog };
}
