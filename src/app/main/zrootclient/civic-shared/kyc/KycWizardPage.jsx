import { useEffect } from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import KycFaceCard from './steps/KycFaceCard';
import KycDocumentCard from './steps/KycDocumentCard';
import KycWebAuthnCard from './steps/KycWebAuthnCard';

// Without this, dropping an image file anywhere on the page outside the exact
// bounds of KycDocumentCard's dropzone falls through to the browser's default
// drag-and-drop behavior — navigating the whole tab to display the image as a
// page, wiping every card's in-progress form state. This is a page-wide net,
// not just the dropzone's own onDrop, because the default action fires on
// whatever element the cursor is over at drop time, not just the intended target.
function usePreventStrayFileDrop() {
	useEffect(() => {
		const preventDefault = (e) => e.preventDefault();
		window.addEventListener('dragover', preventDefault);
		window.addEventListener('drop', preventDefault);
		return () => {
			window.removeEventListener('dragover', preventDefault);
			window.removeEventListener('drop', preventDefault);
		};
	}, []);
}

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		boxShadow: `inset 0 0 0 1px  ${theme.palette.divider}`
	}
}));

const STATUS_COLOR = {
	'Not started': 'default',
	Submitted: 'info',
	Registered: 'success',
	Verified: 'success'
};

function StatusChip({ label }) {
	const colorKey = Object.keys(STATUS_COLOR).find((key) => label.startsWith(key));
	return (
		<Chip
			size="small"
			label={label}
			color={STATUS_COLOR[colorKey] || 'default'}
		/>
	);
}

function DocumentSection({ title, description, status, children }) {
	return (
		<Paper className="rounded-2xl p-24 flex flex-col gap-12">
			<div className="flex items-center justify-between">
				<Typography className="font-semibold">{title}</Typography>
				<StatusChip label={status} />
			</div>
			<Typography color="text.secondary">{description}</Typography>
			{children}
		</Paper>
	);
}

/**
 * Civic Identity Verification (KYC). Renders one independent card per KYC
 * sub-domain (Face, Document, WebAuthn) instead of a locked step-by-step
 * wizard — each is separately viewable/updatable at any time. Mirrors the
 * `KycOverviewPage` redesign already shipped on merchant-web/admin-web.
 *
 * This component is used in three places in this app and its external prop
 * contract is unchanged:
 *  - `KycGuard.jsx` — full-screen gate, renders this with no `onBack` when the
 *    user isn't yet FULLY_VERIFIED.
 *  - `CivicUserGuard.jsx` — "manage mode", renders this with `onBack` so the
 *    user can return to the civic activation screen.
 *  - `KycManagePage.jsx` — the `/account/kyc` route.
 *
 * All functional/API logic — face-api.js capture, Cloudinary document
 * upload, WebAuthn registration, and `useKycRepo.js` — is unchanged and now
 * lives in the card components under `./steps/`; this component only lays
 * them out.
 */
export default function KycWizardPage({ kycData, onBack }) {
	usePreventStrayFileDrop();

	const isVerified = kycData?.kycStatus === 'FULLY_VERIFIED';
	const pendingAdminApproval = kycData?.pendingAdminApproval === true;

	const faceVerified = kycData?.faceVerified === true;
	const documentSubmitted = kycData?.documentSubmitted === true;
	const documentType = kycData?.documentType ?? null;
	const biometricRegistered = kycData?.biometricRegistered === true;
	const enrolledDevices = kycData?.enrolledDevices ?? [];

	return (
		<Box
			sx={{
				position: 'fixed',
				inset: 0,
				zIndex: 1300,
				bgcolor: 'background.default',
				overflowY: 'auto'
			}}
		>
			<Root
				header={
					<div className="flex flex-1 w-full flex-col py-8 sm:py-16 px-16 md:px-24">
						{onBack && (
							<Button
								onClick={onBack}
								startIcon={<ArrowBackIcon />}
								sx={{ alignSelf: 'flex-start', mb: 1, ml: -1, color: 'text.secondary', textTransform: 'none' }}
							>
								Back to Civic Activation
							</Button>
						)}
						<div className="flex items-center gap-12">
							<Box
								sx={{
									width: 44,
									height: 44,
									borderRadius: '12px',
									bgcolor: 'secondary.main',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0
								}}
							>
								<FingerprintIcon sx={{ color: '#fff', fontSize: 24 }} />
							</Box>
							<div>
								<Typography className="text-24 md:text-32 font-extrabold tracking-tight">
									Civic Identity Verification
								</Typography>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									AfricanShops · Secure KYC System
								</Typography>
							</div>
						</div>
					</div>
				}
				content={
					<div
						className="w-full p-16 md:p-24 flex flex-col gap-16"
						style={{ maxWidth: 640 }}
					>
						{isVerified && (
							<Paper className="rounded-2xl p-24 flex items-center gap-16">
								<FuseSvgIcon
									size={28}
									color="success"
								>
									heroicons-solid:badge-check
								</FuseSvgIcon>
								<div>
									<Typography className="font-semibold">You're verified</Typography>
									<Typography color="text.secondary">
										KYC verification is complete — no restrictions on your account.
									</Typography>
								</div>
							</Paper>
						)}

						{!isVerified && pendingAdminApproval && (
							<Paper className="rounded-2xl p-24 flex items-center gap-16">
								<FuseSvgIcon
									size={28}
									color="info"
								>
									heroicons-outline:information-circle
								</FuseSvgIcon>
								<div>
									<Typography className="font-semibold">Pending admin review</Typography>
									<Typography color="text.secondary">
										You've submitted enough for review — you'll be notified once it's reviewed. You can still
										view or update what you submitted below.
									</Typography>
								</div>
							</Paper>
						)}

						{!isVerified && (
							<>
								<DocumentSection
									title="Face Recognition"
									description="Live camera capture used to verify your identity against your face."
									status={faceVerified ? 'Verified' : 'Not started'}
								>
									<KycFaceCard faceVerified={faceVerified} />
								</DocumentSection>

								<DocumentSection
									title="Identity Document"
									description="A government-issued ID (NIN, passport, or driver's licence)."
									status={documentSubmitted ? 'Submitted' : 'Not started'}
								>
									<KycDocumentCard
										completed={documentSubmitted}
										documentType={documentType}
									/>
								</DocumentSection>

								<DocumentSection
									title="Biometric Device (WebAuthn)"
									description="Register a fingerprint sensor or Face ID as an additional sign-in factor."
									status={
										biometricRegistered
											? `Registered${enrolledDevices.length > 1 ? ` · ${enrolledDevices.length} devices` : ''}`
											: 'Not started'
									}
								>
									<KycWebAuthnCard enrolledDevices={enrolledDevices} />
								</DocumentSection>
							</>
						)}

						{onBack && (
							<Button
								onClick={onBack}
								variant="contained"
								color="secondary"
								startIcon={<ArrowBackIcon />}
								sx={{ alignSelf: 'flex-start' }}
							>
								Done — Return to Activation
							</Button>
						)}
					</div>
				}
			/>
		</Box>
	);
}
