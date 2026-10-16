import { memo, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useGetUserAppSetting from 'app/configs/data/server-calls/auth/userapp/a_userapp_settings/useAppSettingDomain';
import ServiceStatusLandingPage from '../../aapp-settings-from-admin/ServiceStatusLandingPage';
import HealthcareDashboardContent from './shared-components/HealthcareDashboardContent';
import HealthcarePageShell from './shared-components/HealthcarePageShell';
import { useEnrolmentOptions, useFacilities, useHealthAlerts, useMyEnrolment } from '../hooks/useHealthcareRepo';
import EnrolDialog from '../components/EnrolDialog';

const LIMIT = 20;

function ActiveHealthcareDashboardPage() {
  // The kind of facility and the page live in the address, so a link or a refresh keeps them.
  const [sp, setSp] = useSearchParams();
  const type = sp.get('type') || '';
  const primaryOnly = sp.get('primary') === '1';
  const page = Math.max(Number(sp.get('page')) || 1, 1);
  const setParams = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setSp(next, { replace: true });
  };

  const { data, isLoading, isError } = useFacilities({ type: type || undefined, page, limit: LIMIT });
  const { data: alerts } = useHealthAlerts({ limit: 1 });
  const body = data?.data;

  // Enrolment (civic-68): only when the feature is switched on for this environment.
  const { data: mine } = useMyEnrolment();
  const enabled = Boolean(mine?.enabled);
  const { data: options } = useEnrolmentOptions(enabled);
  const primaryFacilities = (options?.items ?? []).map((i) => i.facility);
  const primaryIds = primaryFacilities.map((f) => f.id);
  const mineId = mine?.enrolment?.facility?.id ?? null;
  const [enrolling, setEnrolling] = useState(null);

  const listed = primaryOnly && enabled ? primaryFacilities.filter((f) => !type || f.type === type) : body?.data;

  return (
    <HealthcarePageShell
      title="Healthcare"
      subtitle="Facilities · Appointments · Health alerts"
      hasAlerts={(alerts?.data?.total ?? 0) > 0}
      typeFilter={type}
      onTypeChange={(t) => setParams({ type: t, page: '' })}
      primaryOnly={primaryOnly}
      onPrimaryOnlyChange={enabled ? (on) => setParams({ primary: on ? '1' : '', page: '' }) : undefined}
      mapFacilities={listed ?? []}
    >
      <HealthcareDashboardContent
        facilities={listed}
        total={primaryOnly && enabled ? (listed?.length ?? 0) : body?.total ?? 0}
        page={body?.page ?? page}
        totalPages={primaryOnly && enabled ? 1 : body?.totalPages ?? 1}
        onPage={(p) => setParams({ page: p > 1 ? String(p) : '' })}
        isLoading={isLoading}
        isError={isError}
        filtered={Boolean(type) || (primaryOnly && enabled)}
        enrolment={{ enabled, mineId, primaryIds, onEnrol: setEnrolling }}
      />
      {enrolling && <EnrolDialog facility={enrolling} replacing={Boolean(mineId)} onClose={() => setEnrolling(null)} />}
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
