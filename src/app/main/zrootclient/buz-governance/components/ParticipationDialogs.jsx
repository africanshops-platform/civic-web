import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useCreatePetition, useCreatePoll, useNominate } from '../hooks/useGovernanceRepo';

const NOTICE = 'This is a community-run space. It is not a government service.';

export function StartPetitionDialog({ onClose }) {
  const create = useCreatePetition();
  const [f, setF] = useState({ title: '', body: '', targetAuthority: '', signatureThreshold: '50' });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = () => {
    const threshold = parseInt(f.signatureThreshold, 10);
    if (!f.title.trim() || !f.body.trim() || !f.targetAuthority.trim()) {
      toast.error('Add a title, what you are asking for, and who it is for.');
      return;
    }
    if (!(threshold >= 10)) {
      toast.error('A petition needs a goal of at least 10 signatures.');
      return;
    }
    create.mutate(
      { title: f.title.trim(), body: f.body.trim(), targetAuthority: f.targetAuthority.trim(), signatureThreshold: threshold },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Start a petition</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <Alert severity="info">Your petition is for people who live in your area. {NOTICE}</Alert>
        <TextField size="small" label="Title" value={f.title} onChange={set('title')} />
        <TextField size="small" label="What are you asking for?" multiline minRows={4} value={f.body} onChange={set('body')} />
        <TextField size="small" label="Who should hear it? (e.g. the local council)" value={f.targetAuthority} onChange={set('targetAuthority')} />
        <TextField size="small" type="number" label="Signature goal" value={f.signatureThreshold} onChange={set('signatureThreshold')} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={create.isLoading}>Start petition</Button>
      </DialogActions>
    </Dialog>
  );
}

export function StartPollDialog({ onClose }) {
  const create = useCreatePoll();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const submit = () => {
    const clean = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || clean.length < 2) {
      toast.error('Add a question and at least two answers.');
      return;
    }
    create.mutate({ question: question.trim(), options: clean }, { onSuccess: onClose });
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Start a poll</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <Alert severity="info">Your poll is for people who live in your area. {NOTICE}</Alert>
        <TextField size="small" label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
        {options.map((o, i) => (
          <div key={i} style={{ display: 'flex', gap: 6 }}>
            <TextField fullWidth size="small" label={`Answer ${i + 1}`} value={o}
              onChange={(e) => setOptions((x) => x.map((y, j) => (j === i ? e.target.value : y)))} />
            {options.length > 2 && (
              <IconButton aria-label="Remove answer" onClick={() => setOptions((x) => x.filter((_, j) => j !== i))}><Close /></IconButton>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <Button startIcon={<Add />} onClick={() => setOptions((x) => [...x, ''])} sx={{ alignSelf: 'flex-start', textTransform: 'none' }}>
            Add an answer
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={create.isLoading}>Start poll</Button>
      </DialogActions>
    </Dialog>
  );
}

export function NominateDialog({ election, onClose }) {
  const nominate = useNominate(election.id);
  const [f, setF] = useState({ name: '', party: '', manifesto: '' });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = () => {
    if (!f.name.trim()) {
      toast.error('Add the name you want on the ballot.');
      return;
    }
    nominate.mutate(
      { name: f.name.trim(), party: f.party.trim() || undefined, manifesto: f.manifesto.trim() || undefined },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Put yourself forward</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <Alert severity="info">
          For {election.title}. Your nomination is reviewed before it reaches the ballot. You must live in this area and be 18 or over.
        </Alert>
        <TextField size="small" label="Name on the ballot" value={f.name} onChange={set('name')} />
        <TextField size="small" label="Group or party (optional)" value={f.party} onChange={set('party')} />
        <TextField size="small" label="What you will do (optional)" multiline minRows={3} value={f.manifesto} onChange={set('manifesto')} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={nominate.isLoading}>Send nomination</Button>
      </DialogActions>
    </Dialog>
  );
}
