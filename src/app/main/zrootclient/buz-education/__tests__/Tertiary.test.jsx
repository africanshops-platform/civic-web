import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { applyReady, fileProblem, flattenProgrammes, MAX_FILE_BYTES } from '../tertiary';
import TertiaryApplicationsPage from '../screens/TertiaryApplicationsPage';
import TertiaryProgrammesPage from '../screens/TertiaryProgrammesPage';

const mockH = { tree: jest.fn(), mine: jest.fn(), apply: jest.fn(), upload: jest.fn(), auth: jest.fn() };
jest.mock('../hooks/useEducationRepo', () => ({
  useTertiaryProgrammes: () => mockH.tree(),
  useMyTertiaryApplications: () => mockH.mine(),
  useApplyTertiary: () => ({ mutate: mockH.apply, isLoading: false, isSuccess: false }),
  useUploadTertiaryDocument: () => ({ mutate: mockH.upload, isLoading: false }),
}));
jest.mock('src/app/hooks/useCivicWebAuth', () => ({ __esModule: true, default: () => mockH.auth() }));
jest.mock('react-router-dom', () => ({ ...jest.requireActual('react-router-dom'), useParams: () => ({ schoolId: 's1' }) }));
jest.mock('./../screens/EducationPageShell', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('react-toastify', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

const tree = {
  school: { id: 's1', name: 'Federal University', lga: 'Abuja', state: 'FCT' },
  faculties: [{ id: 'f1', name: 'Arts', departments: [{ id: 'd1', name: 'History', programmes: [{ id: 'p1', name: 'BA History', award: 'BA', durationYears: 4 }] }] }],
};

describe('tertiary helpers', () => {
  it('flattens the tree to programmes with their faculty and department', () => {
    expect(flattenProgrammes({ faculties: tree.faculties })).toEqual([{ id: 'p1', name: 'BA History', award: 'BA', durationYears: 4, faculty: 'Arts', department: 'History' }]);
    expect(flattenProgrammes(undefined)).toEqual([]);
  });
  it('checks a chosen file', () => {
    expect(fileProblem(undefined)).toBe('Choose a file');
    expect(fileProblem({ size: MAX_FILE_BYTES + 1, type: 'image/png' })).toMatch(/too large/);
    expect(fileProblem({ size: 10, type: 'text/plain' })).toBe('Use a photo or a PDF');
    expect(fileProblem({ size: 10, type: 'application/pdf' })).toBeNull();
    expect(fileProblem({ size: 10, type: 'image/jpeg' })).toBeNull();
  });
  it('is ready to send only with a name, a programme and a real date', () => {
    expect(applyReady({ name: ' ', programmeId: 'p1', start: '2027-09-01' })).toBe(false);
    expect(applyReady({ name: 'Ada', programmeId: '', start: '2027-09-01' })).toBe(false);
    expect(applyReady({ name: 'Ada', programmeId: 'p1', start: 'nope' })).toBe(false);
    expect(applyReady({ name: 'Ada', programmeId: 'p1', start: '2027-09-01' })).toBe(true);
  });
});

describe('TertiaryProgrammesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockH.tree.mockReturnValue({ data: { data: tree }, isLoading: false, isError: false });
    mockH.auth.mockReturnValue({ isAuthenticated: true });
  });
  const page = () => render(<MemoryRouter><TertiaryProgrammesPage /></MemoryRouter>);

  it('lists faculties, departments and programmes for anyone', () => {
    mockH.auth.mockReturnValue({ isAuthenticated: false });
    page();
    expect(screen.getByText('Federal University')).toBeInTheDocument();
    expect(screen.getByText('BA History (BA, 4 years)')).toBeInTheDocument();
    expect(screen.getByText('Sign in to apply.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send application' })).toBeDisabled();
  });

  it('says so when no programmes are listed yet', () => {
    mockH.tree.mockReturnValue({ data: { data: { ...tree, faculties: [] } }, isLoading: false, isError: false });
    page();
    expect(screen.getByTestId('no-programmes')).toBeInTheDocument();
  });

  it('sends the application with the typed name and the chosen programme', async () => {
    page();
    fireEvent.change(screen.getByLabelText('Your full name, as on your documents'), { target: { value: ' Ada Obi ' } });
    fireEvent.change(screen.getByLabelText('When do you want to start?'), { target: { value: '2027-09-01' } });
    fireEvent.mouseDown(screen.getByLabelText('Programme'));
    fireEvent.click(await screen.findByRole('option', { name: /BA History/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Send application' }));
    await waitFor(() => expect(mockH.apply).toHaveBeenCalledWith({ schoolId: 's1', programmeId: 'p1', intendedStartDate: '2027-09-01', applicantName: 'Ada Obi' }));
  });
});

describe('TertiaryApplicationsPage', () => {
  const app = (over = {}) => ({
    id: 'a1', status: 'PENDING', school: { name: 'Federal University' }, programme: { name: 'BA History', award: 'BA' }, decisionNote: null,
    checklist: [{ kind: 'RESULTS', label: 'Exam results', uploaded: true }, { kind: 'ID', label: 'Identity document', uploaded: false }],
    missingDocs: ['ID'], ...over,
  });
  const page = () => render(<MemoryRouter><TertiaryApplicationsPage /></MemoryRouter>);

  it('shows the checklist and how many documents are still needed', () => {
    mockH.mine.mockReturnValue({ data: { data: { applications: [app()] } }, isLoading: false, isError: false });
    page();
    expect(screen.getByText('✔ Exam results')).toBeInTheDocument();
    expect(screen.getByText('○ Identity document')).toBeInTheDocument();
    expect(screen.getByTestId('missing-a1')).toHaveTextContent('The school needs 1 more document before it can admit you.');
    expect(screen.getByRole('button', { name: 'Replace' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
  });

  it('locks the documents once the school has decided, and welcomes an admitted student', () => {
    mockH.mine.mockReturnValue({ data: { data: { applications: [app({ status: 'APPROVED', missingDocs: [] })] } }, isLoading: false, isError: false });
    page();
    expect(screen.queryByRole('button', { name: 'Upload' })).toBeNull();
    expect(screen.getByText(/You have been admitted/)).toBeInTheDocument();
  });

  it('says so when there are none', () => {
    mockH.mine.mockReturnValue({ data: { data: { applications: [] } }, isLoading: false, isError: false });
    page();
    expect(screen.getByTestId('none')).toBeInTheDocument();
  });
});
