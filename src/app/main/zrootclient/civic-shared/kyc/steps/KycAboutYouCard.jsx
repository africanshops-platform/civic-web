import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, MenuItem, TextField, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { toast } from 'react-toastify';
import { useAboutYou, useSaveAboutYou } from 'app/configs/data/server-calls/auth/userapp/a_kyc/useKycRepo';

const GENDERS = [
	{ value: 'MALE', label: 'Male' },
	{ value: 'FEMALE', label: 'Female' },
	{ value: 'OTHER', label: 'Other' }
];
const MARITAL = [
	{ value: 'SINGLE', label: 'Single' },
	{ value: 'MARRIED', label: 'Married' },
	{ value: 'DIVORCED', label: 'Divorced' },
	{ value: 'WIDOWED', label: 'Widowed' },
	{ value: 'SEPARATED', label: 'Separated' }
];

const dayOf = (v) => (v ? String(v).slice(0, 10) : '');

/**
 * "About you": date of birth, gender, marital status and children. These must match your ID. The reviewer checks them
 * beside the ID image, and once approved they are locked (changes then go through a request).
 */
export default function KycAboutYouCard() {
	const { data, isLoading } = useAboutYou();
	const save = useSaveAboutYou();
	const [f, setF] = useState({ dateOfBirth: '', gender: '', maritalStatus: '', childrenCount: '' });

	useEffect(() => {
		if (!data) return;
		setF({
			dateOfBirth: dayOf(data.dateOfBirth),
			gender: data.gender ?? '',
			maritalStatus: data.maritalStatus ?? '',
			childrenCount: data.childrenCount ?? ''
		});
	}, [data]);

	if (isLoading) return <CircularProgress size={22} />;

	const locked = data?.lockedFields ?? [];
	const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
	const hasProfile = data?.hasCivicProfile;

	const submit = () => {
		const body = {};
		if (!locked.includes('dateOfBirth') && f.dateOfBirth) body.dateOfBirth = f.dateOfBirth;
		if (!locked.includes('gender') && f.gender) body.gender = f.gender;

		if (hasProfile) {
			if (!locked.includes('maritalStatus') && f.maritalStatus) body.maritalStatus = f.maritalStatus;
			if (f.childrenCount !== '') body.childrenCount = parseInt(f.childrenCount, 10);
		}

		if (!Object.keys(body).length) {
			toast.info('Nothing to save yet');
			return;
		}

		save.mutate(body, {
			onSuccess: () => toast.success('Saved. Your details will be checked against your ID.'),
			onError: (e) => toast.error(e?.response?.data?.message || 'Could not save your details')
		});
	};

	const lockNote = (field) =>
		locked.includes(field) ? (
			<Box className="flex items-center gap-4" sx={{ color: 'text.secondary' }}>
				<LockOutlinedIcon sx={{ fontSize: 14 }} />
				<Typography variant="caption">Locked after verification</Typography>
			</Box>
		) : null;

	return (
		<div className="flex flex-col gap-12 mt-8">
			<Alert severity="info">Enter these exactly as they appear on your ID. They are checked against it.</Alert>
			<TextField
				size="small"
				type="date"
				label="Date of birth"
				InputLabelProps={{ shrink: true }}
				value={f.dateOfBirth}
				onChange={set('dateOfBirth')}
				disabled={locked.includes('dateOfBirth')}
			/>
			{lockNote('dateOfBirth')}
			<TextField
				size="small"
				select
				label="Gender"
				value={f.gender}
				onChange={set('gender')}
				disabled={locked.includes('gender')}
			>
				{GENDERS.map((g) => (
					<MenuItem
						key={g.value}
						value={g.value}
					>
						{g.label}
					</MenuItem>
				))}
			</TextField>
			{lockNote('gender')}
			{hasProfile ? (
				<>
					<TextField
						size="small"
						select
						label="Marital status"
						value={f.maritalStatus}
						onChange={set('maritalStatus')}
						disabled={locked.includes('maritalStatus')}
					>
						{MARITAL.map((m) => (
							<MenuItem
								key={m.value}
								value={m.value}
							>
								{m.label}
							</MenuItem>
						))}
					</TextField>
					{lockNote('maritalStatus')}
					<TextField
						size="small"
						type="number"
						label="Number of children"
						inputProps={{ min: Math.max(0, data?.childrenCount ?? 0), max: 30 }}
						value={f.childrenCount}
						onChange={set('childrenCount')}
						helperText="This can go up, not down."
					/>
				</>
			) : (
				<Typography
					variant="caption"
					color="text.secondary"
				>
					You can add your marital status and children once your civic profile is active.
				</Typography>
			)}
			<Box>
				<Button
					variant="contained"
					onClick={submit}
					disabled={save.isLoading}
				>
					Save my details
				</Button>
			</Box>
		</div>
	);
}
