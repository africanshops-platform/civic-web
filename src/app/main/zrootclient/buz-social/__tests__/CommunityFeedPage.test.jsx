import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import CommunityFeedPublicPage from '../screens/CommunityFeedPublicPage';

jest.mock('react-virtuoso', () => ({
  Virtuoso: ({ data, itemContent }) => (
    <div>{data.map((item, i) => itemContent(i, item))}</div>
  ),
}));

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe('CommunityFeedPublicPage', () => {
  it('renders page heading', () => {
    render(<CommunityFeedPublicPage />, { wrapper });
    expect(screen.getByText(/Community Issues Feed/i)).toBeInTheDocument();
  });

  it('renders category filter chips', () => {
    render(<CommunityFeedPublicPage />, { wrapper });
    expect(screen.getByText('Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('renders sign in to report CTA', () => {
    render(<CommunityFeedPublicPage />, { wrapper });
    expect(screen.getByRole('link', { name: /Sign In to Report Issue/i })).toBeInTheDocument();
  });
});
