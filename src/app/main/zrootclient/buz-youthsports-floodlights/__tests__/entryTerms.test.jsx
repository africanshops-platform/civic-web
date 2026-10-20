import { fireEvent, render, screen } from '@testing-library/react';
import { entryTerms, isPaid, naira, payState } from '../entryTerms';
import PayEntryDialog from '../screens/PayEntryDialog';

describe('entryTerms', () => {
  it('says nothing for a free tournament open to everyone', () => {
    expect(entryTerms({ entryFeeKobo: null })).toEqual([]);
    expect(isPaid({ entryFeeKobo: 0 })).toBe(false);
  });

  it('states the fee, the area, the regional places and the ladder in plain words', () => {
    const t = { entryFeeKobo: 250000, state: 'Lagos', lga: 'Ikeja', eligibility: { level: 'STATE', quotaPerRegion: 3 }, feedsInto: { tournamentId: 'x', topK: 2 } };
    expect(entryTerms(t).map((x) => x.text)).toEqual([
      'Entry fee ₦2,500, paid from your wallet when you enter.',
      'Open to residents of Lagos.',
      'Up to 3 places per local government, so every area is represented.',
      'The top 2 move up to the next level automatically, free of any entry fee.',
    ]);
  });

  it('an LGA tournament names the local government; a national one with a quota counts places per state', () => {
    expect(entryTerms({ lga: 'Ikeja', eligibility: { level: 'LGA' } })[0].text).toBe('Open to residents of Ikeja.');
    expect(entryTerms({ eligibility: { level: 'COUNTRY', quotaPerRegion: 1 } }).map((x) => x.key)).toEqual(['quota']);
    expect(entryTerms({ eligibility: { level: 'COUNTRY', quotaPerRegion: 1 } })[0].text).toContain('per state');
  });

  it('formats kobo as naira', () => expect(naira(10000)).toBe('₦100'));
});

describe('payState', () => {
  const base = { paymentsReady: true, hasAccount: true, balanceNaira: 5000, feeKobo: 250000 };
  it('lets a funded citizen pay when payments are up', () => expect(payState(base)).toEqual({ ok: true, reason: null }));
  it('keeps the button off while payments are down, with no wallet, or with too little money', () => {
    expect(payState({ ...base, paymentsReady: false })).toMatchObject({ ok: false, reason: expect.stringMatching(/temporarily unavailable/) });
    expect(payState({ ...base, hasAccount: false })).toMatchObject({ ok: false, reason: expect.stringMatching(/wallet/) });
    expect(payState({ ...base, balanceNaira: 1000 })).toMatchObject({ ok: false, reason: expect.stringMatching(/₦1,000/) });
  });
  it('does not block on a readiness answer that has not arrived yet', () => {
    expect(payState({ ...base, paymentsReady: undefined }).ok).toBe(true);
  });
});

describe('PayEntryDialog', () => {
  const t = { name: 'Lagos Chess Open', entryFeeKobo: 250000 };
  it('shows what will be charged and only enables Pay once a PIN of 4 or more digits is typed', () => {
    const onConfirm = jest.fn();
    render(<PayEntryDialog open tournament={t} onClose={() => {}} onConfirm={onConfirm} balanceNaira={5000} />);
    expect(screen.getByTestId('pay-summary')).toHaveTextContent('₦2,500 is taken from your wallet (balance ₦5,000)');
    const pay = screen.getByRole('button', { name: 'Pay ₦2,500' });
    expect(pay).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Transaction PIN'), { target: { value: '48x2913' } });
    expect(pay).toBeEnabled();
    fireEvent.click(pay);
    expect(onConfirm).toHaveBeenCalledWith('482913'); // digits only, at most 6
  });

  it('cannot be pressed twice while a payment is in progress', () => {
    render(<PayEntryDialog open tournament={t} onClose={() => {}} onConfirm={() => {}} busy />);
    fireEvent.change(screen.getByLabelText('Transaction PIN'), { target: { value: '1234' } });
    expect(screen.getAllByRole('button').find((b) => b.className.includes('MuiButton-contained'))).toBeDisabled();
  });
});
