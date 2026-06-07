import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import IssueCard from '../components/IssueCard';
import { mockIssues } from '../mock';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe('IssueCard', () => {
  const issue = mockIssues[0];

  it('renders the issue title', () => {
    render(<IssueCard issue={issue} />, { wrapper });
    expect(screen.getByText(issue.title)).toBeInTheDocument();
  });

  it('renders the jurisdiction', () => {
    render(<IssueCard issue={issue} />, { wrapper });
    expect(screen.getByText(`${issue.jurisdiction.lga}, ${issue.jurisdiction.state}`)).toBeInTheDocument();
  });

  it('renders upvote count', () => {
    render(<IssueCard issue={issue} />, { wrapper });
    expect(screen.getByText(issue.upvotes.toLocaleString())).toBeInTheDocument();
  });

  it('renders a View Issue link', () => {
    render(<IssueCard issue={issue} />, { wrapper });
    expect(screen.getByRole('link', { name: /view issue/i })).toBeInTheDocument();
  });

  it('renders the issue card container', () => {
    render(<IssueCard issue={issue} />, { wrapper });
    expect(screen.getByTestId('issue-card')).toBeInTheDocument();
  });
});
