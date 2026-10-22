import { render, screen } from '@testing-library/react';
import FeeLinesCard from '../components/FeeLinesCard';

const payer = {
  active: true, month: '2026-10', days: 31, role: 'PAYER', monthKobo: 670966, dayOfMonth: 20, accruedKobo: 103227,
  lines: [
    { kind: 'SELF', subjectLabel: 'You', monthKobo: 419355, accruedKobo: 64516 },
    { kind: 'SPOUSE', subjectLabel: 'Spouse cover', monthKobo: 83871, accruedKobo: 12903 },
    { kind: 'CHILD', subjectLabel: 'Child aged 11', monthKobo: 41935, accruedKobo: 6452 },
  ],
  coveredBy: null,
};

describe('FeeLinesCard', () => {
  it('shows nothing when the household fee is not in use', () => {
    expect(render(<FeeLinesCard data={{ month: '2026-10', active: false }} />).container).toBeEmptyDOMElement();
    expect(render(<FeeLinesCard data={undefined} />).container).toBeEmptyDOMElement();
  });

  it('shows the final fee for the month, the build-up so far with the days, and every line', () => {
    render(<FeeLinesCard data={payer} />);
    expect(screen.getByTestId('fee-month-total')).toHaveTextContent('₦6,709.66');
    expect(screen.getByTestId('fee-accrued')).toHaveTextContent('₦1,032.27');
    expect(screen.getByText('20 of 31 days')).toBeInTheDocument();
    expect(screen.getAllByTestId('fee-line').map((n) => n.textContent)).toEqual([
      'You₦645.16 of ₦4,193.55', 'Spouse cover₦129.03 of ₦838.71', 'Child aged 11₦64.52 of ₦419.35',
    ]);
  });

  it('a covered spouse is told they owe nothing and what their spouse pays to cover them', () => {
    render(<FeeLinesCard data={{ active: true, month: '2026-10', role: 'COVERED', lines: [], coveredBy: { payerUserId: 'p', coverKobo: 200000, fromDay: 19 } }} />);
    const card = screen.getByTestId('fee-lines-covered');
    expect(card).toHaveTextContent('you owe nothing this month');
    expect(card).toHaveTextContent('₦2,000');
    expect(card).toHaveTextContent('from day 19');
  });

  it('a covered spouse with no cover figure yet still sees the plain statement', () => {
    render(<FeeLinesCard data={{ active: true, month: '2026-10', role: 'COVERED', lines: [], coveredBy: null }} />);
    expect(screen.getByTestId('fee-lines-covered')).toHaveTextContent('Your spouse pays for both of you');
  });

  it('shows nothing for a person with no lines (nothing to pay this month)', () => {
    expect(render(<FeeLinesCard data={{ ...payer, lines: [] }} />).container).toBeEmptyDOMElement();
  });
});
