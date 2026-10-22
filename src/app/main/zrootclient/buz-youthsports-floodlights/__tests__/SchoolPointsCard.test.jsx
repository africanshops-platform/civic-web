import { render, screen } from '@testing-library/react';
import SchoolPointsCard from '../screens/shared/SchoolPointsCard';

const data = {
  totalPoints: 7, matchesPlayed: 3, wins: 2,
  matches: [
    { matchId: 'm3', league: 'Abuja Secondary Cup', won: true, points: 3 },
    { matchId: 'm2', league: 'Abuja Secondary Cup', won: false, points: 1 },
    { matchId: 'm1', league: 'Abuja Secondary Cup', won: true, points: 3 },
  ],
};

describe('SchoolPointsCard', () => {
  it('shows nothing until the student has played a school league match', () => {
    expect(render(<SchoolPointsCard data={undefined} />).container).toBeEmptyDOMElement();
    expect(render(<SchoolPointsCard data={{ totalPoints: 0, matchesPlayed: 0, wins: 0, matches: [] }} />).container).toBeEmptyDOMElement();
  });

  it('shows the total, matches played, wins and each match with its points', () => {
    render(<SchoolPointsCard data={data} />);
    expect(screen.getByTestId('school-points-total')).toHaveTextContent('7');
    expect(screen.getByText('3 matches played · 2 wins')).toBeInTheDocument();
    expect(screen.getAllByTestId('school-points-match').map((n) => n.textContent)).toEqual([
      'Abuja Secondary Cup: won · 3 points',
      'Abuja Secondary Cup: played · 1 point',
      'Abuja Secondary Cup: won · 3 points',
    ]);
  });

  it('uses singular words for one match and one win', () => {
    render(<SchoolPointsCard data={{ totalPoints: 3, matchesPlayed: 1, wins: 1, matches: [data.matches[0]] }} />);
    expect(screen.getByText('1 match played · 1 win')).toBeInTheDocument();
  });
});
