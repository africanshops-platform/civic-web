import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';
import { useLeagues, useLeagueDetail, usePlayers, useMatchStats, useMerchantPreview, useTeamName } from '../hooks/useFloodlightsRepo';

// Newly-real endpoints (League/Player-roster/match-stats/merchant-preview) —
// see project_youthsports_backend_growth memory. These tests lock in the
// real request shapes/response mapping so backend drift breaks a test here
// instead of silently reappearing as a UI bug.
jest.mock('app/configs/data/client/RepositoryAuthClient', () => ({
  AuthApi: jest.fn(),
}));

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

function mockApi(get) {
  AuthApi.mockReturnValue({ get });
}

describe('useLeagues', () => {
  it('requests /youth/leagues and exposes data/total', async () => {
    const get = jest.fn().mockResolvedValue({ data: { data: [{ id: 'l1', name: 'AMAC Youth League' }], total: 1 } });
    mockApi(get);

    function Harness() {
      const { data } = useLeagues({ sport: 'Football' });
      const l = data?.data?.leagues?.[0];
      return l ? <span data-testid="name">{l.name}</span> : null;
    }

    render(<Harness />, { wrapper });

    await waitFor(() => expect(screen.getByTestId('name')).toBeInTheDocument());
    expect(screen.getByTestId('name')).toHaveTextContent('AMAC Youth League');
    expect(get).toHaveBeenCalledWith('/youth/leagues', { params: { sport: 'Football' } });
  });

  it('defaults to an empty list when the response has no data array', async () => {
    const get = jest.fn().mockResolvedValue({ data: {} });
    mockApi(get);

    function Harness() {
      const { data } = useLeagues();
      return <span data-testid="count">{data?.data?.leagues?.length ?? 'unset'}</span>;
    }

    render(<Harness />, { wrapper });

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('0'));
  });
});

describe('useLeagueDetail', () => {
  it('is disabled until an id is provided', () => {
    const get = jest.fn();
    mockApi(get);

    function Harness() {
      useLeagueDetail(undefined);
      return null;
    }

    render(<Harness />, { wrapper });
    expect(get).not.toHaveBeenCalled();
  });

  it('fetches /youth/leagues/:id once an id is provided', async () => {
    const get = jest.fn().mockResolvedValue({ data: { id: 'l1', name: 'AMAC Youth League', seasons: [] } });
    mockApi(get);

    function Harness() {
      const { data } = useLeagueDetail('l1');
      return data?.data?.league ? <span data-testid="name">{data.data.league.name}</span> : null;
    }

    render(<Harness />, { wrapper });

    await waitFor(() => expect(screen.getByTestId('name')).toBeInTheDocument());
    expect(get).toHaveBeenCalledWith('/youth/leagues/l1');
  });
});

describe('usePlayers', () => {
  it('requests the real clubMerchantId-scoped roster endpoint', async () => {
    const get = jest.fn().mockResolvedValue({ data: { data: [{ id: 'p1', fullName: 'Test Player', jerseyNumber: 10 }] } });
    mockApi(get);

    function Harness() {
      const { data } = usePlayers('club-1');
      const p = data?.data?.players?.[0];
      return p ? <span data-testid="name">{p.fullName}</span> : null;
    }

    render(<Harness />, { wrapper });

    await waitFor(() => expect(screen.getByTestId('name')).toBeInTheDocument());
    expect(get).toHaveBeenCalledWith('/youth/players', { params: { clubMerchantId: 'club-1' } });
  });

  it('is disabled without a clubMerchantId', () => {
    const get = jest.fn();
    mockApi(get);

    function Harness() {
      usePlayers(undefined);
      return null;
    }

    render(<Harness />, { wrapper });
    expect(get).not.toHaveBeenCalled();
  });
});

describe('useMatchStats', () => {
  it('requests the public per-match stats endpoint', async () => {
    const get = jest.fn().mockResolvedValue({ data: { fouls: 3, yellowCards: 1, redCards: 0 } });
    mockApi(get);

    function Harness() {
      const { data } = useMatchStats('match-1');
      return data?.data ? <span data-testid="fouls">{data.data.fouls}</span> : null;
    }

    render(<Harness />, { wrapper });

    await waitFor(() => expect(screen.getByTestId('fouls')).toHaveTextContent('3'));
    expect(get).toHaveBeenCalledWith('/youth/matches/match-1/stats');
  });
});

describe('useMerchantPreview / useTeamName', () => {
  it('requests the public no-auth merchant preview endpoint', async () => {
    const get = jest.fn().mockResolvedValue({ data: { merchant: { id: 'm1', shopname: 'Ifeanyi Uba FC' } } });
    mockApi(get);

    function Harness() {
      const { data } = useMerchantPreview('m1');
      return data ? <span data-testid="shopname">{data.shopname}</span> : null;
    }

    render(<Harness />, { wrapper });

    await waitFor(() => expect(screen.getByTestId('shopname')).toHaveTextContent('Ifeanyi Uba FC'));
    expect(get).toHaveBeenCalledWith('/auth-merchant/get-merchant/m1/preview');
  });

  it('useTeamName returns the fallback while the lookup is pending', () => {
    const get = jest.fn(() => new Promise(() => { /* never resolves — simulates a pending request */ }));
    mockApi(get);

    function Harness() {
      const name = useTeamName('m1', 'Club e914b9');
      return <span data-testid="name">{name}</span>;
    }

    render(<Harness />, { wrapper });
    expect(screen.getByTestId('name')).toHaveTextContent('Club e914b9');
  });

  it('useTeamName does not fetch when managerId is missing', () => {
    const get = jest.fn();
    mockApi(get);

    function Harness() {
      const name = useTeamName(undefined, 'Club e914b9');
      return <span data-testid="name">{name}</span>;
    }

    render(<Harness />, { wrapper });
    expect(get).not.toHaveBeenCalled();
    expect(screen.getByTestId('name')).toHaveTextContent('Club e914b9');
  });
});
