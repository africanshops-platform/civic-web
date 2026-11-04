import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import SubscriptionGate from '../SubscriptionGate';
import { decideGate, isEmergencyCategory, isSubscriptionRequired } from '../gateDecision';
import { clearDraft, loadDraft, saveDraft } from '../draft';

const mockGet = jest.fn();
jest.mock('app/configs/data/client/RepositoryAuthClient', () => ({ AuthApi: () => ({ get: (...a) => mockGet(...a) }) }));

const renderGate = (props = {}) =>
	render(
		<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
			<MemoryRouter>
				<SubscriptionGate feature="incidentReport" {...props}>
					<button type="button">Report now</button>
				</SubscriptionGate>
			</MemoryRouter>
		</QueryClientProvider>
	);

describe('decideGate', () => {
	it('allows when the answer is unknown, the gate is off, the person is up to date, or the request is life-threatening', () => {
		expect(decideGate(undefined)).toBe('allow');
		expect(decideGate({ enabled: false, upToDate: true })).toBe('allow');
		expect(decideGate({ enabled: true, upToDate: true })).toBe('allow');
		expect(decideGate({ enabled: true, upToDate: false }, true)).toBe('allow');
	});

	it('asks an adult to pay, tells a child their guardian must, and asks an unlinked child to link a guardian', () => {
		expect(decideGate({ enabled: true, upToDate: false, viaGuardian: false })).toBe('pay');
		expect(decideGate({ enabled: true, upToDate: false, viaGuardian: true })).toBe('guardian');
		expect(decideGate({ enabled: true, upToDate: false, viaGuardian: true, blocked: 'MINOR_NOT_LINKED' })).toBe('link');
	});
});

describe('helpers', () => {
	it('knows the four life-threatening categories, in any letter case, and nothing else', () => {
		['MEDICAL_EMERGENCY', 'FIRE', 'KIDNAPPING', 'TERRORISM', 'fire'].forEach((c) => expect(isEmergencyCategory(c)).toBe(true));
		['THEFT', 'ASSAULT', 'OTHER', '', undefined].forEach((c) => expect(isEmergencyCategory(c)).toBe(false));
	});

	it('recognises the gateway refusal by its code only', () => {
		expect(isSubscriptionRequired({ response: { data: { code: 'SUBSCRIPTION_REQUIRED' } } })).toBe(true);
		expect(isSubscriptionRequired({ response: { data: { message: 'Access denied' } } })).toBe(false);
		expect(isSubscriptionRequired(undefined)).toBe(false);
	});
});

describe('draft', () => {
	beforeEach(() => localStorage.clear());

	it('saves, loads and clears, per key, and never throws when storage is blocked', () => {
		saveDraft('a', { category: 'THEFT' });
		expect(loadDraft('a')).toEqual({ category: 'THEFT' });
		expect(loadDraft('b')).toBeNull();
		clearDraft('a');
		expect(loadDraft('a')).toBeNull();
		const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('blocked');
		});
		expect(loadDraft('a')).toBeNull();
		spy.mockRestore();
	});
});

describe('SubscriptionGate', () => {
	beforeEach(() => mockGet.mockReset());

	it('shows the action while the answer is pending (the server still decides)', () => {
		mockGet.mockReturnValue(new Promise(() => { /* never settles */ }));
		renderGate();
		expect(screen.getByText('Report now')).toBeInTheDocument();
	});

	it('shows the action for an up-to-date citizen', async () => {
		mockGet.mockResolvedValue({ data: { enabled: true, upToDate: true } });
		renderGate();
		expect(await screen.findByText('Report now')).toBeInTheDocument();
	});

	it('replaces the action with a pay prompt for an adult who has not paid, and says the report is saved', async () => {
		mockGet.mockResolvedValue({ data: { enabled: true, upToDate: false, viaGuardian: false } });
		renderGate();
		expect(await screen.findByText(/Pay this month's civic subscription/i)).toBeInTheDocument();
		expect(screen.getByText(/saved on this device/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Pay this month's subscription/i })).toBeInTheDocument();
		expect(screen.queryByText('Report now')).toBeNull();
	});

	it('tells a child their guardian must pay, with no pay button', async () => {
		mockGet.mockResolvedValue({ data: { enabled: true, upToDate: false, viaGuardian: true } });
		renderGate();
		expect(await screen.findByText(/parent or guardian's subscription is not up to date/i)).toBeInTheDocument();
		expect(screen.queryByRole('button')).toBeNull();
	});

	it('lets a life-threatening report through even when unpaid', async () => {
		mockGet.mockResolvedValue({ data: { enabled: true, upToDate: false, viaGuardian: false } });
		renderGate({ bypass: true });
		expect(await screen.findByText('Report now')).toBeInTheDocument();
	});
});
