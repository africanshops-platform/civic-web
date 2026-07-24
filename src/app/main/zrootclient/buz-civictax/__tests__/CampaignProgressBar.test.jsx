import { render, screen, act } from '@testing-library/react';
import CampaignProgressBar from '../components/CampaignProgressBar';

describe('CampaignProgressBar', () => {
  it('renders raised and target amounts', () => {
    render(<CampaignProgressBar raised={2500000} target={5000000} />);
    expect(screen.getByText(/2,500,000/)).toBeInTheDocument();
    expect(screen.getByText(/5,000,000/)).toBeInTheDocument();
  });

  it('renders in compact mode', () => {
    render(<CampaignProgressBar raised={1000000} target={4000000} compact />);
    expect(screen.getByText(/1,000,000 raised/)).toBeInTheDocument();
  });

  it('caps percentage at 100 when over-funded', () => {
    // displayPercentage counts up from 0 via a real setInterval once isInView
    // fires (see jest.setup.cjs's IntersectionObserver stub) — fake timers let
    // the count-up finish deterministically instead of racing real wall-clock ms.
    jest.useFakeTimers();
    render(<CampaignProgressBar raised={6000000} target={5000000} />);
    act(() => { jest.advanceTimersByTime(1000); });
    expect(screen.getByText('100%')).toBeInTheDocument();
    jest.useRealTimers();
  });
});
