import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import GovernanceLandingPage from '../screens/GovernanceLandingPage';

jest.mock('src/app/hooks/useCivicWebAuth', () => () => ({ isAuthenticated: false }));
jest.mock('app/configs/data/client/RepositoryAuthClient', () => ({ AuthApi: () => ({ get: () => Promise.resolve({ data: { items: [] } }) }) }));

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe('GovernanceLandingPage', () => {
  it('renders the hero headline', () => {
    render(<GovernanceLandingPage />, { wrapper });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Your Vote/i);
  });

  it('renders the browse community votes CTA', () => {
    render(<GovernanceLandingPage />, { wrapper });
    expect(screen.getAllByRole('link', { name: /Browse Community Votes/i }).length).toBeGreaterThan(0);
  });

  it('never claims government or electoral-commission backing', () => {
    render(<GovernanceLandingPage />, { wrapper });
    expect(screen.queryByText(/INEC/i)).toBeNull();
    expect(screen.queryByText(/Digital Democracy/i)).toBeNull();
    expect(screen.getAllByText(/independent/i).length).toBeGreaterThan(0);
  });

  it('renders trust badges and how it works', () => {
    render(<GovernanceLandingPage />, { wrapper });
    expect(screen.getByText('Secret Ballot')).toBeInTheDocument();
    expect(screen.getByText('Public Audit Trail')).toBeInTheDocument();
    expect(screen.getByText('Verify Your Identity')).toBeInTheDocument();
    expect(screen.getByText('Cast Your Vote')).toBeInTheDocument();
    expect(screen.getByText('Follow the Results')).toBeInTheDocument();
  });
});
