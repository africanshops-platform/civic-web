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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';
import {
	useAboutYou,
	useCreateChangeRequest,
	useMyChangeRequests,
	useSaveAboutYou
} from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';

const FIELD_LABEL = { dateOfBirth: 'Date of birth', gender: 'Gender', maritalStatus: 'Marital status' };
const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const MARITAL = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED'];
const pretty = (v) => (v ? String(v).charAt(0) + String(v).slice(1).toLowerCase() : 'Not provided');
const day = (v) => (v ? new Date(v).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not provided');
const STATUS_COLOR = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'error' };

function ChangeRequestDialog({ field, current, onClose }) {
	const create = useCreateChangeRequest();
	const [newValue, setNewValue] = useState('');
	const [reason, setReason] = useState('');

	const submit = () => {
		if (!newValue || !reason.trim()) {
			toast.error('Add the correct value and say why it should change');
			return;
		}

		create.mutate(
			{ field, newValue, reason: reason.trim() },
			{
				onSuccess: () => {
					toast.success('Your request was sent for review');
					onClose();
				},
				onError: (e) => toast.error(e?.response?.data?.message || 'Could not send your request')
			}
		);
	};

	return (
		<Dialog
			open
			onClose={onClose}
			maxWidth="xs"
			fullWidth
		>
			<DialogTitle className="font-extrabold">Request a change: {FIELD_LABEL[field]}</DialogTitle>
			<DialogContent className="flex flex-col gap-16 pt-8">
				<Alert severity="info">
					This detail was checked against your ID, so a reviewer must approve any change. Currently: {current}
				</Alert>
				{field === 'dateOfBirth' && (
					<TextField
						size="small"
						type="date"
						label="Correct date of birth"
						InputLabelProps={{ shrink: true }}
						value={newValue}
						onChange={(e) => setNewValue(e.target.value)}
					/>
				)}
				{field === 'gender' && (
					<TextField
						size="small"
						select
						label="Correct gender"
						value={newValue}
						onChange={(e) => setNewValue(e.target.value)}
					>
						{GENDERS.map((g) => (
							<MenuItem
								key={g}
								value={g}
							>
								{pretty(g)}
							</MenuItem>
						))}
					</TextField>
				)}
				{field === 'maritalStatus' && (
					<TextField
						size="small"
						select
						label="Correct marital status"
						value={newValue}
						onChange={(e) => setNewValue(e.target.value)}
					>
						{MARITAL.map((m) => (
							<MenuItem
								key={m}
								value={m}
							>
								{pretty(m)}
							</MenuItem>
						))}
					</TextField>
				)}
				<TextField
					size="small"
					multiline
					minRows={3}
					label="Why should it change?"
					value={reason}
					onChange={(e) => setReason(e.target.value)}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					variant="contained"
					onClick={submit}
					disabled={create.isLoading}
				>
					Send request
				</Button>
			</DialogActions>
		</Dialog>
	);
}

function Row({ label, value, locked, pending, onRequest, editor }) {
	return (
		<Box className="flex items-center justify-between gap-12 flex-wrap py-8">
			<div>
				<Typography
					variant="caption"
					color="text.secondary"
				>
					{label}
				</Typography>
				<Typography className="font-semibold">{value}</Typography>
			</div>
			{locked ? (
				<Box className="flex items-center gap-8">
					<Chip
						size="small"
						icon={<LockOutlinedIcon />}
						label="Locked after ID check"
					/>
					{pending ? (
						<Chip
							size="small"
							color="warning"
							label="Change request waiting"
						/>
					) : (
						<Button
							size="small"
							onClick={onRequest}
						>
							Request a change
						</Button>
					)}
				</Box>
			) : (
				editor
			)}
		</Box>
	);
}

