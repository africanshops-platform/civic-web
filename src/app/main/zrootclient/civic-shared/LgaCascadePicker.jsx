import { useEffect, useState } from 'react';
import CountrySelect from 'src/app/apselects/countryselect';
import StateSelect from 'src/app/apselects/stateselect';
import LgaSelect from 'src/app/apselects/lgaselect';
import { getStateByCountryId, getLgaByStateId } from 'app/configs/data/client/clientToApiRoutes';

/**
 * One Country -> State -> LGA cascade, self-contained. Pre-fills from
 * `initial` (the {countryId, stateId, lgaId, jurisdiction} shape returned
 * by GET /civic/tax/my-split-summary) using the resolved place NAMES as a
 * display stand-in — the summary endpoint only resolves names, not full
 * place option objects, and re-fetching each level just to get an object
 * with the same id+name isn't worth the extra round trips for a value
 * that's only ever redisplayed, never re-submitted as-is.
 *
 * Shared between EditCivicSplitDialog (editing an existing civic user's
 * split) and CivicActivationPage (choosing home-origin/dwelling for the
 * very first time, at upgrade) — both need the identical Country/State/LGA
 * shape the backend's UpgradeToCivicUserDto/UpdateCivicProfileDto expect.
 */
export default function LgaCascadePicker({ label, initial, onChange }) {
  const [country, setCountry] = useState(
    initial?.countryId ? { id: initial.countryId, name: initial.jurisdiction?.country } : null
  );
  const [state, setState] = useState(
    initial?.stateId ? { id: initial.stateId, name: initial.jurisdiction?.state } : null
  );
  const [lga, setLga] = useState(
    initial?.lgaId ? { id: initial.lgaId, name: initial.jurisdiction?.lga } : null
  );
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);

  useEffect(() => {
    if (!country?.id) { setStates([]); return; }
    getStateByCountryId(country.id).then((res) => setStates(res?.data?.states ?? []));
  }, [country?.id]);

  useEffect(() => {
    if (!state?.id) { setLgas([]); return; }
    getLgaByStateId(state.id).then((res) => setLgas(res?.data?.lgas ?? []));
  }, [state?.id]);

  useEffect(() => {
    onChange({ countryId: country?.id, stateId: state?.id, lgaId: lga?.id });
  }, [country?.id, state?.id, lga?.id, onChange]);

  return (
    <div className="flex flex-col gap-8">
      <div className="font-bold text-14">{label}</div>
      <CountrySelect
        value={country}
        onChange={(v) => { setCountry(v); setState(null); setLga(null); }}
      />
      {country?.id && (
        <StateSelect
          states={states}
          value={state}
          onChange={(v) => { setState(v); setLga(null); }}
        />
      )}
      {state?.id && (
        <LgaSelect blgas={lgas} value={lga} onChange={setLga} />
      )}
    </div>
  );
}
