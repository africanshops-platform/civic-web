// Sign-in with the authenticator on, shared contract (same as civic-mobile and the backend, see docs/runbooks/civic-2fa-login-contract.md):
//   POST /auth-user/login      -> { requiresTwoFactor: true, tempToken, userId }   (no session yet; the token lives 5 minutes)
//   POST /auth-user/2fa/verify -> { tempToken, totpCode } -> the normal session reply { user, userAccessToken, userRefreshToken, sessionId }
// totpCode is the 6-digit code from the authenticator app, or an unused 8-character backup code.

export const isTwoFactorChallenge = (payload) => Boolean(payload) && payload.requiresTwoFactor === true && typeof payload.tempToken === 'string';

/** What the person typed, tidied: spaces and dashes removed (codes are shown as "123 456"). Backup codes keep their letters. */
export const cleanTwoFactorCode = (raw) => String(raw ?? '').replace(/[\s-]/g, '');

/** An error message for a code that cannot be right, or null when it can be sent. */
export function twoFactorCodeProblem(raw) {
  const code = cleanTwoFactorCode(raw);
  if (/^\d{6}$/.test(code)) return null;
  if (/^[A-Za-z0-9]{8}$/.test(code)) return null;
  return 'Enter the 6-digit code from your authenticator app, or an 8-character backup code.';
}
