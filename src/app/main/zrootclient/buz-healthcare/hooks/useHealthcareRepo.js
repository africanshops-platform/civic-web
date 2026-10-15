import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { Api } from 'app/configs/data/client/RepositoryClient';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

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
  return useMutation(({ appointmentId, reason }) => AuthApi().delete('/healthcare/appointments/cancel', { data: { appointmentId, reason } }), {
    onSuccess: () => {
      toast.success('Appointment cancelled.');
      qc.invalidateQueries(['healthcare-my-appointments']);
      qc.invalidateQueries(['healthcare-slots']);
    },
    onError: (e) => toast.error(say(e, 'Could not cancel the appointment.')),
  });
}

// My health record: who may see it, one-time codes to share it, and who has.
export function useRecordGrants() {
  return useQuery(['healthcare-record-grants'], () => AuthApi().get('/healthcare/my-record/grants'), { staleTime: 15 * 1000 });
}

export function useRecordAccessLog(params = {}) {
  return useQuery(['healthcare-record-log', params], () => AuthApi().get('/healthcare/my-record/access-log', { params }), {
    keepPreviousData: true,
    staleTime: 15 * 1000,
  });
}

export function useCreateConsentCode() {
  return useMutation(() => AuthApi().post('/healthcare/my-record/consent-code'), {
    onError: (e) => toast.error(say(e, 'Could not make a code. Please try again.')),
  });
}

export function useGrantFacility() {
  const qc = useQueryClient();
  return useMutation((body) => AuthApi().post('/healthcare/my-record/grant-facility', body), {
    onSuccess: () => {
      toast.success('Access given.');
      qc.invalidateQueries(['healthcare-record-grants']);
      qc.invalidateQueries(['healthcare-record-log']);
    },
    onError: (e) => toast.error(say(e, 'Could not give access.')),
  });
}

export function useRevokeFacility() {
  const qc = useQueryClient();
  return useMutation((facilityId) => AuthApi().delete(`/healthcare/my-record/facility/${facilityId}`), {
    onSuccess: () => {
      toast.success('Access removed.');
      qc.invalidateQueries(['healthcare-record-grants']);
      qc.invalidateQueries(['healthcare-record-log']);
    },
    onError: (e) => toast.error(say(e, 'Could not remove access.')),
  });
}
