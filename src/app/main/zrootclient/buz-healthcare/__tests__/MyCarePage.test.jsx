import { fireEvent, render, screen } from '@testing-library/react';
import MyCarePage from '../screens/MyCarePage';

const q = (data, extra = {}) => ({ data, isLoading: false, isError: false, ...extra });
const mockH = {};
jest.mock('../screens/shared-components/HealthcarePageShell', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../hooks/useHealthcareRepo', () => ({
  useChildrenIActFor: () => ({ data: mockH.children ?? [] }),
  useMyEncounters: () => mockH.encounters, useMyResults: () => mockH.results, useMyPrescriptions: () => mockH.rx, useMyInvoices: () => mockH.invoices,
  useMyAdmissions: () => mockH.admissions, useMyImmunisation: () => mockH.imm, useMyPregnancy: () => mockH.preg, useMyPlans: () => mockH.plans,
  useMyHealthId: () => mockH.hid ?? { data: undefined, refetch: jest.fn() }, useAddReading: () => ({ mutate: mockH.addReading, isLoading: false }),
}));

const empty = q({ items: [] });
beforeEach(() => {
  mockH.addReading = jest.fn();
  Object.assign(mockH, { encounters: empty, results: empty, rx: empty, invoices: empty, admissions: empty, imm: q({ hasCard: false, doses: [] }), preg: q({ pregnancy: null }), plans: empty, children: [] });
});

describe('MyCarePage', () => {
  it('shows consultations the patient can read', () => {
    mockH.encounters = q({ items: [{ id: 'e1', facilityName: 'Garki Clinic', closedAt: '2026-10-20T10:00:00Z', content: { complaint: 'Fever', findings: 'Temp 38.5', diagnoses: [{ text: 'Malaria' }], plan: 'Rest' } }] });
    render(<MyCarePage />);
    expect(screen.getByTestId('visit-e1')).toHaveTextContent('Why you went: Fever');
    expect(screen.getByTestId('visit-e1')).toHaveTextContent('Diagnosis: Malaria');
  });

  it('explains that a result appears after a doctor has reviewed it', () => {
    render(<MyCarePage />);
    fireEvent.click(screen.getByRole('tab', { name: 'Results' }));
    expect(screen.getByText(/once a doctor has reviewed it/)).toBeInTheDocument();
  });

  it('shows what is owed, and that payment is at the counter', () => {
    mockH.invoices = q({ items: [{ id: 'i1', facilityName: 'Garki Clinic', createdAt: '2026-10-20', status: 'PART_PAID', totalKobo: '550000', paidKobo: '300000', owedKobo: '250000', lines: [{ id: 'l1', description: 'Consultation', qty: 1, lineKobo: '300000' }] }] });
    render(<MyCarePage />);
    fireEvent.click(screen.getByRole('tab', { name: 'Bills' }));
    expect(screen.getByText('Owed ₦2,500')).toBeInTheDocument();
    expect(screen.getByText('Part paid')).toBeInTheDocument();
    expect(screen.getByText(/pay at the facility's counter/)).toBeInTheDocument();
  });

  it('shows the running bill of a current hospital stay', () => {
    mockH.admissions = q({ items: [{ id: 'a1', facilityName: 'Unity Hospital', wardName: 'Male ward', bedLabel: '2', status: 'ADMITTED', admittedAt: '2026-10-18', reason: 'Malaria', days: 3, runningKobo: '1500000' }] });
    render(<MyCarePage />);
    fireEvent.click(screen.getByRole('tab', { name: 'Hospital stay' }));
    expect(screen.getByText('In hospital now')).toBeInTheDocument();
    expect(screen.getByText(/running bill ₦15,000/)).toBeInTheDocument();
  });

  it('puts what to do next at the top: an overdue vaccine and a missed antenatal visit', () => {
    mockH.imm = q({ hasCard: true, doses: [{ vaccine: 'BCG', label: 'BCG', dueDate: '2026-01-01', state: 'OVERDUE', givenAt: null }] });
    mockH.preg = q({ pregnancy: { gestWeeksNow: 25, edd: '2027-01-01', schedule: [{ contact: 2, weeks: 20, state: 'MISSED', dueDate: '2026-09-01' }] } });
    render(<MyCarePage />);
    const steps = screen.getByTestId('next-steps');
    expect(steps).toHaveTextContent('1 vaccine dose is overdue');
    expect(steps).toHaveTextContent('Antenatal visit 2 (week 20) was missed');
  });

  it('lets the patient enter a home reading on a long-term plan', () => {
    mockH.plans = q({ items: [{ id: 'p1', condition: 'HYPERTENSION', facilityName: 'Garki Clinic', nextReviewAt: new Date(Date.now() + 20 * 86_400_000).toISOString() }] });
    render(<MyCarePage />);
    fireEvent.click(screen.getByRole('tab', { name: 'Long-term care' }));
    const save = screen.getByRole('button', { name: 'Save reading' });
    expect(save).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Top number'), { target: { value: '152' } });
    expect(save).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Bottom number'), { target: { value: '96' } });
    expect(save).toBeEnabled();
    fireEvent.click(save);
    expect(mockH.addReading).toHaveBeenCalledWith({ planId: 'p1', systolic: 152, diastolic: 96 }, expect.any(Object));
  });

  it('a guardian can switch to a child', () => {
    mockH.children = [{ id: 'c1', fullName: 'Eta', age: 4 }];
    render(<MyCarePage />);
    expect(screen.getByLabelText('Acting for')).toBeInTheDocument();
  });
});
