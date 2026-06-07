import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import GovernanceLandingPage from '../screens/GovernanceLandingPage';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe('GovernanceLandingPage', () => {
  it('renders the hero headline', () => {
    render(<GovernanceLandingPage />, { wrapper });
    expect(screen.getByText(/Your Vote/i)).toBeInTheDocument();
  });

  it('renders the View Elections CTA button', () => {
    render(<GovernanceLandingPage />, { wrapper });
    expect(screen.getByRole('link', { name: /View Elections/i })).toBeInTheDocument();
  });

  it('renders trust badges', () => {
    render(<GovernanceLandingPage />, { wrapper });
    expect(screen.getByText('NIN Verified')).toBeInTheDocument();
    expect(screen.getByText('Audit Trail Enabled')).toBeInTheDocument();
  });

  it('renders how it works section', () => {
    render(<GovernanceLandingPage />, { wrapper });
    expect(screen.getByText('Register & Verify')).toBeInTheDocument();
    expect(screen.getByText('Cast Your Vote')).toBeInTheDocument();
    expect(screen.getByText('Track Results Live')).toBeInTheDocument();
  });
});
