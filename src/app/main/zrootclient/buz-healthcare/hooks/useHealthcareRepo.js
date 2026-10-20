import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { Api } from 'app/configs/data/client/RepositoryClient';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';
import { walletErrorMessage } from '../careRules';

const say = (e, fallback) => e?.response?.data?.message || fallback;

// Public reads: anyone can look for a facility, see its free slots and read the area's health alerts.
export function useFacilities(params = {}) {
  return useQuery(['healthcare-facilities', params], () => Api().get('/healthcare/facilities', { params }), {
    keepPreviousData: true,
    staleTime: 60 * 1000,
  });
}

export function useFacilityDetail(facilityId) {
  return useQuery(['healthcare-facility', facilityId], () => Api().get(`/healthcare/facilities/${facilityId}`), {
    enabled: Boolean(facilityId),
    staleTime: 60 * 1000,
  });
}

/** Free slots at a facility on one day (YYYY-MM-DD, facility local time), optionally for one practitioner. */
export function useSlots({ facilityId, date, practitionerId }) {
  return useQuery(
    ['healthcare-slots', facilityId, date, practitionerId],
    () => Api().get(`/healthcare/facilities/${facilityId}/slots`, { params: { date, practitionerId: practitionerId || undefined } }),
    { enabled: Boolean(facilityId && date), staleTime: 15 * 1000 }
  );
}

export function useHealthAlerts(params = {}) {
  return useQuery(['healthcare-alerts', params], () => Api().get('/healthcare/alerts', { params }), { staleTime: 2 * 60 * 1000 });
}

// The patient's own data.
// `params.forDependant` (a guardian acting for a child) is passed through as a query parameter; the server checks guardianship every time.
export function useMyAppointments(params = {}) {
  return useQuery(['healthcare-my-appointments', params], () => AuthApi().get('/healthcare/appointments/mine', { params }), {
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });
}

