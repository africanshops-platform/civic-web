import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { Api } from 'app/configs/data/client/RepositoryClient';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

const say = (e, fallback) => e?.response?.data?.message || fallback;

// Public: anyone can look at the approved schools.
export function useSchools(params = {}) {
  return useQuery(['edu-schools', params], () => Api().get('/education/schools', { params }), { keepPreviousData: true, staleTime: 60 * 1000 });
}

export function useSchool(id) {
  return useQuery(['edu-school', id], () => Api().get(`/education/schools/${id}`), { enabled: Boolean(id), staleTime: 60 * 1000 });
}

// The signed-in parent or student.
export function useMyChildren() {
  return useQuery(['edu-children'], () => AuthApi().get('/education/parent/children'), { staleTime: 30 * 1000 });
}

export function useChildRecord(studentId) {
  return useQuery(['edu-child', studentId], () => AuthApi().get(`/education/parent/child/${studentId}`), { enabled: Boolean(studentId), staleTime: 30 * 1000 });
}

export function useParentAnnouncements(params = {}) {
  return useQuery(['edu-announcements', params], () => AuthApi().get('/education/parent/announcements', { params }), { keepPreviousData: true, staleTime: 30 * 1000 });
}

export function useMyApplications() {
  return useQuery(['edu-my-applications'], () => AuthApi().get('/education/student/applications'), { staleTime: 30 * 1000 });
}

export function useRedeemCode() {
  const qc = useQueryClient();
  return useMutation((code) => AuthApi().post('/education/guardian/redeem', { code }), {
    onSuccess: () => {
      toast.success('Your child is now linked to your account.');
      qc.invalidateQueries(['edu-children']);
      qc.invalidateQueries(['edu-announcements']);
    },
    onError: (e) => toast.error(say(e, 'That code did not work. Check it, or ask the school for a new one.')),
  });
}

export function useApply() {
  const qc = useQueryClient();
  return useMutation((body) => AuthApi().post('/education/student/apply', body), {
    onSuccess: () => {
      toast.success('Application sent.');
      qc.invalidateQueries(['edu-my-applications']);
    },
    onError: (e) => toast.error(say(e, 'Could not send the application. Please try again.')),
  });
}

/** Is the school finder (map, facility and boarding filters, distance search) switched on in this environment? */
export function useFinderConfig() {
  return useQuery(['edu-finder-config'], () => Api().get('/education/finder-config'), { staleTime: 5 * 60 * 1000, retry: false, select: (res) => res.data });
}

// Admission for a ward (civic-61 E3-c): a guardian applies for a child in their household, takes the school's optional test and
// answers an offer. `retry: false` so a 404 (the feature is switched off here) shows at once.
export function useWardApplications() {
  return useQuery(['edu-ward-applications'], () => AuthApi().get('/education/admissions'), { staleTime: 15 * 1000, retry: false, select: (res) => res.data });
}

/** My household's children under 18, to apply for. Empty when household features are off. */
export function useChildrenToApplyFor() {
  return useQuery(['edu-household-children'], () => AuthApi().get('/household/dependants'), { staleTime: 60 * 1000, retry: false, select: (res) => (res.data?.items ?? []).filter((c) => !c.agedOut) });
}

export function useApplyForWard() {
  const qc = useQueryClient();
  return useMutation((body) => AuthApi().post('/education/admissions', body), {
    onSuccess: (res) => {
      toast.success(res.data?.aptitudeRequired ? 'Application sent. The school asks for a short test: open it under Applications for my child.' : 'Application sent.');
      qc.invalidateQueries(['edu-ward-applications']);
    },
    onError: (e) => toast.error(say(e, 'Could not send the application. Please try again.')),
  });
}

export function useWardAction() {
  const qc = useQueryClient();
  return useMutation(({ id, action, body }) => AuthApi().post(`/education/admissions/${id}/${action}`, body ?? {}), {
    onSuccess: () => qc.invalidateQueries(['edu-ward-applications']),
    onError: (e) => toast.error(say(e, 'That did not work. Please try again.')),
  });
}

export function useStartAptitude() {
  return useMutation((id) => AuthApi().post(`/education/admissions/${id}/aptitude/start`), { onError: (e) => toast.error(say(e, 'Could not start the test.')) });
}
