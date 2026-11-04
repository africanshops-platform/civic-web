/**
 * A per-user "this person was verified last time" hint, kept in localStorage. It is a UX hint only: it lets the KYC gate open at once for a verified
 * user instead of waiting on a status call (the gate still rechecks in the background and the server still enforces KYC on every request).
 */
const PREFIX = 'as_civic_kyc_ok:';

export const KYC_STALE_EVENT = 'afs:kyc-stale';

export function readKycHint(userId) {
	try {
		return Boolean(userId) && localStorage.getItem(PREFIX + userId) === '1';
	} catch {
		return false;
	}
}

export function writeKycHint(userId, verified) {
	try {
		if (!userId) return;
		if (verified) localStorage.setItem(PREFIX + userId, '1');
		else localStorage.removeItem(PREFIX + userId);
	} catch {
		/* storage unavailable: the gate just waits for the status call, as before */
	}
}

/** The server said identity verification is required: forget every hint and ask the open gates to recheck. */
export function dropKycHints() {
	try {
		Object.keys(localStorage)
			.filter((k) => k.startsWith(PREFIX))
			.forEach((k) => localStorage.removeItem(k));
		window.dispatchEvent(new Event(KYC_STALE_EVENT));
	} catch {
		/* nothing to drop */
	}
}

export const isKycRequiredMessage = (message) => /identity verification required/i.test(String(message ?? ''));
