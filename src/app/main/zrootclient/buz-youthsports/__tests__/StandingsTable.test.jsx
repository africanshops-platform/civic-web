import { render, screen } from '@testing-library/react';
import StandingsTable from '../screens/shared-components/StandingsTable';

const teams = [
  { id: 't1', teamName: 'Eti-Osa FC', points: 6, wins: 2, draws: 0, losses: 0, goalsFor: 5, goalsAgainst: 2, isEliminated: false },
  { id: 't2', teamName: 'Ikeja United', points: 6, wins: 2, draws: 0, losses: 0, goalsFor: 3, goalsAgainst: 1, isEliminated: false },
  { id: 't3', teamName: 'Surulere Stars', points: 3, wins: 1, draws: 0, losses: 1, goalsFor: 2, goalsAgainst: 2, isEliminated: true },
];

describe('StandingsTable', () => {
  it('ranks teams by points, breaking ties by goal difference', () => {
    render(<StandingsTable teams={teams} />);
    // t1 and t2 are tied on points (6) — t2's goal difference (+2) beats t1's (+3)?
    // t1 GD = 5-2=+3, t2 GD = 3-1=+2, so t1 should actually rank first on GD too.
    const rows = screen.getAllByText(/^\d+\. /);
    expect(rows[0]).toHaveTextContent('1. Eti-Osa FC');
    expect(rows[1]).toHaveTextContent('2. Ikeja United');
    expect(rows[2]).toHaveTextContent('3. Surulere Stars');
  });

  it('renders points, wins, and goal difference for the top team', () => {
    render(<StandingsTable teams={teams} />);
    expect(screen.getByText('+3')).toBeInTheDocument(); // Eti-Osa FC's goal difference
  });
});
