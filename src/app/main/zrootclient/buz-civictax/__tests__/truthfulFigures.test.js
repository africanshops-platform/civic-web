import { landingStats } from '../landingStats';
import { normalizeContribution, contributionStats } from '../contributionView';
import { yearCompliance } from '../compliance';

describe('landing figures', () => {
  const campaigns = [
    { raisedAmount: 1000, status: 'active' },
    { raisedAmount: 23500, status: 'completed' },
  ];

  it('adds up only the campaigns the server returned', () => {
    expect(landingStats(campaigns, 2).map((s) => s.value)).toEqual(['₦24,500', '2', '1', '1']);
  });

  it('shows nothing when there are no campaigns', () => {
    expect(landingStats([], 0)).toEqual([]);
  });

  it('shows no totals when only part of the list was loaded', () => {
    expect(landingStats(campaigns, 80)).toEqual([{ emoji: '📋', value: '80', label: 'Campaigns' }]);
  });
});

describe('my contributions', () => {
  const row = (over) =>
    normalizeContribution({ id: 'a', campaignId: 'c1', amountKobo: '150000', status: 'COMPLETED', campaign: { title: 'Borehole', lga: 'Abuja' }, ...over });

  it('turns kobo into naira and reads the campaign name', () => {
    expect(row()).toMatchObject({ amountNaira: 1500, campaignTitle: 'Borehole', lga: 'Abuja', status: 'completed' });
  });

  it('counts only completed contributions as given', () => {
    const stats = contributionStats([row(), row({ amountKobo: '999900', status: 'FAILED', campaignId: 'c2' })], 2);
    expect(stats).toMatchObject({ complete: true, givenNaira: 1500, campaigns: 1, lgas: 1 });
  });

  it('gives no totals for a partial list', () => {
    expect(contributionStats([row()], 40)).toEqual({ count: 40, complete: false });
  });
});

describe('months paid', () => {
  const bill = (m, uiStatus = 'paid') => ({ monthKey: `2026-${String(m).padStart(2, '0')}`, uiStatus });
  const year = Array.from({ length: 12 }, (_, i) => bill(i + 1));

  it('never shows more than 12 when a month has two bills', () => {
    const result = yearCompliance([...year, bill(1), bill(2)], 2026);
    expect(result.paidMonths).toBe(12);
    expect(result.complianceScore).toBe(100);
  });

  it('does not count a month with one of its bills unpaid', () => {
    expect(yearCompliance([bill(1), bill(1, 'overdue'), bill(2)], 2026)).toMatchObject({ paidMonths: 1, dueMonths: 2, complianceScore: 50, eligible: false });
  });

  it('keeps the score at 100 or less when months are paid ahead', () => {
    const ahead = (m) => ({ ...bill(m), isFutureMonth: true });
    expect(yearCompliance([bill(1, 'overdue'), ahead(12), ahead(11)], 2026)).toMatchObject({ paidMonths: 2, dueMonths: 1, complianceScore: 0 });
  });

  it('ignores other years', () => {
    expect(yearCompliance([{ monthKey: '2025-12', uiStatus: 'paid' }], 2026).paidMonths).toBe(0);
  });
});
