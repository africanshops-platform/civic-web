import { KYC_STALE_EVENT, dropKycHints, isKycRequiredMessage, readKycHint, writeKycHint } from '../kycHint';

describe('kyc hint (remembers a verified user on this device)', () => {
	beforeEach(() => localStorage.clear());

	it('is per user, and only true after a verified result was written', () => {
		expect(readKycHint('u1')).toBe(false);
		writeKycHint('u1', true);
		expect(readKycHint('u1')).toBe(true);
		expect(readKycHint('u2')).toBe(false);
	});

	it('a not-verified result clears it, and a missing user id writes nothing', () => {
		writeKycHint('u1', true);
		writeKycHint('u1', false);
		expect(readKycHint('u1')).toBe(false);
		writeKycHint(undefined, true);
		expect(localStorage.length).toBe(0);
		expect(readKycHint(undefined)).toBe(false);
	});

	it('dropKycHints forgets every user and tells open gates to recheck', () => {
		writeKycHint('u1', true);
		writeKycHint('u2', true);
		const seen = jest.fn();
		window.addEventListener(KYC_STALE_EVENT, seen);
		dropKycHints();
		window.removeEventListener(KYC_STALE_EVENT, seen);
		expect(readKycHint('u1')).toBe(false);
		expect(readKycHint('u2')).toBe(false);
		expect(seen).toHaveBeenCalledTimes(1);
	});

	it('recognises the gateway message for "verification required" and nothing else', () => {
		expect(isKycRequiredMessage('Identity verification required. Complete KYC at /auth-user/kyc before accessing this feature.')).toBe(true);
		expect(isKycRequiredMessage('Subscription required')).toBe(false);
		expect(isKycRequiredMessage(undefined)).toBe(false);
	});

	it('does not throw when storage is unavailable', () => {
		const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('blocked');
		});
		expect(readKycHint('u1')).toBe(false);
		spy.mockRestore();
	});
});
