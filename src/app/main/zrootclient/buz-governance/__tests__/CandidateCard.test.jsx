import { render, screen } from '@testing-library/react';
import CandidateCard from '../components/CandidateCard';

describe('CandidateCard', () => {
  const candidate = { id: 'c1', name: 'Amina Yusuf', party: 'Independent', manifesto: 'Cleaner drains, safer streets.', index: 0 };

  it('renders candidate name, party and manifesto', () => {
    render(<CandidateCard candidate={candidate} />);
    expect(screen.getByText('Amina Yusuf')).toBeInTheDocument();
    expect(screen.getByText('Independent')).toBeInTheDocument();
    expect(screen.getByText('Cleaner drains, safer streets.')).toBeInTheDocument();
  });

  it('renders without a party', () => {
    render(<CandidateCard candidate={{ ...candidate, party: null }} />);
    expect(screen.getByText('Amina Yusuf')).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading prop passed', () => {
    render(<CandidateCard isLoading />);
    expect(screen.getByTestId('candidate-card-skeleton')).toBeInTheDocument();
  });
});
