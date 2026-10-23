import { useQuery } from 'react-query';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

export const standingKey = (feature) => ['civic-subscription-standing', feature];

/** Is the signed-in citizen (or, for a child, their guardian) up to date for this gated feature? Rechecked when the tab regains focus, so paying and coming back opens the gate. */
export default function useSubscriptionStanding(feature) {
	return useQuery(standingKey(feature), () => AuthApi().get('/civic-subscription/standing', { params: { feature } }), {
		staleTime: 60 * 1000,
		retry: false,
		refetchOnWindowFocus: true,
		select: (res) => res.data
	});
}
