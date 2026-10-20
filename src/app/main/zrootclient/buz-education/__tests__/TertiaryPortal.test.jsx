import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { creditStanding } from '../tertiary';
import TertiaryPortalPage from '../screens/TertiaryPortalPage';

const mockH = { cat: jest.fn(), tr: jest.fn(), reg: jest.fn(), drop: jest.fn() };
jest.mock('../hooks/useEducationRepo', () => ({
  useTertiaryCatalogue: () => mockH.cat(),
  useTertiaryTranscript: () => mockH.tr(),
  useRegisterCourse: () => ({ mutate: mockH.reg, isLoading: false }),
  useDropCourse: () => ({ mutate: mockH.drop, isLoading: false }),
}));
jest.mock('../screens/EducationPageShell', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));

const limits = { min: 12, max: 24 };
const cat = (over = {}) => ({
  data: { data: {
    terms: [{ id: 't1', name: 'First semester' }], term: { id: 't1', name: 'First semester', open: true }, credits: 3, limits,
    courses: [{ id: 'c1', code: 'HIS101', title: 'History', credits: 3, year: 1, registered: true }, { id: 'c2', code: 'HIS102', title: 'Civics', credits: 2, year: 1, registered: false }], ...over,
  } }, isLoading: false, isError: false,
});
const page = () => render(<MemoryRouter><TertiaryPortalPage /></MemoryRouter>);

describe('creditStanding', () => {
  it('says whether a semester is short, fine or over the limit', () => {
    expect(creditStanding(30, limits)).toEqual({ tone: 'bad', text: 'Over the limit of 24 credits' });
    expect(creditStanding(6, limits)).toEqual({ tone: 'warn', text: '6 of at least 12 credits' });
    expect(creditStanding(18, limits)).toEqual({ tone: 'ok', text: '18 credits (limit 24)' });
  });
});

describe('TertiaryPortalPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockH.cat.mockReturnValue(cat());
  });

  it('shows my credits and lets me register for one course and drop another', () => {
    page();
    expect(screen.getByTestId('standing')).toHaveTextContent('3 of at least 12 credits');
    fireEvent.click(screen.getByRole('button', { name: 'Drop' }));
    expect(mockH.drop).toHaveBeenCalledWith({ termId: 't1', courseId: 'c1' });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(mockH.reg).toHaveBeenCalledWith({ termId: 't1', courseId: 'c2' });
  });

  it('hides Register and Drop once the semester has closed', () => {
    mockH.cat.mockReturnValue(cat({ term: { id: 't1', name: 'First semester', open: false } }));
    page();
    expect(screen.queryByRole('button', { name: 'Register' })).toBeNull();
    expect(screen.getByText('Registration for this semester has closed.')).toBeInTheDocument();
  });

  it('says so when the school has not opened a semester, or I am not enrolled', () => {
    mockH.cat.mockReturnValue(cat({ term: null }));
    page();
    expect(screen.getByTestId('no-semester')).toBeInTheDocument();
    mockH.cat.mockReturnValue({ data: undefined, isLoading: false, isError: true, error: { response: { data: { message: 'You are not enrolled in a university or college programme' } } } });
    page();
    expect(screen.getByText('You are not enrolled in a university or college programme')).toBeInTheDocument();
  });

  it('shows published results with the cumulative GPA and class of degree', () => {
    mockH.tr.mockReturnValue({
      data: { data: { matricNo: 'UNI/26/0001', programme: { name: 'BA History' }, cgpa: 4.5, totalCredits: 3, classOfDegree: 'First Class',
        semesters: [{ term: { id: 't1', name: 'First semester' }, gpa: 5, credits: 3, courses: [{ code: 'HIS101', title: 'History', credits: 3, score: 72, grade: 'A' }] }] } },
      isLoading: false, isError: false,
    });
    page();
    fireEvent.click(screen.getByRole('button', { name: 'Results' }));
    expect(screen.getByTestId('cgpa')).toHaveTextContent('4.50');
    expect(screen.getByTestId('summary')).toHaveTextContent('First Class');
    expect(screen.getByText('72 · A')).toBeInTheDocument();
  });

  it('says so when nothing is published yet', () => {
    mockH.tr.mockReturnValue({ data: { data: { semesters: [] } }, isLoading: false, isError: false });
    page();
    fireEvent.click(screen.getByRole('button', { name: 'Results' }));
    expect(screen.getByTestId('no-results')).toBeInTheDocument();
  });
});
