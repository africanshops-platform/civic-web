import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, TextField } from '@mui/material';
import useCivicWebAuth from 'src/app/hooks/useCivicWebAuth';
import { useGoalAdoptions } from '../hooks/useCivicTaxRepo';
import GoalCard from '../components/GoalCard';
import GoalGiveDialog from '../components/GoalGiveDialog';
import { filterGoals } from '../goalFunding';

/**
 * Development goals (civic-29): what each LGA has adopted, what it has raised and spent, and the real projects it funds.
 * Browsing is public; giving needs sign-in (the server also requires a verified identity).
 */
export default function DevelopmentGoalsPage() {
  const { isAuthenticated } = useCivicWebAuth();
  const { data, isLoading, isError } = useGoalAdoptions();
  const [search, setSearch] = useState('');
  const [giving, setGiving] = useState(null);
  const [givingLga, setGivingLga] = useState(null);
  const signIn = () => window.location.assign('/sign-in');
  const goals = useMemo(() => filterGoals(data ?? [], search), [data, search]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(16px, 3vw, 32px)' }}>
      <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, margin: 0 }}>Development goals</h1>
      <p style={{ color: '#4b5563' }}>
        Goals your LGA has chosen to fund together. Every naira given is tracked from the goal's wallet to the project that spends it.
      </p>
      {!isAuthenticated && (
        <Alert severity="info" action={<Button component={Link} to="/sign-in" size="small">Sign in</Button>} sx={{ mb: 2 }}>
          You can look around freely. Sign in to give.
        </Alert>
      )}
      <TextField size="small" label="Search by LGA, state or goal" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth sx={{ mb: 2 }} />
      {isLoading && <p>Loading goals…</p>}
      {isError && <Alert severity="error">The goals could not be loaded. Please try again.</Alert>}
      {!isLoading && !isError && goals.length === 0 && (
        <p data-testid="no-goals" style={{ color: '#6b7280' }}>{search ? 'No goal matches your search.' : 'No LGA has adopted a goal yet.'}</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {goals.map((g) => (
          <GoalCard key={g.id} goal={g} onGive={(goal) => (isAuthenticated ? setGiving(goal) : signIn())} onGiveLga={(goal) => (isAuthenticated ? setGivingLga(goal) : signIn())} />
        ))}
      </div>
      {giving && <GoalGiveDialog goal={giving} onClose={() => setGiving(null)} />}
      {givingLga && <GoalGiveDialog goal={givingLga} toLga onClose={() => setGivingLga(null)} />}
    </div>
  );
}
