import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';
import { usePrograms, useProgramDetail, useTournaments, useTalents } from '../hooks/useYouthSportsRepo';

// Real backend fields (YouthProgram/SportsTournament/TalentSpotlight, per
// apps/youthsports-service/prisma/schema.prisma) differ from what these screens
// were originally built against on mock data — these tests lock in the
// normalizers that bridge that gap, so a future schema/DTO drift breaks a test
// here instead of silently reappearing as a UI bug (e.g. the null-date
// `new Date(null)` -> "1 January 1970" regression this exact wiring surfaced live).
jest.mock('app/configs/data/client/RepositoryAuthClient', () => ({
  AuthApi: jest.fn(),
}));

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

function mockApi({ get }) {
  AuthApi.mockReturnValue({ get });
}

describe('usePrograms', () => {
  it('normalizes category, status, slots, location, and duration', async () => {
    const get = jest.fn().mockResolvedValue({
      data: {
        data: [{
          id: 'p1', title: 'Lagos Football Academy', category: 'SPORTS', status: 'OPEN',
          maxSlots: 20, enrolledCount: 1, ageGroup: 'U15', lga: 'Ikeja', state: 'Lagos',
          startDate: '2026-07-01T00:00:00Z', endDate: '2026-09-30T00:00:00Z',
        }],
        total: 1,
      },
    });
    mockApi({ get });

    function Harness() {
      const { data } = usePrograms();
      const p = data?.data?.programs?.[0];
      if (!p) return null;
      return (
        <div>
          <span data-testid="category">{p.category}</span>
          <span data-testid="status">{p.status}</span>
          <span data-testid="slots">{p.slots}</span>
          <span data-testid="location">{p.location.address}</span>
          <span data-testid="duration">{p.duration}</span>
        </div>
      );
    }

    render(<Harness />, { wrapper });

    await waitFor(() => expect(screen.getByTestId('category')).toBeInTheDocument());
    expect(screen.getByTestId('category')).toHaveTextContent('sports');
    expect(screen.getByTestId('status')).toHaveTextContent('open');
    expect(screen.getByTestId('slots')).toHaveTextContent('20');
    expect(screen.getByTestId('location')).toHaveTextContent('Ikeja, Lagos');
    // 2026-07-01 -> 2026-09-30 is 91 days: >= the 60-day threshold, so formatDuration
    // reports months (3), not weeks — verify against the actual formula if this ever changes.
    expect(screen.getByTestId('duration')).toHaveTextContent('3 months');
    expect(get).toHaveBeenCalledWith('/youth/programs', { params: { page: 1, limit: 20 } });
  });

  it('sends sport/ageGroup/lga filters as real query params', async () => {
    const get = jest.fn().mockResolvedValue({ data: { data: [], total: 0 } });
    mockApi({ get });

    function Harness() {
      usePrograms({ sport: 'football', ageGroup: 'U18', lga: 'Ikeja' });
      return null;
    }

    render(<Harness />, { wrapper });

    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(get).toHaveBeenCalledWith('/youth/programs', {
      params: { sport: 'football', ageGroup: 'U18', lga: 'Ikeja', page: 1, limit: 20 },
    });
  });
});

describe('useProgramDetail', () => {
  it('normalizes a program with no start/end date without producing an epoch date', async () => {
    const get = jest.fn().mockResolvedValue({
      data: {
        id: 'p1', title: 'Lagos Football Academy', category: 'SPORTS', status: 'OPEN',
        maxSlots: 20, enrolledCount: 1, ageGroup: 'U15', lga: 'Ikeja', state: 'Lagos',
        startDate: null, endDate: null,
      },
    });
    mockApi({ get });

    function Harness() {
      const { data } = useProgramDetail('p1');
      const p = data?.data?.program;
      if (!p) return null;
      return <span data-testid="duration">{p.duration === null ? 'null' : p.duration}</span>;
    }

    render(<Harness />, { wrapper });

    await waitFor(() => expect(screen.getByTestId('duration')).toBeInTheDocument());
    // Regression guard: ProgramDetailPage only renders the "Programme Dates" block
    // when startDate/endDate are truthy — normalizeProgram must pass nulls through
    // as null (not coerce them), or that guard silently stops working.
    expect(screen.getByTestId('duration')).toHaveTextContent('null');
  });
});

describe('useTournaments', () => {
  it('normalizes name->title, currentTeams->teamsRegistered, and lowercases status', async () => {
    const get = jest.fn().mockResolvedValue({
      data: {
        data: [{
          id: 't1', name: 'Lagos Youth Championship', sport: 'football', status: 'UPCOMING',
          format: 'KNOCKOUT', maxTeams: 16, currentTeams: 4, lga: 'Ikeja', state: 'Lagos',
        }],
        total: 1,
      },
    });
    mockApi({ get });

    function Harness() {
      const { data } = useTournaments();
      const t = data?.data?.tournaments?.[0];
      if (!t) return null;
      return (
        <div>
          <span data-testid="title">{t.title}</span>
          <span data-testid="status">{t.status}</span>
          <span data-testid="teams">{t.teamsRegistered}</span>
          <span data-testid="venue">{t.venue}</span>
        </div>
      );
    }

    render(<Harness />, { wrapper });

    await waitFor(() => expect(screen.getByTestId('title')).toBeInTheDocument());
    expect(screen.getByTestId('title')).toHaveTextContent('Lagos Youth Championship');
    expect(screen.getByTestId('status')).toHaveTextContent('upcoming');
    expect(screen.getByTestId('teams')).toHaveTextContent('4');
    expect(screen.getByTestId('venue')).toHaveTextContent('Ikeja, Lagos');
  });
});

describe('useTalents', () => {
  it('normalizes displayName->name, sport->discipline, and isVerified->verified', async () => {
    const get = jest.fn().mockResolvedValue({
      data: {
        data: [{
          id: 's1', displayName: 'Chinonso Obi', sport: 'football', bio: 'Midfielder.',
          achievements: ['Best Player 2025'], isVerified: true, lga: 'Surulere', state: 'Lagos',
        }],
        total: 1,
      },
    });
    mockApi({ get });

    function Harness() {
      const { data } = useTalents();
      const t = data?.data?.talents?.[0];
      if (!t) return null;
      return (
        <div>
          <span data-testid="name">{t.name}</span>
          <span data-testid="discipline">{t.discipline}</span>
          <span data-testid="verified">{String(t.verified)}</span>
        </div>
      );
    }

    render(<Harness />, { wrapper });

    await waitFor(() => expect(screen.getByTestId('name')).toBeInTheDocument());
    expect(screen.getByTestId('name')).toHaveTextContent('Chinonso Obi');
    expect(screen.getByTestId('discipline')).toHaveTextContent('football');
    expect(screen.getByTestId('verified')).toHaveTextContent('true');
  });

  it('sends sport as the real filter param', async () => {
    const get = jest.fn().mockResolvedValue({ data: { data: [], total: 0 } });
    mockApi({ get });

    function Harness() {
      useTalents({ sport: 'chess' });
      return null;
    }

    render(<Harness />, { wrapper });

    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(get).toHaveBeenCalledWith('/youth/spotlights', { params: { sport: 'chess', page: 1, limit: 20 } });
  });
});
