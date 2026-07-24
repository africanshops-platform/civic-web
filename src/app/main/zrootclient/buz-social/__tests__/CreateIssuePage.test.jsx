import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from 'app/store/store';
import CreateIssuePage from '../screens/CreateIssuePage';

const wrapper = ({ children }) => (
  <Provider store={store}>
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  </Provider>
);

describe('CreateIssuePage', () => {
  it('renders page heading', () => {
    render(<CreateIssuePage />, { wrapper });
    expect(screen.getByText(/Report a Community Issue/i)).toBeInTheDocument();
  });

  it('renders Issue Title input', () => {
    render(<CreateIssuePage />, { wrapper });
    expect(screen.getByLabelText(/Issue Title/i)).toBeInTheDocument();
  });

  it('renders Description textarea', () => {
    render(<CreateIssuePage />, { wrapper });
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('renders submit button as disabled when form is empty', () => {
    render(<CreateIssuePage />, { wrapper });
    expect(screen.getByRole('button', { name: /Submit Issue Report/i })).toBeDisabled();
  });
});
