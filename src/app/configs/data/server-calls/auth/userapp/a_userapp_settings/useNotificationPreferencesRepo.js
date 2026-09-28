import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

export const NOTIFICATION_PREFERENCES_KEY = ['notification-preferences'];

// ─── raw API calls ────────────────────────────────────────────────────────────
const api = {
	getPreferences: () => AuthApi().get('/notification-preferences'),
	updatePreferences: (body) => AuthApi().put('/notification-preferences', body),
};

// ─── hooks ────────────────────────────────────────────────────────────────────

export function useGetNotificationPreferences() {
	return useQuery(NOTIFICATION_PREFERENCES_KEY, api.getPreferences, {
		staleTime: 5 * 60 * 1000,
		select: (res) => res.data,
	});
}

export function useUpdateNotificationPreferences() {
	const qc = useQueryClient();
	return useMutation(api.updatePreferences, {
		onSuccess: () => qc.invalidateQueries(NOTIFICATION_PREFERENCES_KEY),
	});
}
