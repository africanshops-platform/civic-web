import { useQuery } from 'react-query';
import { Api } from 'app/configs/data/client/RepositoryClient';

// ─── raw API layer ────────────────────────────────────────────────────────
// Public, unauthenticated — every app fetches a legal document the same
// way, no login required. Deliberately NOT the legacy getApiPrivacies /
// getApiTerms in RepositoryClient.js's "Legal/Advocacy Oriented Routes"
// section (/privacies/clientpricacy, /privacies/terms) — those predate the
// microservices split and don't resolve against the current gateway.
const api = {
	getByKey: (key) => Api().get(`/corporate-cms/legal/${key}`)
};

// ─── hooks ───────────────────────────────────────────────────────────────

/** Fetches a published legal document by its canonical key (see
 * app/constants/legalDocumentKeys.js). A document that doesn't exist, or
 * exists only as an unpublished draft, both 404 — react-query surfaces
 * that as `isError`, not a thrown render error, so the page can show a
 * real "not published yet" state instead of crashing. */
export function useLegalDocument(key) {
	return useQuery(['legal-document', key], () => api.getByKey(key), {
		select: (res) => res.data,
		enabled: Boolean(key),
		retry: false
	});
}
