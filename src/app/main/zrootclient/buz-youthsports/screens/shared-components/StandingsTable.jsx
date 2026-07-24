// LEAGUE/ROUND_ROBIN tournaments don't have a single-elimination bracket to
// visualize — a standings table (points/W/D/L/goal difference) is the correct
// real representation for these formats, not a forced bracket tree. Ported
// from the civic-app mobile version — same ranking logic, DOM instead of
// react-native Views.
export default function StandingsTable({ teams }) {
  const sorted = [...teams].sort(
    (a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)
  );

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
      <div style={{ display: 'flex', padding: '10px 12px', background: '#f8fafc' }}>
        <span style={{ flex: 1, fontSize: 10, fontWeight: 800, color: '#94a3b8' }}>TEAM</span>
        {['P', 'W', 'D', 'L', 'GD', 'PTS'].map((h) => (
          <span key={h} style={{ width: 30, fontSize: 10, fontWeight: 800, color: '#94a3b8', textAlign: 'center' }}>{h}</span>
        ))}
      </div>
      {sorted.map((team, i) => {
        const played = team.wins + team.draws + team.losses;
        const gd = team.goalsFor - team.goalsAgainst;
        return (
          <div
            key={team.id}
            style={{
              display: 'flex', alignItems: 'center', padding: '10px 12px',
              borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
              opacity: team.isEliminated ? 0.5 : 1,
            }}
          >
            <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {i + 1}. {team.teamName}
            </span>
            <span style={{ width: 30, fontSize: 12, color: '#475569', textAlign: 'center' }}>{played}</span>
            <span style={{ width: 30, fontSize: 12, color: '#475569', textAlign: 'center' }}>{team.wins}</span>
            <span style={{ width: 30, fontSize: 12, color: '#475569', textAlign: 'center' }}>{team.draws}</span>
            <span style={{ width: 30, fontSize: 12, color: '#475569', textAlign: 'center' }}>{team.losses}</span>
            <span style={{ width: 30, fontSize: 12, color: '#475569', textAlign: 'center' }}>{gd > 0 ? `+${gd}` : gd}</span>
            <span style={{ width: 30, fontSize: 13, fontWeight: 900, color: '#0f172a', textAlign: 'center' }}>{team.points}</span>
          </div>
        );
      })}
    </div>
  );
}
