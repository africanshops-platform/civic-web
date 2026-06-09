import { Box, Button, CircularProgress, Typography } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import ShieldIcon from '@mui/icons-material/Shield';
import { useGetKycStatus } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';
import KycWizardPage from './KycWizardPage';

const F = {
  title:   'clamp(1.76rem, 2.6vw, 2.2rem)',
  body:    'clamp(1.5rem,  2.2vw, 1.9rem)',
  small:   'clamp(1.3rem,  1.8vw, 1.56rem)',
  btn:     'clamp(1.3rem,  2vw,   1.76rem)',
};

function KycLoadingScreen() {
  return (
    <Box sx={{
      position: 'fixed', inset: 0, zIndex: 1300,
      background: 'linear-gradient(135deg, #0a1929 0%, #0d3320 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 3,
    }}>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={72} thickness={2} sx={{ color: '#4ade80' }} />
        <ShieldIcon sx={{
          position: 'absolute', fontSize: 34, color: '#4ade80',
          animation: 'shieldPulse 1.8s ease-in-out infinite',
          '@keyframes shieldPulse': {
            '0%,100%': { opacity: 1, transform: 'scale(1)' },
            '50%':     { opacity: 0.6, transform: 'scale(0.9)' },
          },
        }} />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: F.title, mb: 0.75 }}>
          Verifying Identity Status
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: F.body }}>
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
      background: 'linear-gradient(135deg, #0a1929 0%, #1a1a2e 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 2.5, px: 3,
    }}>
      <Box sx={{
        width: 88, height: 88, borderRadius: '50%',
        background: 'rgba(239,68,68,0.15)', border: '1.5px solid rgba(239,68,68,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <WifiOffIcon sx={{ fontSize: 42, color: '#ef4444' }} />
      </Box>
      <Box sx={{ textAlign: 'center', maxWidth: 420 }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: F.title, mb: 1.5 }}>
          {is5xx ? 'KYC Service Temporarily Unavailable' : 'Unable to Verify Identity'}
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: F.body, lineHeight: 1.75 }}>
          {is5xx
            ? 'Our identity verification service is experiencing a temporary issue. Your account and data are safe. Please try again in a few minutes.'
            : 'A network error occurred while checking your identity status. Please check your connection and try again.'}
        </Typography>
      </Box>
      <Button
        variant="contained"
        onClick={refetch}
        sx={{
          mt: 1, px: 4, py: 1.5, borderRadius: 3, fontSize: F.btn, fontWeight: 700,
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          '&:hover': { background: 'linear-gradient(135deg, #2563eb, #1e40af)' },
        }}
      >
        Try Again
      </Button>
      <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: F.small, mt: 1 }}>
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
