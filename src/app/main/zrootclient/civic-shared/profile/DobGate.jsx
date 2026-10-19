import { Alert, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useAboutYou } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';
import KycAboutYouCard from '../kyc/steps/KycAboutYouCard';

/**
 * A signed-in civic citizen with no date of birth on record cannot take part in votes, and the household fee engine
 * needs it, so they are asked for it before going on (civic-55 CP-3). It closes itself as soon as it is saved.
 */
export default function DobGate({ children }) {
	const { data } = useAboutYou();
	const missing = data && !data.dateOfBirth;

	return (
		<>
			{children}
			{missing && (
				<Dialog
					open
					maxWidth="xs"
					fullWidth
					disableEscapeKeyDown
				>
					<DialogTitle className="font-extrabold">One more detail</DialogTitle>
					<DialogContent className="flex flex-col gap-12 pt-8">
						<Alert severity="info">
							Please add your date of birth. It is needed to take part in community votes and it is checked
							against your ID.
						</Alert>
						<KycAboutYouCard />
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
