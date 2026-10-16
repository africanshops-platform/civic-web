import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	MenuItem,
	Paper,
	TextField,
	Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';
import {
	useAcceptSpouse,
	useDeclareDependant,
	useDependants,
	useEndSpouse,
	useInviteSpouse,
	useProposeChargee,
	useRemoveDependant,
	useRespondChargee,
	useSpouseLink
} from './useHousehold';

const errMsg = (e) => e?.response?.data?.message || 'Something went wrong. Please try again.';
const day = (v) => (v ? new Date(v).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

function ConfirmDialog({ title, body, confirmLabel, busy, onConfirm, onClose }) {
	return (
		<Dialog
			open
			onClose={onClose}
			maxWidth="xs"
			fullWidth
		>
			<DialogTitle className="font-extrabold">{title}</DialogTitle>
			<DialogContent>
				<Typography>{body}</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Not now</Button>
				<Button
					color="error"
					variant="contained"
					disabled={busy}
					onClick={onConfirm}
				>
					{confirmLabel}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

function InviteCodeDialog({ invite, onClose }) {
	return (
		<Dialog
			open
			onClose={onClose}
			maxWidth="xs"
			fullWidth
		>
			<DialogTitle className="font-extrabold">Give this code to your spouse</DialogTitle>
			<DialogContent className="flex flex-col gap-12 pt-8">
				<Typography
					className="font-extrabold text-center"
					sx={{ fontSize: 32, letterSpacing: 6 }}
				>
					{invite.code.slice(0, 4)}-{invite.code.slice(4)}
				</Typography>
				<Alert severity="info">
					It works once and expires on {day(invite.expiresAt)}. It is shown only now, so share it before you
					close this. Your spouse must be a verified civic citizen who has set their status to Married.
				</Alert>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={() => {
						navigator.clipboard?.writeText(invite.code);
						toast.success('Code copied');
					}}
				>
					Copy
				</Button>
				<Button
					variant="contained"
					onClick={onClose}
				>
					Done
				</Button>
			</DialogActions>
		</Dialog>
	);
}

function SpouseCard({ link }) {
	const invite = useInviteSpouse();
	const accept = useAcceptSpouse();
	const end = useEndSpouse();
	const propose = useProposeChargee();
	const respond = useRespondChargee();
	const [code, setCode] = useState('');
	const [shown, setShown] = useState(null);
	const [confirmEnd, setConfirmEnd] = useState(false);

	const run = (m, vars, ok) =>
		m.mutate(vars, { onSuccess: () => ok && toast.success(ok), onError: (e) => toast.error(errMsg(e)) });

	let body;

	if (!link) {
		body = (
			<>
				<Typography color="text.secondary">
					Link your spouse so one household bill covers you both. You each need to be a verified civic citizen
					with your status set to Married.
				</Typography>
				<Box className="flex gap-8 flex-wrap items-center">
					<Button
						variant="contained"
						disabled={invite.isLoading}
						onClick={() =>
							invite.mutate(undefined, { onSuccess: (r) => setShown(r.data), onError: (e) => toast.error(errMsg(e)) })
						}
					>
						Invite my spouse
					</Button>
					<TextField
						size="small"
						placeholder="I have a code"
						value={code}
						onChange={(e) => setCode(e.target.value)}
					/>
					<Button
						disabled={!code.trim() || accept.isLoading}
						onClick={() => run(accept, code.trim(), 'You are linked')}
					>
						Link
					</Button>
				</Box>
			</>
		);
	} else if (link.status === 'PENDING') {
		body = (
			<>
				<Typography>Your invite is waiting. It expires on {day(link.expiresAt)}.</Typography>
				<Box className="flex gap-8">
					<Button
						variant="outlined"
						disabled={invite.isLoading}
						onClick={() =>
							invite.mutate(undefined, { onSuccess: (r) => setShown(r.data), onError: (e) => toast.error(errMsg(e)) })
						}
					>
						New code
					</Button>
					<Button
						color="error"
						disabled={end.isLoading}
						onClick={() => run(end, undefined, 'Invite cancelled')}
					>
						Cancel invite
					</Button>
				</Box>
			</>
		);
	} else {
		const other = link.spouse?.id;
		body = (
			<>
				<Box className="flex items-center gap-8 flex-wrap">
					<Typography className="font-semibold">{link.spouse?.name ?? 'Your spouse'}</Typography>
					<Chip
						size="small"
						color={link.iAmCharged ? 'primary' : 'default'}
						label={link.iAmCharged ? 'You pay for the household' : 'Your spouse pays for the household'}
					/>
				</Box>
				<Typography
					variant="caption"
					color="text.secondary"
				>
					The older spouse pays by default. {link.chargeeSetBy === 'USER' ? 'You both agreed this.' : ''}
				</Typography>
				{link.proposedChargeeUserId && !link.proposedByMe && (
					<Alert
						severity="warning"
						action={
							<Box className="flex gap-4">
								<Button
									size="small"
									onClick={() => run(respond, true, 'Updated')}
								>
									Agree
								</Button>
								<Button
									size="small"
									color="inherit"
									onClick={() => run(respond, false)}
								>
									Decline
								</Button>
							</Box>
						}
					>
						Your spouse proposes that {link.proposedChargeeUserId === other ? 'they pay' : 'you pay'}.
					</Alert>
				)}
				{link.proposedChargeeUserId && link.proposedByMe && (
					<Alert severity="info">Waiting for your spouse to answer your proposal.</Alert>
				)}
				<Box className="flex gap-8 flex-wrap">
					{!link.proposedChargeeUserId && (
						<Button
							variant="outlined"
							disabled={propose.isLoading}
							onClick={() => run(propose, link.iAmCharged ? other : link.myUserId, 'Proposal sent')}
						>
							{link.iAmCharged ? 'Propose that my spouse pays' : 'Propose that I pay'}
						</Button>
					)}
					<Button
						color="error"
						onClick={() => setConfirmEnd(true)}
					>
						End link
					</Button>
				</Box>
			</>
		);
	}

	return (
		<Paper className="rounded-2xl p-24 flex flex-col gap-12">
			<Typography className="font-semibold">Spouse</Typography>
			{body}
			{shown && (
				<InviteCodeDialog
					invite={shown}
					onClose={() => setShown(null)}
				/>
			)}
			{confirmEnd && (
				<ConfirmDialog
					title="End the spouse link?"
					body="From next month each of you is billed on your own. Months already paid stay paid. Your marital status stays as it is; if it has changed, send a change request from My details."
					confirmLabel="End link"
					busy={end.isLoading}
					onClose={() => setConfirmEnd(false)}
					onConfirm={() =>
						end.mutate(undefined, {
							onSuccess: () => {
								setConfirmEnd(false);
								toast.success('Link ended');
							},
							onError: (e) => toast.error(errMsg(e))
						})
					}
				/>
			)}
		</Paper>
	);
}

function AddChildDialog({ onClose }) {
	const declare = useDeclareDependant();
	const [f, setF] = useState({ fullName: '', dateOfBirth: '', relationship: 'CHILD' });
	const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

	const submit = () => {
		if (!f.fullName.trim() || !f.dateOfBirth) {
			toast.error('Add the full name and date of birth');
			return;
		}

		declare.mutate(f, {
			onSuccess: () => {
				toast.success('Added to your household');
				onClose();
			},
			onError: (e) => toast.error(errMsg(e))
		});
	};

	return (
		<Dialog
			open
			onClose={onClose}
			maxWidth="xs"
			fullWidth
		>
			<DialogTitle className="font-extrabold">Add a child</DialogTitle>
			<DialogContent className="flex flex-col gap-16 pt-8">
				<Alert severity="info">
					Children under 10 cost nothing to include. Their name and date of birth are stored encrypted and shown
					only to you and your linked spouse.
				</Alert>
				<TextField
					size="small"
					label="Full name"
					value={f.fullName}
					onChange={set('fullName')}
				/>
				<TextField
					size="small"
					type="date"
					label="Date of birth"
					InputLabelProps={{ shrink: true }}
					value={f.dateOfBirth}
					onChange={set('dateOfBirth')}
				/>
				<TextField
					size="small"
					select
					label="Relationship"
					value={f.relationship}
					onChange={set('relationship')}
				>
					<MenuItem value="CHILD">My child</MenuItem>
					<MenuItem value="WARD">A child in my care</MenuItem>
				</TextField>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					variant="contained"
					onClick={submit}
					disabled={declare.isLoading}
				>
					Add
				</Button>
			</DialogActions>
		</Dialog>
	);
}

function ChildrenCard({ data }) {
	const remove = useRemoveDependant();
	const [adding, setAdding] = useState(false);
	const [removing, setRemoving] = useState(null);
	const items = data?.items ?? [];
	const declared = data?.declaredChildrenCount;

	return (
		<Paper className="rounded-2xl p-24 flex flex-col gap-12">
			<Box className="flex items-center justify-between">
				<Typography className="font-semibold">Children</Typography>
				<Button
					variant="outlined"
					size="small"
					onClick={() => setAdding(true)}
				>
					Add a child
				</Button>
			</Box>
			{typeof declared === 'number' && declared > items.length && (
				<Alert severity="info">
					You told us you have {declared} {declared === 1 ? 'child' : 'children'} and {items.length} {items.length === 1 ? 'is' : 'are'}{' '}
					listed. Adding them here also helps with school and health records later.
				</Alert>
			)}
			{items.length === 0 && <Typography color="text.secondary">No children listed yet.</Typography>}
			{items.map((c) => (
				<Box
					key={c.id}
					className="flex items-center justify-between gap-12 flex-wrap"
				>
					<div>
						<Typography className="font-semibold">{c.fullName}</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
						>
							{c.age} years old · born {day(c.dateOfBirth)}
							{c.declaredByMe ? '' : ' · added by your spouse'}
						</Typography>
					</div>
					<Box className="flex items-center gap-8">
						{c.agedOut && (
							<Chip
								size="small"
								color="warning"
								label="Now 18: needs their own account"
							/>
						)}
						{c.declaredByMe && (
							<Button
								size="small"
								color="error"
								onClick={() => setRemoving(c)}
							>
								Remove
							</Button>
						)}
					</Box>
				</Box>
			))}
			{adding && <AddChildDialog onClose={() => setAdding(false)} />}
			{removing && (
				<ConfirmDialog
					title={`Remove ${removing.fullName}?`}
					body="They stop counting toward your household from next month. Months already paid stay paid."
					confirmLabel="Remove"
					busy={remove.isLoading}
					onClose={() => setRemoving(null)}
					onConfirm={() =>
						remove.mutate(removing.id, {
							onSuccess: () => {
								setRemoving(null);
								toast.success('Removed');
							},
							onError: (e) => toast.error(errMsg(e))
						})
					}
				/>
			)}
		</Paper>
	);
}

/** My household: spouse link and children (civic-55 CP-4). */
export default function MyHouseholdPage() {
	const spouse = useSpouseLink();
	const dependants = useDependants();

	if (spouse.isError) {
		return (
			<Box className="p-48 text-center">
				<Typography>Sign in to see your household.</Typography>
				<Button
					component={Link}
					to="/sign-in"
				>
					Sign in
				</Button>
			</Box>
		);
	}

	if (spouse.isLoading || dependants.isLoading) {
		return (
			<Box className="flex justify-center p-48">
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box
			className="mx-auto p-16 md:p-24 flex flex-col gap-16"
			style={{ maxWidth: 680, marginTop: 56 }}
		>
			<Button
				component={Link}
				to="/account/profile"
				startIcon={<ArrowBackIcon />}
				sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
			>
				My details
			</Button>
			<Typography className="text-24 md:text-32 font-extrabold tracking-tight">My household</Typography>
			{spouse.data?.enabled === false ? (
				<Alert severity="info">Household features are not available yet. They are coming soon.</Alert>
			) : (
				<>
					<SpouseCard link={spouse.data?.link} />
					<ChildrenCard data={dependants.data} />
				</>
			)}
		</Box>
	);
}