export function useBookAppointment() {
  const qc = useQueryClient();
  return useMutation((body) => AuthApi().post('/healthcare/appointments', body), {
    onSuccess: () => {
      qc.invalidateQueries(['healthcare-my-appointments']);
      qc.invalidateQueries(['healthcare-slots']);
    },
    onError: (e) => toast.error(say(e, 'Could not book the appointment. Please try again.')),
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation(({ appointmentId, reason, forDependant }) => AuthApi().delete('/healthcare/appointments/cancel', { data: { appointmentId, reason }, params: forDependant ? { forDependant } : undefined }), {
    onSuccess: () => {
      toast.success('Appointment cancelled.');
      qc.invalidateQueries(['healthcare-my-appointments']);
      qc.invalidateQueries(['healthcare-slots']);
    },
    onError: (e) => toast.error(say(e, 'Could not cancel the appointment.')),
  });
}

// My health record: who may see it, one-time codes to share it, and who has. Every call can act for a child (`forDependant`); the server
// checks guardianship each time.
const fdp = (forDependant) => (forDependant ? { forDependant } : undefined);
export function useRecordGrants(forDependant) {
  return useQuery(['healthcare-record-grants', forDependant ?? 'me'], () => AuthApi().get('/healthcare/my-record/grants', { params: fdp(forDependant) }), { staleTime: 15 * 1000 });
}

export function useRecordAccessLog(params = {}) { // params.forDependant acts for a child
  return useQuery(['healthcare-record-log', params], () => AuthApi().get('/healthcare/my-record/access-log', { params }), {
    keepPreviousData: true,
    staleTime: 15 * 1000,
  });
}

export function useCreateConsentCode(forDependant) {
  return useMutation(() => AuthApi().post('/healthcare/my-record/consent-code', undefined, { params: fdp(forDependant) }), {
    onError: (e) => toast.error(say(e, 'Could not make a code. Please try again.')),
  });
}

export function useGrantFacility(forDependant) {
  const qc = useQueryClient();
  return useMutation((body) => AuthApi().post('/healthcare/my-record/grant-facility', body, { params: fdp(forDependant) }), {
    onSuccess: () => {
      toast.success('Access given.');
      qc.invalidateQueries(['healthcare-record-grants']);
      qc.invalidateQueries(['healthcare-record-log']);
    },
    onError: (e) => toast.error(say(e, 'Could not give access.')),
  });
}

export function useRevokeFacility(forDependant) {
  const qc = useQueryClient();
  return useMutation((facilityId) => AuthApi().delete(`/healthcare/my-record/facility/${facilityId}`, { params: fdp(forDependant) }), {
    onSuccess: () => {
      toast.success('Access removed.');
      qc.invalidateQueries(['healthcare-record-grants']);
      qc.invalidateQueries(['healthcare-record-log']);
    },
    onError: (e) => toast.error(say(e, 'Could not remove access.')),
  });
}

// Enrolment with a primary facility, the custodian of my record (civic-68 H3-b/H3-d). `enabled: false` means the feature is
// switched off in this environment, and every enrolment control stays hidden.
export function useMyEnrolment(forDependant) {
  return useQuery(['healthcare-enrolment', forDependant ?? 'me'], () => AuthApi().get('/healthcare/enrolment', { params: fdp(forDependant) }), {
    staleTime: 30 * 1000,
    retry: false,
    select: (res) => res.data,
  });
}

/** Primary facilities in the local government where I live. Only asked for once enrolment is switched on. */
export function useEnrolmentOptions(enabled, forDependant) {
  return useQuery(['healthcare-enrolment-options', forDependant ?? 'me'], () => AuthApi().get('/healthcare/enrolment/options', { params: fdp(forDependant) }), {
    enabled: Boolean(enabled),
    staleTime: 60 * 1000,
    retry: false,
    select: (res) => res.data,
  });
}

export function useEnrol(forDependant) {
  const qc = useQueryClient();
  return useMutation((facilityId) => AuthApi().post('/healthcare/enrolment', { facilityId }, { params: fdp(forDependant) }), {
    onSuccess: () => {
      toast.success('You are enrolled. This facility is now the custodian of your health record.');
      qc.invalidateQueries(['healthcare-enrolment']);
    },
    onError: (e) => toast.error(say(e, 'Could not enrol. Please try again.')),
  });
}

export function useLeaveEnrolment(forDependant) {
  const qc = useQueryClient();
  return useMutation(() => AuthApi().delete('/healthcare/enrolment', { params: fdp(forDependant) }), {
    onSuccess: () => {
      toast.success('You have left your primary facility.');
      qc.invalidateQueries(['healthcare-enrolment']);
    },
    onError: (e) => toast.error(say(e, 'Could not leave. Please try again.')),
  });
}

// Referrals (civic-69 H3-c): a facility refers me, I approve (choosing what to share) or decline. A guardian passes the
// child's dependant id as `forDependant`; the server checks guardianship every time.
const forParams = (forDependant) => (forDependant ? { forDependant } : undefined);

export function useMyReferrals(forDependant) {
  return useQuery(['healthcare-referrals', forDependant ?? 'me'], () => AuthApi().get('/healthcare/my-referrals', { params: forParams(forDependant) }), {
    staleTime: 15 * 1000,
    retry: false,
    select: (res) => res.data,
  });
}

export function useApproveReferral(forDependant) {
  const qc = useQueryClient();
  return useMutation(({ id, sections }) => AuthApi().post(`/healthcare/my-referrals/${id}/approve`, { sections }, { params: forParams(forDependant) }), {
    onSuccess: () => {
      toast.success('Done. The receiving facility can now read what you chose, for a limited time.');
      qc.invalidateQueries(['healthcare-referrals']);
      qc.invalidateQueries(['healthcare-record-grants']);
      qc.invalidateQueries(['healthcare-record-log']);
    },
    onError: (e) => toast.error(say(e, 'Could not approve the referral.')),
  });
}

export function useDeclineReferral(forDependant) {
  const qc = useQueryClient();
  return useMutation((id) => AuthApi().post(`/healthcare/my-referrals/${id}/decline`, {}, { params: forParams(forDependant) }), {
    onSuccess: () => {
      toast.success('Referral declined. Nothing was shared.');
      qc.invalidateQueries(['healthcare-referrals']);
    },
    onError: (e) => toast.error(say(e, 'Could not decline the referral.')),
  });
}

/** My household's children who are under 18, for acting on their behalf. Empty when household features are off. */
export function useChildrenIActFor() {
  return useQuery(['healthcare-children'], () => AuthApi().get('/household/dependants'), {
    staleTime: 60 * 1000,
    retry: false,
    select: (res) => (res.data?.items ?? []).filter((c) => !c.agedOut),
  });
}

// My care (civic-70/71): consultations, results, medicines, bills, stays, immunisation, pregnancy, long-term plans, health ID.
// Every call can act for a child (`forDependant`); the server checks guardianship each time.
const careQuery = (key, path) => (forDependant) =>
  useQuery(['healthcare-care', key, forDependant ?? 'me'], () => AuthApi().get(`/healthcare/${path}`, { params: fdp(forDependant) }), { staleTime: 20 * 1000, retry: false, select: (res) => res.data });
export const useMyEncounters = careQuery('encounters', 'my-encounters');
export const useMyResults = careQuery('results', 'my-results');
export const useMyPrescriptions = careQuery('rx', 'my-prescriptions');
export const useMyInvoices = careQuery('invoices', 'my-invoices');
export const useMyAdmissions = careQuery('admissions', 'my-admissions');
export const useMyImmunisation = careQuery('imm', 'my-immunisation');
export const useMyPregnancy = careQuery('pregnancy', 'my-pregnancy');
export const useMyPlans = careQuery('plans', 'my-plans');

export function useMyHealthId(forDependant, enabled) {
  return useQuery(['healthcare-care', 'hid', forDependant ?? 'me'], () => AuthApi().get('/healthcare/my-health-id', { params: fdp(forDependant) }), {
    enabled, retry: false, staleTime: 0, cacheTime: 0, refetchInterval: 9 * 60 * 1000, select: (res) => res.data,
  });
}

export function useAddReading(forDependant) {
  const qc = useQueryClient();
  return useMutation(({ planId, ...body }) => AuthApi().post(`/healthcare/my-plans/${planId}/readings`, body, { params: fdp(forDependant) }), {
    onSuccess: () => { toast.success('Reading saved.'); qc.invalidateQueries(['healthcare-care', 'plans']); },
    onError: (e) => toast.error(say(e, 'Could not save the reading.')),
  });
}


// Health wallet (civic-72): the person's own earmarked wallet, and paying an invoice from it.
export const useHealthWallet = () =>
  useQuery(['healthcare-care', 'wallet'], () => AuthApi().get('/healthcare/health-wallet'), { retry: false, staleTime: 15 * 1000, select: (res) => res.data });

/** Pre-flight: are healthcare-service and fintech-service up? Keeps every pay button disabled while they are not. */
export const useHealthWalletReadiness = (enabled = true) =>
  useQuery(['healthcare-wallet-readiness'], () => AuthApi().get('/checkout-readiness/health-wallet'), {
    enabled, refetchInterval: 15000, refetchOnWindowFocus: true, retry: 1, staleTime: 5000, select: (res) => res?.data,
  });

function useWalletOp(call, ok) {
  const qc = useQueryClient();
  return useMutation(call, {
    onSuccess: () => { toast.success(ok); qc.invalidateQueries(['healthcare-care', 'wallet']); qc.invalidateQueries(['healthcare-care', 'invoices']); },
    onError: (e) => {
      toast.error(walletErrorMessage(e));
      // No answer: the payment may have gone through, so show the real balance and bills rather than leave the screen guessing.
      if (!e?.response) { qc.invalidateQueries(['healthcare-care', 'wallet']); qc.invalidateQueries(['healthcare-care', 'invoices']); }
    },
  });
}
export const useOpenHealthWallet = () => useWalletOp(() => AuthApi().post('/healthcare/health-wallet/open'), 'Your health wallet is open.');
export const useFundHealthWallet = () => useWalletOp((body) => AuthApi().post('/healthcare/health-wallet/fund', body), 'Money added to your health wallet.');
export const useWithdrawHealthWallet = () => useWalletOp((body) => AuthApi().post('/healthcare/health-wallet/withdraw', body), 'Money moved back to your wallet.');
/** `forDependant` pays a child's invoice from the guardian's own health wallet. */
export const usePayInvoice = (forDependant) =>
  useWalletOp(({ invoiceId, ...body }) => AuthApi().post(`/healthcare/my-invoices/${invoiceId}/pay`, body, { params: fdp(forDependant) }), 'Paid. The clinic is paid once the visit is closed.');
