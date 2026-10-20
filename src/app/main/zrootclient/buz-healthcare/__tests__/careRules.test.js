import { naira, nairaToKobo, nextSteps, readingFrom, readingReady, secondsLeft, walletErrorMessage, walletPayState } from '../careRules';

describe('careRules', () => {
  it('shows kobo as naira', () => {
    expect(naira('550000')).toBe('₦5,500');
    expect(naira(undefined)).toBe('₦0');
  });

  it('tells the family what to do next: overdue vaccines, a due antenatal visit, a review this week', () => {
    const soon = new Date(Date.now() + 3 * 86_400_000).toISOString();
    const late = new Date(Date.now() - 3 * 86_400_000).toISOString();
    expect(nextSteps({ imm: { doses: [{ state: 'OVERDUE' }, { state: 'OVERDUE' }, { state: 'DUE' }] } })).toEqual(['2 vaccine doses are overdue. Take the child to a clinic.']);
    expect(nextSteps({ imm: { doses: [{ state: 'DUE' }] } })).toEqual(['1 vaccine dose is due now.']);
    expect(nextSteps({ pregnancy: { schedule: [{ contact: 1, weeks: 12, state: 'DONE' }, { contact: 2, weeks: 20, state: 'DUE' }] } })).toEqual(['Antenatal visit 2 (week 20) is due.']);
    expect(nextSteps({ pregnancy: { schedule: [{ contact: 1, weeks: 12, state: 'MISSED' }] } })[0]).toMatch(/was missed/);
    expect(nextSteps({ plans: [{ condition: 'DIABETES', nextReviewAt: soon }, { condition: 'HYPERTENSION', nextReviewAt: late }] })).toEqual(['Diabetes: your review is this week.', 'High blood pressure: your review is 3 days overdue.']);
    expect(nextSteps({})).toEqual([]);
  });

  it('reads a home reading from the form, leaving empty fields out', () => {
    expect(readingFrom({ systolic: '152', diastolic: '96', pulse: '', glucoseMmol: '6.5' })).toEqual({ systolic: 152, diastolic: 96, glucoseMmol: 6.5 });
    expect(readingReady({ systolic: 152, diastolic: 96 })).toBe(true);
    expect(readingReady({ systolic: 152 })).toBe(false);
    expect(readingReady({ glucoseMmol: 6.5 })).toBe(true);
    expect(readingReady({})).toBe(false);
  });

  it('counts down a health ID code and stops at zero', () => {
    const now = Date.now();
    expect(secondsLeft(new Date(now + 90_000).toISOString(), now)).toBe(90);
    expect(secondsLeft(new Date(now - 5_000).toISOString(), now)).toBe(0);
  });

  it('turns naira text into whole kobo, or nothing when it is not a positive amount', () => {
    expect(nairaToKobo('1500')).toBe(150000);
    expect(nairaToKobo('₦1,500.50')).toBe(150050);
    expect(nairaToKobo('0.5')).toBe(50);
    expect(nairaToKobo('12.345')).toBeNull();
    expect(nairaToKobo('0')).toBeNull();
    expect(nairaToKobo('-5')).toBeNull();
    expect(nairaToKobo('abc')).toBeNull();
    expect(nairaToKobo('')).toBeNull();
  });

  it('says why a wallet payment cannot start', () => {
    expect(walletPayState({ paymentsReady: true, open: true, balanceKobo: '500000', wantKobo: 300000 })).toEqual({ ok: true, reason: null });
    expect(walletPayState({ paymentsReady: false, open: true, balanceKobo: '500000', wantKobo: 1 }).reason).toMatch(/temporarily unavailable/);
    expect(walletPayState({ paymentsReady: true, open: false, balanceKobo: '0', wantKobo: 1 }).reason).toMatch(/Open your health wallet/);
    expect(walletPayState({ paymentsReady: true, open: true, balanceKobo: '1000', wantKobo: 5000 }).reason).toMatch(/has ₦10/);
    expect(walletPayState({ paymentsReady: true, open: true, balanceKobo: '1000', wantKobo: 0 }).ok).toBe(false);
    expect(walletPayState({ paymentsReady: undefined, open: true, balanceKobo: '5000', wantKobo: 100 }).ok).toBe(true);
  });

  it('explains a wallet failure in plain words: a timeout is not called a failure, a refusal shows the server reason', () => {
    expect(walletErrorMessage({ message: 'Network Error' })).toMatch(/may still have gone through.*will not charge you twice/);
    expect(walletErrorMessage({ response: { status: 503, data: { message: 'x' } } })).toMatch(/temporarily unavailable/);
    expect(walletErrorMessage({ response: { status: 400, data: { message: 'Invalid transaction PIN' } } })).toBe('Invalid transaction PIN');
    expect(walletErrorMessage({ response: { status: 409, data: { message: 'A payment for this invoice is still being confirmed.' } } })).toMatch(/still being confirmed/);
    expect(walletErrorMessage({ response: { status: 500, data: { message: 'Internal server error' } } })).toMatch(/our side/);
    expect(walletErrorMessage({ response: { status: 401 } })).toMatch(/sign in again/);
    expect(walletErrorMessage({ response: { status: 400, data: {} } })).toBe('That did not go through.');
    expect(walletErrorMessage(undefined)).toMatch(/may still have gone through/);
  });
});
