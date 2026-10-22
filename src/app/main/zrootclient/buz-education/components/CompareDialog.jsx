import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { FACILITY_LABELS, levelInfo } from '../constants';

/** Two or three schools side by side, using only what each school has declared. Nothing here is a ranking or a rating. */
export default function CompareDialog({ schools, onClose }) {
  const rows = [
    ['Kind', (s) => levelInfo(s.level).label],
    ['Address', (s) => `${s.address ?? ''}${s.lga ? `, ${s.lga}` : ''}`],
    ['Distance from you', (s) => (s.distanceKm != null ? `${s.distanceKm} km` : 'Not searched by distance')],
    ['Boarding', (s) => (s.isBoarding ? 'Yes' : 'No')],
    ['Facilities', (s) => (s.facilities?.length ? s.facilities.map((f) => FACILITY_LABELS[f] ?? f).join(', ') : 'None declared')],
    ['Phone', (s) => s.phone || 'Not listed'],
  ];
  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Compare schools</DialogTitle>
      <DialogContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              {schools.map((s) => <TableCell key={s.id} sx={{ fontWeight: 800 }}>{s.name}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(([label, get]) => (
              <TableRow key={label}>
                <TableCell sx={{ fontWeight: 700 }}>{label}</TableCell>
                {schools.map((s) => <TableCell key={s.id}>{get(s)}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
    </Dialog>
  );
}
