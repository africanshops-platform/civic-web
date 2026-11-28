import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import CivicTaxLandingPage from '../screens/CivicTaxLandingPage';
import { useCampaigns } from '../hooks/useCivicTaxRepo';

jest.mock('src/app/hooks/useCivicWebAuth', () => () => ({ isAuthenticated: false }));
jest.mock('../hooks/useCivicTaxRepo', () => ({ useCampaigns: jest.fn() }));

const campaign = { id: 'c1', title: 'Broken borehole', description: 'Out of order.', category: 'infrastructure', status: 'active', raisedAmount: 23500, targetAmount: 50000, contributorsCount: 1, jurisdiction: { lga: 'Abuja' } };
const serverReturns = (campaigns) => useCampaigns.mockReturnValue({ data: { data: { campaigns, pagination: { total: campaigns.length } } } });

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe('CivicTaxLandingPage', () => {
  beforeEach(() => serverReturns([campaign]));

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

  it('shows the figures worked out from the server campaigns', () => {
    render(<CivicTaxLandingPage />, { wrapper });
    expect(screen.getAllByText('₦23,500').length).toBeGreaterThan(0);
    expect(screen.queryByText(/22\.3M|5,469/)).not.toBeInTheDocument();
  });

  it('shows no figures and no featured campaigns when the server has none', () => {
    serverReturns([]);
    render(<CivicTaxLandingPage />, { wrapper });
    expect(screen.queryByTestId('campaign-card')).not.toBeInTheDocument();
    expect(screen.queryByText('Raised so far')).not.toBeInTheDocument();
  });

  it('renders "Join the Movement" CTA button', () => {
    render(<CivicTaxLandingPage />, { wrapper });
    expect(screen.getByText('Join the Movement')).toBeInTheDocument();
  });
});
