import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import GovernanceSidebarLeft from '../screens/shared-components/GovernanceSidebarLeft';

let mockAuth = { isAuthenticated: true };
let mockArea = { country: 'Nigeria', state: 'FCT', lga: 'Abuja' };
jest.mock('src/app/hooks/useCivicWebAuth', () => () => mockAuth);
jest.mock('../hooks/useGovernanceRepo', () => ({ useMyArea: () => ({ data: mockArea }) }));

function Where() {
  const l = useLocation();
  return <div data-testid="where">{l.pathname}{l.search}</div>;
}
const renderAt = (url, props = {}) => render(
  <MemoryRouter initialEntries={[url]}>
    <GovernanceSidebarLeft {...props} />
    <Routes><Route path="*" element={<Where />} /></Routes>
  </MemoryRouter>,
);

describe('GovernanceSidebarLeft filters', () => {
  beforeEach(() => { mockAuth = { isAuthenticated: true }; mockArea = { country: 'Nigeria', state: 'FCT', lga: 'Abuja' }; });

  it('renders without looping and shows the citizen\'s area', () => {
    renderAt('/governance/elections');
    expect(screen.getByText('Your area: Abuja, FCT')).toBeInTheDocument();
  });

  it('turning on my area writes it to the address bar', async () => {
    renderAt('/governance/elections');
    fireEvent.click(screen.getByRole('checkbox'));
    await waitFor(() => expect(screen.getByTestId('where').textContent).toBe('/governance/elections?area=1'));
  });

  it('a filter changed from another governance page takes the citizen to the list with it applied', async () => {
    renderAt('/governance/elections/e1');
    fireEvent.click(screen.getByRole('checkbox'));
    await waitFor(() => expect(screen.getByTestId('where').textContent).toBe('/governance/elections?area=1'));
  });

  it('tells a page that keeps its own copy about every change', async () => {
    const onFilterChange = jest.fn();
    renderAt('/governance/elections?status=ongoing', { onFilterChange });
    await waitFor(() => expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'ongoing', area: false })));
  });

  it('hides the my area switch for a guest and disables it until the area is set', () => {
    mockAuth = { isAuthenticated: false };
    const { unmount } = renderAt('/governance/elections');
    expect(screen.queryByText('Only votes I can vote in')).toBeNull();
    unmount();
    mockAuth = { isAuthenticated: true }; mockArea = null;
    renderAt('/governance/elections');
    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(screen.getByText(/Set where you live/)).toBeInTheDocument();
  });
});
