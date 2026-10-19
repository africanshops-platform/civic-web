import Cookie from 'js-cookie';
import jwtDecode from 'jwt-decode';
import config from '../../../../auth/services/jwt/jwtAuthConfig';

/** A child's school login (civic-61 E3-d3). The access token says so: its userTypes carry CIVIC_MINOR, signed by the server. */
export function studentClaims() {
  try {
    const token = localStorage.getItem(config.tokenStorageKey);
    if (!token) return null;
    const c = jwtDecode(token);
    return Array.isArray(c.userTypes) && c.userTypes.includes('CIVIC_MINOR') ? c : null;
  } catch {
    return null;
  }
}

export const isStudentSession = () => Boolean(studentClaims());

const MUST_CHANGE = 'student_must_change_password';
export const mustChangePassword = () => localStorage.getItem(MUST_CHANGE) === '1';
export const setMustChangePassword = (v) => (v ? localStorage.setItem(MUST_CHANGE, '1') : localStorage.removeItem(MUST_CHANGE));

/** Store a student's sign-in the same way the adult sign-in does, then open the student home (a reload so the app picks the session up). */
export function startStudentSession(data) {
  const user = data?.user;
  const accessToken = data?.userAccessToken;
  if (!user || !accessToken) throw new Error('Sign-in did not return a session');
  localStorage.setItem(config.tokenStorageKey, accessToken);
  localStorage.setItem(config.isAuthenticatedStatus, true);
  if (data.userRefreshToken) localStorage.setItem(config.refreshTokenStorageKey, data.userRefreshToken);
  if (data.sessionId) localStorage.setItem(config.sessionIdStorageKey, data.sessionId);
  setMustChangePassword(Boolean(user.askPasswordChange));
  Cookie.set(config.adminCredentials, JSON.stringify({ userCredentials: { id: user.id ?? user._id, name: user.name, email: user.email, role: 'user' } }));
  window.location.assign('/student');
}
