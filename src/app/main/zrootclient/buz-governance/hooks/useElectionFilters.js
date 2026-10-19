import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { readFilters, writeFilters } from './electionArea';
import { useMyArea } from './useGovernanceRepo';

export const ELECTIONS_PATH = '/governance/elections';

/**
 * The filters of the elections list, kept in the address bar so the left sidebar and the list page always agree and a filtered
 * list can be shared. Changing a filter from any other governance page takes the citizen to the list with it applied.
 */
export default function useElectionFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: dwelling = null } = useMyArea();

  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  const setFilters = useCallback(
    (patch) => {
      const next = writeFilters(searchParams, { ...filters, ...patch });
      if (location.pathname === ELECTIONS_PATH) setSearchParams(next, { replace: true });
      else navigate({ pathname: ELECTIONS_PATH, search: next.toString() });
    },
    [filters, location.pathname, navigate, searchParams, setSearchParams],
  );

  const clear = useCallback(() => setFilters({ search: '', level: '', status: '', area: false }), [setFilters]);

  return { filters, setFilters, clear, dwelling, hasFilters: Boolean(filters.search || filters.level || filters.status || filters.area) };
}
