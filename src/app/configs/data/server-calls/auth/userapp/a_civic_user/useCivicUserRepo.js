import jwtDecode from 'jwt-decode';
import { useMutation } from 'react-query';
import { AuthApi, doTokenRefresh } from 'app/configs/data/client/RepositoryAuthClient';

/** Read CIVIC_USER status directly from the stored JWT — no network call needed. */
export function getIsCivicUser() {
  try {
    const token = localStorage.getItem('jwt_access_token');
    if (!token) return false;
    const { userTypes } = jwtDecode(token);
    return Array.isArray(userTypes) && userTypes.includes('CIVIC_USER');
  } catch {
    return false;
  }
}

/**
 * Upgrades the user to civic tier, then reloads so the new JWT is picked up.
 * Backend contract is POST /auth-user/civic/upgrade with a real body
 * (UpgradeToCivicUserDto: dwelling + home-origin country/state/LGA, plus
 * optional tax-split percentages) — this used to call GET with no body at
 * all, which 404'd every single time regardless of backend readiness.
 *
 * Bug fix (2026-09-25): onSuccess used to just call window.location.reload()
 * — a page reload only re-reads whatever access token is ALREADY sitting in
 * localStorage; it does not fetch a new one. The upgrade call above adds
 * CIVIC_USER server-side, but the user's existing JWT was signed at login,
 * before that change, so getIsCivicUser() (which decodes userTypes straight
 * from that stored token) kept returning false no matter how many times the
 * page was reloaded. Explicitly refreshing the token first — which now also
 * requires the matching authuser.service.ts fix so refresh actually re-reads
 * current userTypes from the DB instead of defaulting to ['USER'] — gets a
 * token that actually reflects the new role before the reload re-reads it.
 */
export function useUpgradeToCivicUser() {
  return useMutation((dto) => AuthApi().post('/auth-user/civic/upgrade', dto), {
    onSuccess: async () => {
      try {
        await doTokenRefresh();
      } finally {
        window.location.reload();
      }
    },
  });
}
