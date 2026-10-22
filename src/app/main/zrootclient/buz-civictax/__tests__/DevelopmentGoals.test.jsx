import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GoalCard from '../components/GoalCard';
import GoalGiveDialog from '../components/GoalGiveDialog';
import DevelopmentGoalsPage from '../screens/DevelopmentGoalsPage';
import { filterGoals, naira, pctOfTarget } from '../goalFunding';

const mockH = { goals: jest.fn(), projects: jest.fn(), give: jest.fn(), readiness: jest.fn(), auth: jest.fn() };
jest.mock('../hooks/useCivicTaxRepo', () => ({
  useGoalAdoptions: () => mockH.goals(),
  useGoalProjects: () => mockH.projects(),
  useGiveToGoal: () => ({ mutate: mockH.give, isLoading: false, isSuccess: false }),
  useCivicSubscriptionsReadiness: () => mockH.readiness(),
}));
jest.mock('src/app/hooks/useCivicWebAuth', () => ({ __esModule: true, default: () => mockH.auth() }));

const GOAL = {
  id: 'a1', lga: 'Abuja', state: 'FCT', targetKobo: '1000000', goal: { title: 'Clean Water', description: 'Boreholes', category: 'Water' },
  funding: { raisedKobo: '250000', disbursedKobo: '100000', balanceKobo: '150000' },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockH.goals.mockReturnValue({ data: [GOAL], isLoading: false, isError: false });
  mockH.projects.mockReturnValue({ data: [], isLoading: false });
  mockH.readiness.mockReturnValue({ data: { healthy: true } });
  mockH.auth.mockReturnValue({ isAuthenticated: true });
});

describe('helpers', () => {
  it('formats naira, works out progress and filters by LGA, state or title', () => {
    expect(naira('250000')).toBe('₦2,500');
    expect(pctOfTarget('250000', '1000000')).toBe(25);
    expect(pctOfTarget('1', null)).toBeNull();
    expect(filterGoals([GOAL], 'abuja')).toHaveLength(1);
    expect(filterGoals([GOAL], 'water')).toHaveLength(1);
    expect(filterGoals([GOAL], 'lagos')).toHaveLength(0);
  });
});

describe('GoalCard', () => {
  it('shows raised, spent and held from the ledger, and progress against the target', () => {
    render(<GoalCard goal={GOAL} onGive={() => {}} />);
    expect(screen.getByText('₦2,500')).toBeInTheDocument();
    expect(screen.getByText('₦1,000')).toBeInTheDocument();
    expect(screen.getByText('₦1,500')).toBeInTheDocument();
    expect(screen.getByText('25% of the ₦10,000 target')).toBeInTheDocument();
  });

  it('says so when funding figures are unavailable', () => {
    render(<GoalCard goal={{ ...GOAL, funding: null }} onGive={() => {}} />);
    expect(screen.getByText('Funding figures are not available right now.')).toBeInTheDocument();
  });

  it('lists the projects a goal funds with their steps and money paid out', () => {
    mockH.projects.mockReturnValue({
      data: [{ id: 'p1', title: 'Borehole Ward 3', milestones: [{ id: 'm1', title: 'Drill', status: 'COMPLETED', amountDisbursedKobo: '100000' }, { id: 'm2', title: 'Pump', status: 'PENDING', amountDisbursedKobo: '0' }] }],
      isLoading: false,
    });
    render(<GoalCard goal={GOAL} onGive={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'See the projects' }));
    expect(screen.getByText('1 of 2 steps done')).toBeInTheDocument();
    expect(screen.getByText(/Drill · done · ₦1,000 paid out/)).toBeInTheDocument();
    expect(screen.getByText(/Pump · planned/)).toBeInTheDocument();
  });
});

describe('GoalGiveDialog', () => {
  it('gives only from ₦100 up, and sends the chosen goal and amount', async () => {
    render(<GoalGiveDialog goal={GOAL} onClose={() => {}} />);
    const btn = () => screen.getByRole('button', { name: /^Give/ });
    expect(btn()).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Amount (₦)'), { target: { value: '50' } });
    expect(btn()).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '₦1,000' }));
    expect(btn()).toBeEnabled();
    fireEvent.click(btn());
    await waitFor(() => expect(mockH.give).toHaveBeenCalledWith({ adoptionId: 'a1', amount: 1000, note: '' }));
  });

  it('keeps the button off, with a clear message, while payment services are not ready', () => {
    mockH.readiness.mockReturnValue({ data: { healthy: false } });
    render(<GoalGiveDialog goal={GOAL} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '₦1,000' }));
    expect(screen.getByRole('button', { name: /^Give/ })).toBeDisabled();
    expect(screen.getByText('Payments are temporarily unavailable. Please try again shortly.')).toBeInTheDocument();
  });

  it('a gift to the LGA itself sends the place, not a goal', async () => {
    render(<GoalGiveDialog goal={GOAL} toLga onClose={() => {}} />);
    expect(screen.getByText('Give to Abuja local government')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '₦500' }));
    fireEvent.click(screen.getByRole('button', { name: /^Give/ }));
    await waitFor(() => expect(mockH.give).toHaveBeenCalledWith({ state: 'FCT', lga: 'Abuja', amount: 500, note: '' }));
  });

  it('tells the giver a gift is voluntary and not refundable', () => {
    render(<GoalGiveDialog goal={GOAL} onClose={() => {}} />);
    expect(screen.getByText(/cannot be refunded/)).toBeInTheDocument();
  });
});

describe('DevelopmentGoalsPage', () => {
  const page = () => render(<MemoryRouter><DevelopmentGoalsPage /></MemoryRouter>);

  it('is browsable without signing in, with a prompt to sign in to give', () => {
    mockH.auth.mockReturnValue({ isAuthenticated: false });
    page();
    expect(screen.getByText('Clean Water')).toBeInTheDocument();
    expect(screen.getByText('You can look around freely. Sign in to give.')).toBeInTheDocument();
  });

  it('opens the give dialog for a signed-in citizen and filters by search', () => {
    page();
    fireEvent.click(screen.getByRole('button', { name: 'Give to this goal' }));
    expect(screen.getByText(/Give to Clean Water/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.change(screen.getByLabelText('Search by LGA, state or goal'), { target: { value: 'lagos' } });
    expect(screen.getByTestId('no-goals')).toHaveTextContent('No goal matches your search.');
  });

  it('says so when no LGA has adopted a goal', () => {
    mockH.goals.mockReturnValue({ data: [], isLoading: false, isError: false });
    page();
    expect(screen.getByTestId('no-goals')).toHaveTextContent('No LGA has adopted a goal yet.');
  });
});
