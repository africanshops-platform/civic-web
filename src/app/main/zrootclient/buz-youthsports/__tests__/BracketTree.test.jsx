import { render, screen } from '@testing-library/react';
import BracketTree from '../screens/shared-components/BracketTree';

const teams = [
  { id: 'team1', teamName: 'Eti-Osa FC' },
  { id: 'team2', teamName: 'Ikeja United' },
  { id: 'team3', teamName: 'Surulere Stars' },
  { id: 'team4', teamName: 'Agege Boys' },
];

const matches = [
  { id: 'm1', round: 1, homeTeamId: 'team1', awayTeamId: 'team2', homeScore: 2, awayScore: 1, isCompleted: true },
  { id: 'm2', round: 1, homeTeamId: 'team3', awayTeamId: 'team4', homeScore: null, awayScore: null, isCompleted: false },
  { id: 'm3', round: 2, homeTeamId: 'team1', awayTeamId: 'team3', homeScore: null, awayScore: null, isCompleted: false },
];

describe('BracketTree', () => {
  it('groups matches into their real rounds, not a hardcoded count', () => {
    render(<BracketTree matches={matches} teams={teams} />);
    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.getByText('Round 2')).toBeInTheDocument();
    expect(screen.queryByText('Round 3')).not.toBeInTheDocument();
  });

  it('renders real team names via id lookup, not raw ids', () => {
    render(<BracketTree matches={matches} teams={teams} />);
    // Eti-Osa FC plays in both round 1 (m1) and round 2 (m3), so it legitimately
    // renders twice — Ikeja United only plays once, a cleaner uniqueness check.
    expect(screen.getAllByText('Eti-Osa FC').length).toBe(2);
    expect(screen.getByText('Ikeja United')).toBeInTheDocument();
  });

  it('falls back to "TBD" for a team id with no matching team', () => {
    const orphanMatch = [{ id: 'm4', round: 1, homeTeamId: 'unknown-id', awayTeamId: 'team1', isCompleted: false }];
    render(<BracketTree matches={orphanMatch} teams={teams} />);
    expect(screen.getByText('TBD')).toBeInTheDocument();
  });

  it('renders an empty state when there are no matches yet', () => {
    render(<BracketTree matches={[]} teams={teams} />);
    expect(screen.getByText('No matches scheduled yet.')).toBeInTheDocument();
  });
});
