import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GATE_COPY, decideGate } from './gateDecision';
import useSubscriptionStanding from './useSubscriptionStanding';

/**
 * Wrap the ACTION of a gated feature (a submit button), not the whole page: the form stays on screen with the person's text, and only the
 * action is replaced by the prompt. `bypass` lets life-threatening requests through (see isEmergencyCategory). Compose with KycGuard.
 */
export default function SubscriptionGate({ feature, bypass = false, payPath = '/civictax', children }) {
	const { data } = useSubscriptionStanding(feature);
	const navigate = useNavigate();
	const mode = decideGate(data, bypass);
	if (mode === 'allow') return children;

	const copy = GATE_COPY[mode];
	return (
		<Box
			role="alert"
			sx={{ border: '1px solid rgba(251,191,36,0.5)', bgcolor: 'rgba(251,191,36,0.08)', borderRadius: 3, p: 2.5, textAlign: 'center' }}
		>
			<Typography sx={{ fontWeight: 800, fontSize: 18, mb: 0.75 }}>{copy.title}</Typography>
			<Typography sx={{ opacity: 0.8, lineHeight: 1.6, mb: mode === 'pay' ? 2 : 0 }}>{copy.body}</Typography>
			{mode === 'pay' && (
				<Button variant="contained" color="warning" onClick={() => navigate(payPath)} sx={{ fontWeight: 800, borderRadius: 2.5, textTransform: 'none' }}>
					Pay this month&apos;s subscription
				</Button>
			)}
		</Box>
	);
}
