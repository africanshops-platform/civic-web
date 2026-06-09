import { Box, CircularProgress } from '@mui/material';
import { useGetKycStatus } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';
import KycWizardPage from './KycWizardPage';

export default function KycManagePage() {
  const { data, isLoading } = useGetKycStatus();

  if (isLoading) {
    return (
      <Box sx={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #050d18 0%, #0a1929 40%, #0b2416 100%)',
      }}>
        <CircularProgress sx={{ color: '#4ade80' }} />
      </Box>
    );
  }

  return <KycWizardPage kycData={data ?? {}} />;
}
