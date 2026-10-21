import { useState } from 'react';
import { Button, Chip, LinearProgress } from '@mui/material';
import { useGoalProjects } from '../hooks/useCivicTaxRepo';
import { naira, pctOfTarget } from '../goalFunding';

function Projects({ adoptionId }) {
  const { data, isLoading } = useGoalProjects(adoptionId);
  if (isLoading) return <small>Loading projects…</small>;
  if (!data?.length) return <small style={{ color: '#6b7280' }}>No project has started under this goal yet.</small>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((p) => {
        const done = p.milestones.filter((m) => m.status === 'COMPLETED').length;
        return (
          <div key={p.id} data-testid={`goal-project-${p.id}`} style={{ borderTop: '1px solid #ffedd5', paddingTop: 8 }}>
            <b>{p.title}</b>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{done} of {p.milestones.length} steps done</div>
            <ul style={{ margin: '4px 0 0 18px', padding: 0, fontSize: 14 }}>
              {p.milestones.map((m) => (
                <li key={m.id}>
                  {m.title} · {m.status === 'COMPLETED' ? 'done' : m.status === 'IN_PROGRESS' ? 'in progress' : 'planned'}
                  {Number(m.amountDisbursedKobo) > 0 && <> · {naira(m.amountDisbursedKobo)} paid out</>}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** One adopted goal: what it is for, how much it has raised, and the real projects it funds. */
export default function GoalCard({ goal, onGive, onGiveLga }) {
  const [open, setOpen] = useState(false);
  const f = goal.funding;
  const pct = pctOfTarget(f?.raisedKobo, goal.targetKobo);
  return (
    <div data-testid={`goal-${goal.id}`} style={{ background: 'white', borderRadius: 20, border: '1px solid #ffedd5', padding: 'clamp(14px, 2vw, 20px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{goal.goal?.title}</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>{goal.lga}, {goal.state}</div>
        </div>
        {goal.goal?.category && <Chip size="small" label={goal.goal.category} />}
      </div>
      {goal.goal?.description && <p style={{ margin: '8px 0', color: '#374151' }}>{goal.goal.description}</p>}
      {f ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: '8px 0' }}>
          {[['Raised', f.raisedKobo], ['Spent on projects', f.disbursedKobo], ['Still held', f.balanceKobo]].map(([label, v]) => (
            <div key={label} style={{ textAlign: 'center', background: '#fff7ed', borderRadius: 12, padding: 8 }}>
              <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{label}</div>
              <div style={{ fontWeight: 800, color: '#ea580c' }}>{naira(v)}</div>
            </div>
          ))}
        </div>
      ) : (
        <small style={{ color: '#6b7280' }}>Funding figures are not available right now.</small>
      )}
      {pct !== null && (
        <div style={{ margin: '6px 0' }}>
          <LinearProgress variant="determinate" value={pct} aria-label={`${pct}% of the target raised`} />
          <small>{pct}% of the {naira(goal.targetKobo)} target</small>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <Button variant="contained" size="small" onClick={() => onGive(goal)}>Give to this goal</Button>
        {onGiveLga && <Button size="small" onClick={() => onGiveLga(goal)}>Give to {goal.lga} directly</Button>}
        <Button size="small" onClick={() => setOpen((v) => !v)}>{open ? 'Hide projects' : 'See the projects'}</Button>
      </div>
      {open && <div style={{ marginTop: 8 }}><Projects adoptionId={goal.id} /></div>}
    </div>
  );
}
