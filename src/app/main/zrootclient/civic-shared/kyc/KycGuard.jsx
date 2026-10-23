import { useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useGetKycStatus } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';
import { PageSkeleton } from 'app/shared-components/loading';
import useCivicWebAuth from 'src/app/hooks/useCivicWebAuth';
import KycWizardPage from './KycWizardPage';
import { KYC_STALE_EVENT, readKycHint, writeKycHint } from './kycHint';

function KycErrorScreen({ error, refetch }) {
  const is5xx = error?.response?.status >= 500;
  return (
    <Box sx={{
      position: 'fixed', inset: 0, zIndex: 1300,
      bgcolor: 'background.default',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 2.5, px: 3,
    }}>
      <Box sx={{
        width: 88, height: 88, borderRadius: '50%',
        bgcolor: 'error.light',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <WifiOffIcon color="error" sx={{ fontSize: 42 }} />
      </Box>
      <Box sx={{ textAlign: 'center', maxWidth: 420 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 22, mb: 1.5 }}>
          {is5xx ? 'KYC Service Temporarily Unavailable' : 'Unable to Verify Identity'}
        </Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
          {is5xx
            ? 'Our identity verification service is experiencing a temporary issue. Your account and data are safe. Please try again in a few minutes.'
            : 'A network error occurred while checking your identity status. Please check your connection and try again.'}
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="secondary"
        onClick={refetch}
        sx={{ mt: 1, px: 4, py: 1.5, borderRadius: 3, fontWeight: 700 }}
      >
        Try Again
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        Error {error?.response?.status ?? 'NETWORK'} · {new Date().toLocaleTimeString()}
      </Typography>
    </Box>
  );
}

export default function KycGuard({ children }) {
  const { user } = useCivicWebAuth();
  const userId = user?.id;
  const hint = readKycHint(userId);
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useGetKycStatus({ verifiedHint: hint });

  // Remember the real answer for next time (never the placeholder), and recheck when the server reports verification is required.
  useEffect(() => {
    if (data?.kycStatus && !isPlaceholderData) writeKycHint(userId, data.kycStatus === 'FULLY_VERIFIED');
  }, [data?.kycStatus, isPlaceholderData, userId]);
  useEffect(() => {
    const recheck = () => refetch();
    window.addEventListener(KYC_STALE_EVENT, recheck);
    return () => window.removeEventListener(KYC_STALE_EVENT, recheck);
  }, [refetch]);

  // Waiting to SEE the page: the page skeleton (not a full-screen takeover). A verified user never gets here (the hint opens the gate at once).
  if (isLoading) return <PageSkeleton title="Loading" />;
  // A failed recheck must not lock out someone who was verified last time: the server still enforces KYC on every request.
  if (isError) return hint ? children : <KycErrorScreen error={error} refetch={refetch} />;

  const kycStatus = data?.kycStatus ?? 'NONE';
  if (kycStatus === 'FULLY_VERIFIED') return children;

  return <KycWizardPage kycData={data ?? {}} />;
}
