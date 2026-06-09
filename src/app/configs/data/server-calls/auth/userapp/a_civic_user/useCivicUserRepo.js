import jwtDecode from 'jwt-decode';
import { useMutation } from 'react-query';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

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

/** Upgrades the user to civic tier, then reloads so the new JWT is picked up. */
export function useUpgradeToCivicUser() {
  return useMutation(() => AuthApi().get('/auth-user/civic/upgrade'), {
    onSuccess: () => window.location.reload(),
  });
}
