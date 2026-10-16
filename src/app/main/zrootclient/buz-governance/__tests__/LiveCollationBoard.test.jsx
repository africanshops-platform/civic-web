import { render, screen } from '@testing-library/react';
import LiveCollationBoard from '../components/LiveCollationBoard';

jest.mock('react-apexcharts', () => () => <div data-testid="apex-chart" />);

const collation = {
  electionId: 'e1',
  status: 'COLLATING',
  summary: { wardsReported: 2, onlineVoters: 5, totalVotesCounted: 300, onlineTallyStatus: 'AFTER_CLOSE', onlineValid: 0, onlineRejected: 0, onlineMismatch: false },
  candidates: [
    { candidateId: 'c1', name: 'Amina Yusuf', party: null, index: 0, wardVotes: 200, onlineVotes: null, totalVotes: 200, percentage: 66.7 },
    { candidateId: 'c2', name: 'Chidi Okafor', party: 'Independent', index: 1, wardVotes: 100, onlineVotes: null, totalVotes: 100, percentage: 33.3 },
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
    render(<LiveCollationBoard collation={{ ...collation, summary: { wardsReported: 0, onlineVoters: 0, totalVotesCounted: 0, onlineTallyStatus: 'AFTER_CLOSE', onlineValid: 0, onlineRejected: 0, onlineMismatch: false } }} />);
    expect(screen.getByText(/No votes have been counted yet/)).toBeInTheDocument();
  });

  it('says online votes are secret until voting closes', () => {
    render(<LiveCollationBoard collation={collation} />);
    expect(screen.getByText(/counted when voting closes/)).toBeInTheDocument();
  });

  it('shows the published online count with each candidate\'s ward and online parts, and flags a mismatch', () => {
    const published = {
      ...collation,
      summary: { ...collation.summary, onlineTallyStatus: 'PUBLISHED', onlineValid: 5, onlineRejected: 1, onlineMismatch: true },
      candidates: [{ ...collation.candidates[0], wardVotes: 200, onlineVotes: 4, totalVotes: 204 }, collation.candidates[1]],
    };
    render(<LiveCollationBoard collation={published} />);
    expect(screen.getByText(/5 valid, 1 rejected/)).toBeInTheDocument();
    expect(screen.getByText(/200 ward \+ 4 online/)).toBeInTheDocument();
    expect(screen.getByText(/does not match the number of voters/)).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading prop passed', () => {
    render(<LiveCollationBoard isLoading />);
    expect(screen.getByTestId('collation-board-skeleton')).toBeInTheDocument();
  });
});
