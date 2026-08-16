import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';
import ProgrammesScreen from '../screens/ProgrammesScreen';

// GET /youth/programs has no server-side category filter (see
// project_youthsports_backend_growth memory) — the category chips are an
// honest client-side filter over the single fetched page. These lock in
// that specific, deliberately-limited behavior.
jest.mock('app/configs/data/client/RepositoryAuthClient', () => ({
  AuthApi: jest.fn(),
}));

jest.mock('@fuse/core/FusePageSimple/FusePageSimpleWithMargin', () => {
  function MockFusePageSimpleWithMargin({ header, content }) {
    return <div>{header}{content}</div>;
  }
  return MockFusePageSimpleWithMargin;
});

// Raw backend shape (real Prisma enum values: SPORTS/TECH, uppercase
// status) so this exercises the same normalizeProgram pipeline real
// traffic goes through, not a pre-normalized shortcut.
const PROGRAMS = [
  { id: 'p1', title: 'Lagos Football Academy', category: 'SPORTS', status: 'OPEN', ageGroup: 'U15', maxSlots: 20, enrolledCount: 1, lga: 'Ikeja', state: 'Lagos' },
  { id: 'p2', title: 'Lagos Youth Coding Bootcamp', category: 'TECH', status: 'OPEN', ageGroup: '15-25', maxSlots: 80, enrolledCount: 67, lga: 'Ikeja', state: 'Lagos' },
];

function renderWithProviders(initialEntries = ['/youth-v2/programs']) {
  const get = jest.fn().mockResolvedValue({ data: { data: PROGRAMS, total: PROGRAMS.length } });
  AuthApi.mockReturnValue({ get });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>
        <ProgrammesScreen />
      </MemoryRouter>
    </QueryClientProvider>
  );
  return { get };
}

describe('ProgrammesScreen', () => {
  it('shows every fetched programme when no category is selected', async () => {
    renderWithProviders();
    await waitFor(() => expect(screen.getByText('Lagos Football Academy')).toBeInTheDocument());
    expect(screen.getByText('Lagos Youth Coding Bootcamp')).toBeInTheDocument();
  });

  it('filters to only the matching category when a chip is clicked', async () => {
    renderWithProviders();
    await waitFor(() => expect(screen.getByText('Lagos Football Academy')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Sports/i }));

    expect(screen.getByText('Lagos Football Academy')).toBeInTheDocument();
    expect(screen.queryByText('Lagos Youth Coding Bootcamp')).not.toBeInTheDocument();
  });

  it('pre-selects the category from the ?category= query param, e.g. from the Hub chips', async () => {
    renderWithProviders(['/youth-v2/programs?category=technology']);
    await waitFor(() => expect(screen.getByText('Lagos Youth Coding Bootcamp')).toBeInTheDocument());
    expect(screen.queryByText('Lagos Football Academy')).not.toBeInTheDocument();
  });

  it('shows an honest empty state (not a blank grid) when a category has nothing on this page', async () => {
    renderWithProviders(['/youth-v2/programs?category=healthcare']);
    await waitFor(() => expect(screen.getByText(/No programmes in this category on this page/i)).toBeInTheDocument());
  });
});
