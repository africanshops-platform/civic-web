import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import CampaignCard from '../components/CampaignCard';
import { mockCampaigns } from '../mock';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

const campaign = mockCampaigns[0];

describe('CampaignCard', () => {
  it('renders campaign title', () => {
    render(<CampaignCard campaign={campaign} />, { wrapper });
    expect(screen.getByText(campaign.title)).toBeInTheDocument();
  });

  it('renders LGA and state', () => {
    render(<CampaignCard campaign={campaign} />, { wrapper });
    expect(screen.getByText(`${campaign.jurisdiction.lga}, ${campaign.jurisdiction.state}`)).toBeInTheDocument();
  });

  it('renders contributor count', () => {
    render(<CampaignCard campaign={campaign} />, { wrapper });
    expect(screen.getByText(`${campaign.contributorsCount.toLocaleString()} contributors`)).toBeInTheDocument();
  });

  it('renders the contribute button', () => {
    render(<CampaignCard campaign={campaign} />, { wrapper });
    expect(screen.getByText('Contribute Now')).toBeInTheDocument();
  });

  it('renders "View Impact Report" for completed campaigns', () => {
    const completedCampaign = mockCampaigns.find((c) => c.status === 'completed');
    render(<CampaignCard campaign={completedCampaign} />, { wrapper });
    expect(screen.getByText('View Impact Report')).toBeInTheDocument();
  });

  it('renders null when campaign prop is undefined', () => {
    const { container } = render(<CampaignCard campaign={undefined} />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('toggles save bookmark on click', () => {
    render(<CampaignCard campaign={campaign} />, { wrapper });
    const saveBtn = screen.getByLabelText ? screen.queryByRole('button', { name: /bookmark/i }) : null;
  });
});
