import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

// civic-55 CP-4: spouse link and dependants. The server enforces every rule (verification, age, marital status);
// `enabled: false` means the feature is switched off for this environment.
const SPOUSE_KEY = ['household-spouse'];
const DEPENDANTS_KEY = ['household-dependants'];

export const useSpouseLink = () =>
	useQuery(SPOUSE_KEY, () => AuthApi().get('/household/spouse'), { staleTime: 15 * 1000, select: (res) => res.data });

export const useDependants = () =>
	useQuery(DEPENDANTS_KEY, () => AuthApi().get('/household/dependants'), { staleTime: 15 * 1000, select: (res) => res.data });

function useSpouseMutation(fn) {
	const qc = useQueryClient();
	return useMutation(fn, { onSuccess: () => qc.invalidateQueries(SPOUSE_KEY) });
}

export const useInviteSpouse = () => useSpouseMutation(() => AuthApi().post('/household/spouse/invite'));
export const useAcceptSpouse = () => useSpouseMutation((code) => AuthApi().post('/household/spouse/accept', { code }));
export const useEndSpouse = () => useSpouseMutation(() => AuthApi().delete('/household/spouse'));
export const useProposeChargee = () =>
	useSpouseMutation((chargeeUserId) => AuthApi().post('/household/spouse/chargee', { chargeeUserId }));
export const useRespondChargee = () =>
	useSpouseMutation((accept) => AuthApi().post('/household/spouse/chargee/respond', { accept }));

export function useDeclareDependant() {
	const qc = useQueryClient();
	return useMutation((body) => AuthApi().post('/household/dependants', body), {
		onSuccess: () => qc.invalidateQueries(DEPENDANTS_KEY)
	});
}

export function useRemoveDependant() {
	const qc = useQueryClient();
	return useMutation((id) => AuthApi().delete(`/household/dependants/${id}`), {
		onSuccess: () => qc.invalidateQueries(DEPENDANTS_KEY)
	});
}
