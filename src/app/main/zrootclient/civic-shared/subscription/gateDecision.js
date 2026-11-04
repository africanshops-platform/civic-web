/**
 * The civic subscription gate on the client (civic-77). The server is the authority: it refuses with 403 SUBSCRIPTION_REQUIRED. These helpers only
 * decide what to SHOW, so a person is told before they type a report and is never blocked by a check that could not run.
 */
export const EMERGENCY_INCIDENT_CATEGORIES = ['MEDICAL_EMERGENCY', 'FIRE', 'KIDNAPPING', 'TERRORISM'];

/** Life-threatening reports are never held back by a subscription (the server applies the same rule). */
export const isEmergencyCategory = (category) => EMERGENCY_INCIDENT_CATEGORIES.includes(String(category ?? '').toUpperCase());

/** The refusal the gateway sends when this month's subscription is not paid. */
export const isSubscriptionRequired = (error) => error?.response?.data?.code === 'SUBSCRIPTION_REQUIRED';

/**
 * 'allow' | 'pay' | 'guardian' | 'link'. Unknown standing (still loading, or the call failed) allows: the server decides on submit.
 * 'guardian': a child whose guardian is not up to date (no pay button). 'link': a child with no active guardian.
 */
export function decideGate(standing, bypass = false) {
	if (bypass || !standing || standing.enabled === false || standing.upToDate) return 'allow';
	if (standing.blocked) return 'link';
	return standing.viaGuardian ? 'guardian' : 'pay';
}

export const GATE_COPY = {
	pay: {
		title: "Pay this month's civic subscription",
		body: 'Reporting an incident needs your civic subscription to be up to date. Your report is saved on this device and will be here when you come back.'
	},
	guardian: {
		title: "Your parent or guardian's subscription is not up to date",
		body: 'This feature is paused until their civic subscription is paid. Please ask them to pay this month.'
	},
	link: {
		title: 'Link a parent or guardian',
		body: 'A child account must be linked to a parent or guardian to use this feature.'
	}
};
