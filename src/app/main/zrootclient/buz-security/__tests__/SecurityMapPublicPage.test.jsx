import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from 'app/store/store';
import SecurityMapPublicPage from '../screens/SecurityMapPublicPage';

// Mock leaflet CSS and MapContainer for test environment
jest.mock('leaflet/dist/leaflet.css', () => ({}));
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children }) => <div data-testid="circle-marker">{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
  useMap: () => ({ invalidateSize: () => undefined }),
}));

const mockUseIncidents = jest.fn();
jest.mock('../hooks/useSecurityRepo', () => ({ useIncidents: (...a) => mockUseIncidents(...a) }));

const wrapper = ({ children }) => (
  <Provider store={store}>
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  </Provider>
);

describe('SecurityMapPublicPage', () => {
  beforeEach(() => {
    mockUseIncidents.mockReturnValue({ data: { data: { incidents: [] } }, isLoading: false, isError: false });
  });

  it('shows an empty notice, not invented incidents, when the server has none', () => {
    render(<SecurityMapPublicPage />, { wrapper });
    expect(screen.getByText(/No public incidents are reported right now/i)).toBeInTheDocument();
  });

  it('shows real incidents from the server and hides resolved ones', () => {
    const inc = (id, status) => ({ id, status, category: 'fire', severity: 'low', description: '', reportedAt: new Date().toISOString(), location: { lat: 9, lng: 8, address: 'x', lga: '', state: '' } });
    mockUseIncidents.mockReturnValue({ data: { data: { incidents: [inc('a', 'reported'), inc('b', 'resolved')] } }, isLoading: false, isError: false });
    render(<SecurityMapPublicPage />, { wrapper });
    expect(screen.getByText(/1 active incidents/i)).toBeInTheDocument();
  });

  it('shows an error notice when the feed fails', () => {
    mockUseIncidents.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    render(<SecurityMapPublicPage />, { wrapper });
    expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument();
  });

  it('renders the map container', () => {
    render(<SecurityMapPublicPage />, { wrapper });
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('renders "Community Security Map" heading', () => {
    render(<SecurityMapPublicPage />, { wrapper });
    expect(screen.getByText(/Community Security Map/i)).toBeInTheDocument();
  });

  it('renders LIVE indicator', () => {
    render(<SecurityMapPublicPage />, { wrapper });
    expect(screen.getByText(/LIVE/)).toBeInTheDocument();
  });

  it('renders Sign In button', () => {
    render(<SecurityMapPublicPage />, { wrapper });
    expect(screen.getByText(/Sign In for Full Access/i)).toBeInTheDocument();
  });
});
