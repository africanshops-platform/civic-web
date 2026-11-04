import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import KycGuard from '../KycGuard';
import { readKycHint, writeKycHint } from '../kycHint';

const mockGetStatus = jest.fn();
jest.mock('app/configs/data/client/RepositoryAuthClient', () => ({ AuthApi: () => ({ get: (...a) => mockGetStatus(...a), post: jest.fn() }) }));
jest.mock('src/app/hooks/useCivicWebAuth', () => ({ __esModule: true, default: () => ({ user: { id: 'u1' }, isAuthenticated: true }) }));
jest.mock('../KycWizardPage', () => ({ __esModule: true, default: () => <div>wizard</div> }));

const renderGuard = () =>
	render(
		<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
			<KycGuard>
				<div>civic page</div>
			</KycGuard>
		</QueryClientProvider>
	);

describe('KycGuard', () => {
	beforeEach(() => {
		localStorage.clear();
		mockGetStatus.mockReset();
	});

	it('opens at once for a user who was verified last time, even while the status call is still pending', () => {
		writeKycHint('u1', true);
		mockGetStatus.mockReturnValue(new Promise(() => { /* never settles */ }));
		renderGuard();
		expect(screen.getByText('civic page')).toBeInTheDocument();
		expect(screen.queryByText(/Verifying Identity Status/i)).toBeNull();
	});

	it('shows the page skeleton (not a full-screen takeover) when there is no hint and the answer is pending', () => {
		mockGetStatus.mockReturnValue(new Promise(() => { /* never settles */ }));
		renderGuard();
		expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
		expect(screen.queryByText('civic page')).toBeNull();
		expect(screen.queryByText(/Verifying Identity Status/i)).toBeNull();
	});

	it('remembers a verified answer for next time, and shows the wizard (and forgets the hint) for anyone not verified', async () => {
		mockGetStatus.mockResolvedValue({ data: { kycStatus: 'FULLY_VERIFIED' } });
		const first = renderGuard();
		expect(await screen.findByText('civic page')).toBeInTheDocument();
		await waitFor(() => expect(readKycHint('u1')).toBe(true));
		first.unmount();

		mockGetStatus.mockResolvedValue({ data: { kycStatus: 'PENDING' } });
		renderGuard();
		expect(await screen.findByText('wizard')).toBeInTheDocument();
		await waitFor(() => expect(readKycHint('u1')).toBe(false));
	});

	it('a failed recheck does not lock out a user who was verified, but does show the error to everyone else', async () => {
		writeKycHint('u1', true);
		mockGetStatus.mockRejectedValue({ response: { status: 500 } });
		const first = renderGuard();
		await waitFor(() => expect(mockGetStatus).toHaveBeenCalled());
		expect(await screen.findByText('civic page')).toBeInTheDocument();
		first.unmount();

		localStorage.clear();
		renderGuard();
		expect(await screen.findByText(/KYC Service Temporarily Unavailable/i)).toBeInTheDocument();
	});
});
