import { useState } from 'react';
import { useGetKycStatus } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';
import { getIsCivicUser } from 'app/configs/data/server-calls/auth/userapp/a_civic_user/useCivicUserRepo';
import KycWizardPage      from '../kyc/KycWizardPage';
import CivicActivationPage from './CivicActivationPage';

export default function CivicUserGuard({ children }) {
  const [showKycManager, setShowKycManager] = useState(false);
  // Re-uses the react-query cache from the parent KycGuard — no extra network call
  const { data: kycData } = useGetKycStatus();

  if (showKycManager) {
    return (
      <KycWizardPage
        kycData={kycData ?? {}}
        onBack={() => setShowKycManager(false)}
      />
    );
  }

  if (getIsCivicUser()) return children;

  return (
    <CivicActivationPage
      kycData={kycData ?? {}}
      onManageBiometrics={() => setShowKycManager(true)}
    />
  );
}
