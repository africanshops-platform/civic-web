import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';

// Mock leaflet CSS and MapContainer for test environment
jest.mock('leaflet/dist/leaflet.css', () => {});
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children }) => <div data-testid="circle-marker">{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
}));

import SecurityMapPublicPage from '../screens/SecurityMapPublicPage';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe('SecurityMapPublicPage', () => {
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
