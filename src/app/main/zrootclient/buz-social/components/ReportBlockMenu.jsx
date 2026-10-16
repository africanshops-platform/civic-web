import { memo, useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Menu, MenuItem, Radio, RadioGroup, TextField,
} from '@mui/material';
import { Flag, MoreVert, Block } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import useCivicWebAuth from 'src/app/hooks/useCivicWebAuth';
import { useBlockAuthor, useReportContent } from '../hooks/useSocialRepo';

const F = { body: 'clamp(1.3rem, 2vw, 1.64rem)', btn: 'clamp(1.3rem, 2vw, 1.56rem)' };

const REASONS = [
  { value: 'SPAM', label: 'Spam or advert' },
  { value: 'HARASSMENT', label: 'Harassment or bullying' },
  { value: 'HATE_OR_ABUSE', label: 'Hate or abuse' },
  { value: 'MISINFORMATION', label: 'False or misleading' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate content' },
  { value: 'OTHER', label: 'Something else' },
];

/** Report this post or comment, or block its author. Signed-out visitors are pointed to sign in. */
function ReportBlockMenu({ contentType, contentId, onBlocked }) {
  const { isAuthenticated } = useCivicWebAuth();
  const [anchor, setAnchor] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reason, setReason] = useState('SPAM');
  const [note, setNote] = useState('');
  const { mutate: report, isLoading: reporting } = useReportContent();
  const { mutate: block, isLoading: blocking } = useBlockAuthor();

  if (!isAuthenticated) {
    return (
      <Button component={Link} to="/sign-in" size="small" sx={{ textTransform: 'none', color: '#9ca3af', fontSize: 'clamp(1.1rem, 1.6vw, 1.3rem)' }}>
        Sign in to report
      </Button>
    );
  }

  return (
    <>
      <IconButton size="small" aria-label="More actions" onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}>
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { setAnchor(null); setReportOpen(true); }}><Flag fontSize="small" sx={{ mr: 1 }} />Report</MenuItem>
        <MenuItem onClick={() => { setAnchor(null); setBlockOpen(true); }}><Block fontSize="small" sx={{ mr: 1 }} />Block this author</MenuItem>
      </Menu>

      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Report this {contentType === 'ISSUE' ? 'issue' : 'comment'}</DialogTitle>
        <DialogContent>
          <RadioGroup value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => <FormControlLabel key={r.value} value={r.value} control={<Radio size="small" />} label={<span style={{ fontSize: F.body }}>{r.label}</span>} />)}
          </RadioGroup>
          <TextField fullWidth multiline minRows={2} size="small" label="Anything we should know? (optional)" value={note} onChange={(e) => setNote(e.target.value)} sx={{ mt: 1.5 }} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReportOpen(false)} sx={{ textTransform: 'none', fontSize: F.btn }}>Cancel</Button>
          <Button variant="contained" disabled={reporting} sx={{ textTransform: 'none', fontSize: F.btn, background: '#be123c' }}
            onClick={() => report({ contentType, contentId, reason, note: note.trim() || undefined }, { onSuccess: () => { setReportOpen(false); setNote(''); } })}>
            Send report
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={blockOpen} onClose={() => setBlockOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Block this author?</DialogTitle>
        <DialogContent><span style={{ fontSize: F.body, color: '#4b5563' }}>You will no longer see their issues or comments. They are not told.</span></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBlockOpen(false)} sx={{ textTransform: 'none', fontSize: F.btn }}>Cancel</Button>
          <Button variant="contained" disabled={blocking} sx={{ textTransform: 'none', fontSize: F.btn, background: '#374151' }}
            onClick={() => block({ contentType, contentId }, { onSuccess: () => { setBlockOpen(false); onBlocked?.(); } })}>
            Block
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default memo(ReportBlockMenu);