/** My details: what I declared, what is locked, add-only children, and change requests for locked fields. */
export default function MyDetailsPage() {
	const { data, isLoading, isError } = useAboutYou();
	const { data: requests = [] } = useMyChangeRequests();
	const save = useSaveAboutYou();
	const [requesting, setRequesting] = useState(null);

	if (isError) {
		return (
			<Box className="p-48 text-center">
				<Typography>Sign in to see your details.</Typography>
				<Button
					component={Link}
					to="/sign-in"
				>
					Sign in
				</Button>
			</Box>
		);
	}

	if (isLoading || !data) {
		return (
			<Box className="flex justify-center p-48">
				<CircularProgress />
			</Box>
		);
	}

	const locked = data.lockedFields ?? [];
	const pendingFields = (data.pendingChangeRequests ?? []).map((r) => r.field);
	const current = { dateOfBirth: day(data.dateOfBirth), gender: pretty(data.gender), maritalStatus: pretty(data.maritalStatus) };

	const patch = (body, ok) =>
		save.mutate(body, {
			onSuccess: () => toast.success(ok),
			onError: (e) => toast.error(e?.response?.data?.message || 'Could not save')
		});

	const select = (field, options, value) => (
		<TextField
			size="small"
			select
			value={value ?? ''}
			onChange={(e) => patch({ [field]: e.target.value }, 'Saved')}
			sx={{ minWidth: 160 }}
		>
			{options.map((o) => (
				<MenuItem
					key={o}
					value={o}
				>
					{pretty(o)}
				</MenuItem>
			))}
		</TextField>
	);

	return (
		<Box
			className="mx-auto p-16 md:p-24 flex flex-col gap-16"
			style={{ maxWidth: 680, marginTop: 56 }}
		>
			<Button
				component={Link}
				to="/"
				startIcon={<ArrowBackIcon />}
				sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
			>
				Back
			</Button>
			<Typography className="text-24 md:text-32 font-extrabold tracking-tight">My details</Typography>
			<Typography color="text.secondary">
				These come from your identity check. Once a detail has been checked against your ID it is locked, and a
				change needs a reviewer to approve it.
			</Typography>

			<Paper className="rounded-2xl p-24">
				<Row
					label="Date of birth"
					value={current.dateOfBirth}
					locked={locked.includes('dateOfBirth')}
					pending={pendingFields.includes('dateOfBirth')}
					onRequest={() => setRequesting('dateOfBirth')}
					editor={
						<TextField
							size="small"
							type="date"
							value={data.dateOfBirth ? String(data.dateOfBirth).slice(0, 10) : ''}
							onChange={(e) => e.target.value && patch({ dateOfBirth: e.target.value }, 'Saved')}
						/>
					}
				/>
				<Row
					label="Gender"
					value={current.gender}
					locked={locked.includes('gender')}
					pending={pendingFields.includes('gender')}
					onRequest={() => setRequesting('gender')}
					editor={select('gender', GENDERS, data.gender)}
				/>
				{data.hasCivicProfile ? (
					<>
						<Row
							label="Marital status"
							value={current.maritalStatus}
							locked={locked.includes('maritalStatus')}
							pending={pendingFields.includes('maritalStatus')}
							onRequest={() => setRequesting('maritalStatus')}
							editor={select('maritalStatus', MARITAL, data.maritalStatus)}
						/>
						<Row
							label="Children"
							value={data.childrenCount ?? 0}
							editor={
								<Button
									size="small"
									variant="outlined"
									disabled={save.isLoading || (data.childrenCount ?? 0) >= 30}
									onClick={() => patch({ childrenCount: (data.childrenCount ?? 0) + 1 }, 'Child added')}
								>
									Add a child
								</Button>
							}
						/>
						<Typography
							variant="caption"
							color="text.secondary"
						>
							The number of children can go up here. To correct it downwards, contact support.
						</Typography>
					</>
				) : (
					<Alert
						severity="info"
						className="mt-8"
					>
						Activate your civic profile to add your marital status and children.
					</Alert>
				)}
			</Paper>

			{requests.length > 0 && (
				<Paper className="rounded-2xl p-24 flex flex-col gap-12">
					<Typography className="font-semibold">My change requests</Typography>
					{requests.map((r) => (
						<Box
							key={r.id}
							className="flex items-start justify-between gap-12"
						>
							<div>
								<Typography>
									{FIELD_LABEL[r.field]}: {r.oldValue ?? 'none'} to {r.newValue}
								</Typography>
								{r.decisionNote && (
									<Typography
										variant="caption"
										color="text.secondary"
									>
										Reviewer: {r.decisionNote}
									</Typography>
								)}
							</div>
							<Chip
								size="small"
								color={STATUS_COLOR[r.status]}
								label={pretty(r.status)}
							/>
						</Box>
					))}
				</Paper>
			)}

			{requesting && (
				<ChangeRequestDialog
					field={requesting}
					current={current[requesting]}
					onClose={() => setRequesting(null)}
				/>
			)}
		</Box>
	);
}
