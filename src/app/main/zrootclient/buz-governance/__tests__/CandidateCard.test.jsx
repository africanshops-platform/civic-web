import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import CandidateCard from '../components/CandidateCard';
import { mockCandidates } from '../mock';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('CandidateCard', () => {
  const candidate = mockCandidates[0];

  it('renders candidate name', () => {
    render(<CandidateCard candidate={candidate} />, { wrapper });
    expect(screen.getByText(candidate.name)).toBeInTheDocument();
  });

  it('renders party abbreviation', () => {
    render(<CandidateCard candidate={candidate} />, { wrapper });
    expect(screen.getByText(candidate.party.abbreviation)).toBeInTheDocument();
  });

  it('renders vote percentage when provided', () => {
    render(<CandidateCard candidate={candidate} />, { wrapper });
    expect(screen.getByText(`${candidate.percentage}%`)).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading prop passed', () => {
    render(<CandidateCard isLoading />, { wrapper });
    expect(screen.getByTestId('candidate-card-skeleton')).toBeInTheDocument();
  });
});
