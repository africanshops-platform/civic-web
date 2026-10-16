import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useEnrol } from '../hooks/useHealthcareRepo';

/** Enrol with a primary facility: says plainly what custody means before the person agrees. */
export default function EnrolDialog({ facility, replacing, onClose }) {
  const enrol = useEnrol();
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Enrol with {facility.name}?</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <Typography>
          This facility becomes the custodian of your health record: its staff can read it when they treat you. Nobody else can unless you give them access yourself.
        </Typography>
        {replacing && <Alert severity="info">You are enrolled somewhere else now. Enrolling here ends that enrolment.</Alert>}
        <Typography variant="body2" color="text.secondary">You can leave at any time. This is a community-run service, not a government one.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Not now</Button>
        <Button variant="contained" disabled={enrol.isLoading} onClick={() => enrol.mutate(facility.id, { onSuccess: onClose })}>Enrol here</Button>
      </DialogActions>
    </Dialog>
  );
}
