import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';
import { colorFor, initials, naira, computeForm, Avatar, FormDots, Pill, TeamName, TeamIdentity } from '../screens/shared/flHelpers';

jest.mock('app/configs/data/client/RepositoryAuthClient', () => ({
  AuthApi: jest.fn(),
}));

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('colorFor', () => {
  it('is deterministic for the same seed', () => {
    expect(colorFor('Ifeanyi Uba FC')).toBe(colorFor('Ifeanyi Uba FC'));
  });

  it('returns a value from the fixed palette', () => {
    const PALETTE = ['#B8791E', '#1F8F4E', '#2B6CB0', '#B23A48', '#6B4FA0', '#0F766E', '#A16207', '#9D174D'];
    expect(PALETTE).toContain(colorFor('Comfort Nwachukwu'));
  });

  it('handles an empty seed without throwing', () => {
    expect(() => colorFor('')).not.toThrow();
    expect(() => colorFor(undefined)).not.toThrow();
  });
});

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('Ifeanyi Uba FC')).toBe('IU');
  });

  it('uppercases single-word names', () => {
    expect(initials('okafor')).toBe('O');
  });

  it('handles an empty name without throwing', () => {
    expect(initials('')).toBe('');
  });
});

describe('naira', () => {
  it('formats with a naira sign and thousands separators', () => {
    expect(naira(450000)).toBe('₦450,000');
  });

  it('treats null/undefined as zero rather than throwing', () => {
    expect(naira(null)).toBe('₦0');
    expect(naira(undefined)).toBe('₦0');
  });
});

describe('computeForm', () => {
  const teamId = 'team1';

  it('returns W for a completed match won at home', () => {
    const matches = [{ isCompleted: true, homeTeamId: teamId, awayTeamId: 'team2', homeScore: 2, awayScore: 0 }];
    expect(computeForm(teamId, matches)).toEqual(['W']);
  });

  it('returns L for a completed match lost away', () => {
    const matches = [{ isCompleted: true, homeTeamId: 'team2', awayTeamId: teamId, homeScore: 2, awayScore: 0 }];
    expect(computeForm(teamId, matches)).toEqual(['L']);
  });

  it('returns D for a drawn match', () => {
    const matches = [{ isCompleted: true, homeTeamId: teamId, awayTeamId: 'team2', homeScore: 1, awayScore: 1 }];
    expect(computeForm(teamId, matches)).toEqual(['D']);
  });

  it('ignores matches not involving this team', () => {
    const matches = [{ isCompleted: true, homeTeamId: 'team2', awayTeamId: 'team3', homeScore: 1, awayScore: 0 }];
    expect(computeForm(teamId, matches)).toEqual([]);
  });

  it('ignores incomplete matches', () => {
    const matches = [{ isCompleted: false, homeTeamId: teamId, awayTeamId: 'team2', homeScore: null, awayScore: null }];
    expect(computeForm(teamId, matches)).toEqual([]);
  });

  it('keeps only the most recent 5 results, oldest dropped first', () => {
    const win = { isCompleted: true, homeTeamId: teamId, awayTeamId: 'team2', homeScore: 1, awayScore: 0 };
    const loss = { isCompleted: true, homeTeamId: teamId, awayTeamId: 'team2', homeScore: 0, awayScore: 1 };
    const matches = [loss, win, win, win, win, win]; // 6 matches, first is a loss that should be dropped
    expect(computeForm(teamId, matches)).toEqual(['W', 'W', 'W', 'W', 'W']);
  });

  it('defaults matches to an empty array when omitted', () => {
    expect(computeForm(teamId)).toEqual([]);
  });
});

describe('FormDots', () => {
  it('renders nothing for an empty form', () => {
    const { container } = render(<FormDots form={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders one dot per result with an accessible label', () => {
    render(<FormDots form={['W', 'D', 'L']} />);
    expect(screen.getByLabelText('Recent form: W, D, L')).toBeInTheDocument();
    expect(screen.getAllByText(/^[WDL]$/)).toHaveLength(3);
  });
});

describe('Pill', () => {
  it('renders children and a live dot when live is true', () => {
    const { container } = render(<Pill variant="live" live>LIVE</Pill>);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(container.querySelector('.fl2-dot')).toBeInTheDocument();
  });

  it('omits the live dot when live is falsy', () => {
    const { container } = render(<Pill variant="gold">Upcoming</Pill>);
    expect(container.querySelector('.fl2-dot')).not.toBeInTheDocument();
  });
});

describe('Avatar', () => {
  it('renders initials derived from the given name', () => {
    render(<Avatar name="Ifeanyi Uba FC" size={40} />);
    expect(screen.getByText('IU')).toBeInTheDocument();
  });
});

describe('TeamName / TeamIdentity (real-name resolution)', () => {
  function mockApi(get) {
    AuthApi.mockReturnValue({ get });
  }

  it('resolves the real merchant shopname over the placeholder teamName', async () => {
    const get = jest.fn().mockResolvedValue({ data: { merchant: { shopname: 'Ifeanyi Uba FC' } } });
    mockApi(get);

    render(<TeamName team={{ managerId: 'm1', teamName: 'Club e914b9' }} />, { wrapper });

    await waitFor(() => expect(get).toHaveBeenCalledWith('/auth-merchant/get-merchant/m1/preview'));
  });

  it('falls back to the placeholder teamName when the merchant lookup fails', async () => {
    const get = jest.fn().mockRejectedValue(new Error('not found'));
    mockApi(get);

    render(
      <TeamIdentity team={{ id: 't1', managerId: 'm-missing', teamName: 'Club e914b9' }} />,
      { wrapper }
    );

    await waitFor(() => expect(screen.getByText('Club e914b9')).toBeInTheDocument());
  });

  it('falls back to "TBD" when no team is passed at all', () => {
    render(<TeamName team={undefined} />, { wrapper });
    expect(screen.getByText('TBD')).toBeInTheDocument();
  });
});
