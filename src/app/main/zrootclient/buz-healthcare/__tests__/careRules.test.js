import { naira, nextSteps, readingFrom, readingReady, secondsLeft } from '../careRules';

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
});
