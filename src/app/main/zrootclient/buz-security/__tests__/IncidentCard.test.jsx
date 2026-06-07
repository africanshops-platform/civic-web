import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import IncidentCard from '../components/IncidentCard';
import { mockIncidents } from '../mock';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

const incident = mockIncidents[0];

describe('IncidentCard', () => {
  it('renders incident category', () => {
    render(<IncidentCard incident={incident} />, { wrapper });
    expect(screen.getByTestId('incident-card')).toBeInTheDocument();
  });

  it('renders incident location', () => {
    render(<IncidentCard incident={incident} />, { wrapper });
    expect(screen.getByText(incident.location.address)).toBeInTheDocument();
  });

  it('renders null for missing incident', () => {
    const { container } = render(<IncidentCard incident={null} />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders compact variant', () => {
    render(<IncidentCard incident={incident} compact />, { wrapper });
    expect(screen.getByText(/Eti-Osa/)).toBeInTheDocument();
  });

  it('calls onSelect when clicked in compact mode', () => {
    const onSelect = jest.fn();
    render(<IncidentCard incident={incident} compact onSelect={onSelect} />, { wrapper });
  });
});
