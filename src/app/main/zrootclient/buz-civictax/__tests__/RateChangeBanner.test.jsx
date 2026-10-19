import { render, screen } from '@testing-library/react';
import RateChangeBanner from '../components/RateChangeBanner';

describe('RateChangeBanner', () => {
  it('shows nothing when no change is scheduled', () => {
    const { container } = render(<RateChangeBanner notice={{ currentAmountKobo: 500000, scheduled: null }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows nothing before the notice has loaded', () => {
    const { container } = render(<RateChangeBanner notice={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('tells the citizen the new rate, the date and the current rate', () => {
    render(<RateChangeBanner notice={{ currentAmountKobo: 500000, scheduled: { amountKobo: 700000, effectiveFrom: '2026-12-01' } }} />);
    const banner = screen.getByTestId('rate-change-banner');
    expect(banner).toHaveTextContent('1 December 2026');
    expect(banner).toHaveTextContent('₦7,000');
    expect(banner).toHaveTextContent('now ₦5,000');
  });
});
