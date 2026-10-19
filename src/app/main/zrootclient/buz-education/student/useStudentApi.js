import { useMutation, useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { Api } from 'app/configs/data/client/RepositoryClient';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';
import { setMustChangePassword, startStudentSession } from './studentSession';

const say = (e, fallback) => e?.response?.data?.message || fallback;

export function useStudentSignIn() {
  return useMutation((body) => Api().post('/auth-user/student-login', body), {
    onSuccess: (res) => startStudentSession(res.data),
    // The server answers an unknown username and a wrong password the same way; say it plainly and never which one it was.
    onError: (e) => toast.error(e?.response?.status === 401 ? 'That username or password is not right.' : say(e, 'Could not sign in. Please try again.')),
  });
}

export function useChangeStudentPassword() {
  return useMutation((body) => AuthApi().put('/auth-user/loggedin/settings/change-password', body), {
    onSuccess: () => {
      setMustChangePassword(false);
      toast.success('Your new password is saved.');
    },
    onError: (e) => toast.error(say(e, 'Could not change the password. Check the current one and try again.')),
  });
}

const get = (key, path, opts = {}) => () => useQuery(['student', key], () => AuthApi().get(path), { staleTime: 30 * 1000, retry: false, ...opts });
export const useMyRecord = get('record', '/education/me');
export const useMyTimetable = get('timetable', '/education/me/timetable');
export const useMyGate = get('gate', '/education/me/gate');
export const useMyNotices = get('notices', '/education/me/notices');
export const useMyNotes = get('notes', '/education/me/notes');
export const loadMyNote = (id) => AuthApi().get(`/education/me/notes/${id}`).then((r) => r.data);

// A student who turned 18 claims the account as their own (civic-61 E3-d4).
export const useClaimStatus = () => useQuery(['student', 'claim'], () => AuthApi().get('/auth-user/claim'), { staleTime: 60 * 1000, retry: false });

export function useClaimStart() {
  return useMutation((body) => AuthApi().post('/auth-user/claim/start', body), {
    onError: (e) => toast.error(say(e, 'Could not send the code. Please try again.')),
  });
}

export function useClaimComplete() {
  return useMutation((body) => AuthApi().post('/auth-user/claim/complete', body), {
    onError: (e) => toast.error(say(e, 'That did not work. Check the code and try again.')),
  });
}
