/**
 * A student's league points from school leagues (civic-67): 1 point for each match they were named in the squad, 2 more for a
 * win. Shows nothing until they have played one. Points never change a grade.
 */
export default function SchoolPointsCard({ data }) {
  if (!data || !data.matchesPlayed) return null;
  return (
    <div className="fl2-card fl2-stack" data-testid="school-points" style={{ marginBottom: 16 }}>
      <div className="fl2-row fl2-between" style={{ alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontWeight: 800, fontSize: '1.6rem' }}>Your school league points</span>
        <span style={{ fontWeight: 900, fontSize: '2.4rem' }} data-testid="school-points-total">{data.totalPoints}</span>
      </div>
      <span style={{ opacity: 0.8 }}>
        {data.matchesPlayed} match{data.matchesPlayed === 1 ? '' : 'es'} played · {data.wins} win{data.wins === 1 ? '' : 's'}
      </span>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {data.matches.slice(0, 5).map((m) => (
          <li key={m.matchId} data-testid="school-points-match">
            {m.league}: {m.won ? 'won' : 'played'} · {m.points} point{m.points === 1 ? '' : 's'}
          </li>
        ))}
      </ul>
    </div>
  );
}
