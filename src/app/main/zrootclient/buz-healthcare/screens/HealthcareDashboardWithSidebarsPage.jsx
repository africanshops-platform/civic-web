import { memo, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import useGetUserAppSetting from 'app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain';
import ServiceStatusLandingPage from '../../aapp-settings-from-admin/ServiceStatusLandingPage';
import HealthcareDashboardContent from './shared-components/HealthcareDashboardContent';
import HealthcarePageShell from './shared-components/HealthcarePageShell';
import { useFacilities, useHealthAlerts } from '../hooks/useHealthcareRepo';

const LIMIT = 20;

function ActiveHealthcareDashboardPage() {
  // The kind of facility and the page live in the address, so a link or a refresh keeps them.
  const [sp, setSp] = useSearchParams();
  const type = sp.get('type') || '';
  const page = Math.max(Number(sp.get('page')) || 1, 1);
  const setParams = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setSp(next, { replace: true });
  };

  const { data, isLoading, isError } = useFacilities({ type: type || undefined, page, limit: LIMIT });
  const { data: alerts } = useHealthAlerts({ limit: 1 });
  const body = data?.data;

  return (
    <HealthcarePageShell
      title="Healthcare"
      subtitle="Facilities · Appointments · Health alerts"
      hasAlerts={(alerts?.data?.total ?? 0) > 0}
      typeFilter={type}
      onTypeChange={(t) => setParams({ type: t, page: '' })}
    >
      <HealthcareDashboardContent
        facilities={body?.data}
        total={body?.total ?? 0}
        page={body?.page ?? page}
        totalPages={body?.totalPages ?? 1}
        onPage={(p) => setParams({ page: p > 1 ? String(p) : '' })}
        isLoading={isLoading}
        isError={isError}
        filtered={Boolean(type)}
      />
    </HealthcarePageShell>
  );
}

const MemoizedActivePage = memo(ActiveHealthcareDashboardPage);

function HealthcareDashboardWithSidebarsPage() {
  const { data: appSettings, isLoading, isError } = useGetUserAppSetting();
  const serviceStatus = useMemo(() => appSettings?.data?.payload?.healthcareServiceStatus, [appSettings?.data?.payload?.healthcareServiceStatus]);

  return <ServiceStatusLandingPage serviceStatus={serviceStatus} ActiveComponent={MemoizedActivePage} isLoading={isLoading} isError={isError} serviceName="Healthcare" />;
}

export default HealthcareDashboardWithSidebarsPage;
