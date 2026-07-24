import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import CivicTaxLandingPage from '../screens/CivicTaxLandingPage';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe('CivicTaxLandingPage', () => {
  it('renders hero headline', () => {
    render(<CivicTaxLandingPage />, { wrapper });
    expect(screen.getByText(/Fund the Nigeria/i)).toBeInTheDocument();
  });

  it('renders "Browse Campaigns" CTA', () => {
    render(<CivicTaxLandingPage />, { wrapper });
    // Two real CTAs link to /civictax/campaigns (hero + further down the page) —
    // genuinely both there, not a bug, so assert at least one exists.
    expect(screen.getAllByText('Browse Campaigns').length).toBeGreaterThan(0);
  });

  it('renders "How It Works" section', () => {
    render(<CivicTaxLandingPage />, { wrapper });
    expect(screen.getByText('How It Works')).toBeInTheDocument();
  });

  it('renders featured campaigns', () => {
    render(<CivicTaxLandingPage />, { wrapper });
    expect(screen.getAllByTestId('campaign-card').length).toBeGreaterThan(0);
  });

  it('renders "Join the Movement" CTA button', () => {
    render(<CivicTaxLandingPage />, { wrapper });
    expect(screen.getByText('Join the Movement')).toBeInTheDocument();
  });
});
