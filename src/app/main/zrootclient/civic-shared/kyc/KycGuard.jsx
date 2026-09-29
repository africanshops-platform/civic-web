import { Box, Button, CircularProgress, Typography } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import ShieldIcon from '@mui/icons-material/Shield';
import { useGetKycStatus } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';
import KycWizardPage from './KycWizardPage';

function KycLoadingScreen() {
  return (
    <Box sx={{
      position: 'fixed', inset: 0, zIndex: 1300,
      bgcolor: 'background.default',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 3,
    }}>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={72} thickness={2} color="secondary" />
        <ShieldIcon color="secondary" sx={{
          position: 'absolute', fontSize: 34,
          animation: 'shieldPulse 1.8s ease-in-out infinite',
          '@keyframes shieldPulse': {
            '0%,100%': { opacity: 1, transform: 'scale(1)' },
            '50%':     { opacity: 0.6, transform: 'scale(0.9)' },
          },
        }} />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 22, mb: 0.75 }}>
          Verifying Identity Status
        </Typography>
        <Typography color="text.secondary">
          Connecting to KYC services…
        </Typography>
      </Box>
    </Box>
  );
}

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
  const { data, isLoading, isError, error, refetch } = useGetKycStatus();

  if (isLoading) return <KycLoadingScreen />;
  if (isError)   return <KycErrorScreen error={error} refetch={refetch} />;

  const kycStatus = data?.kycStatus ?? 'NONE';
  if (kycStatus === 'FULLY_VERIFIED') return children;

  return <KycWizardPage kycData={data ?? {}} />;
}
