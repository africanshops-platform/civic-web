import { render, screen } from '@testing-library/react';
import LiveCollationBoard from '../components/LiveCollationBoard';

jest.mock('react-apexcharts', () => () => <div data-testid="apex-chart" />);

const collation = {
  electionId: 'e1',
  status: 'COLLATING',
  summary: { wardsReported: 2, onlineVoters: 5, totalVotesCounted: 300 },
  candidates: [
    { candidateId: 'c1', name: 'Amina Yusuf', party: null, index: 0, totalVotes: 200, percentage: 66.7 },
    { candidateId: 'c2', name: 'Chidi Okafor', party: 'Independent', index: 1, totalVotes: 100, percentage: 33.3 },
  ],
};

describe('LiveCollationBoard', () => {
  it('renders the results heading and the ward and online counts from the service', () => {
    render(<LiveCollationBoard collation={collation} />);
    expect(screen.getByText('RESULTS SO FAR')).toBeInTheDocument();
    expect(screen.getByText(/2 wards reported · 5 voted online/)).toBeInTheDocument();
  });

  it('renders every candidate with their real vote share', () => {
    render(<LiveCollationBoard collation={collation} />);
    expect(screen.getByText('Amina Yusuf')).toBeInTheDocument();
    expect(screen.getByText('Chidi Okafor')).toBeInTheDocument();
    expect(screen.getByText('66.7%')).toBeInTheDocument();
  });

  it('says so, instead of showing zeros, when no ward has reported', () => {
    render(<LiveCollationBoard collation={{ ...collation, summary: { wardsReported: 0, onlineVoters: 0, totalVotesCounted: 0 } }} />);
    expect(screen.getByText(/No ward results have been reported yet/)).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading prop passed', () => {
    render(<LiveCollationBoard isLoading />);
    expect(screen.getByTestId('collation-board-skeleton')).toBeInTheDocument();
  });
});
