import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import LiveCollationBoard from '../components/LiveCollationBoard';
import { mockCollationResults } from '../mock';

jest.mock('react-apexcharts', () => () => <div data-testid="apex-chart" />);

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('LiveCollationBoard', () => {
  const collation = mockCollationResults[0];

  it('renders LIVE RESULTS heading', () => {
    render(<LiveCollationBoard collation={collation} />, { wrapper });
    expect(screen.getByText('LIVE RESULTS')).toBeInTheDocument();
  });

  it('renders ward collation progress text', () => {
    render(<LiveCollationBoard collation={collation} />, { wrapper });
    expect(screen.getByText(/wards collated/i)).toBeInTheDocument();
  });

  it('renders all candidate rows', () => {
    render(<LiveCollationBoard collation={collation} />, { wrapper });
    collation.candidates.forEach((c) => {
      expect(screen.getByText(c.party)).toBeInTheDocument();
    });
  });

  it('renders loading skeleton when isLoading prop passed', () => {
    render(<LiveCollationBoard isLoading />, { wrapper });
    expect(screen.getByTestId('collation-board-skeleton')).toBeInTheDocument();
  });
});
