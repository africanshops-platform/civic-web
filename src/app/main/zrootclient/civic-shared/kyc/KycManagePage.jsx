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
        bgcolor: 'background.default',
      }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return <KycWizardPage kycData={data ?? {}} />;
}
