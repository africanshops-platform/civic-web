import { useCallback, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useAcceptForumTerms, useForumTerms } from '../hooks/useSocialRepo';

const F = {
  body: 'clamp(1.3rem, 2vw, 1.64rem)',
  btn:  'clamp(1.3rem, 2vw, 1.56rem)',
};

const RULES = [
  'Be respectful. No harassment, hate or abuse of any person or group.',
  'Stay on topic: report real issues in your community and discuss them honestly.',
  'No spam, adverts or repeated posts. No false or misleading claims.',
  'Do not share other people\'s private details (phone numbers, addresses, ID numbers, photos of children).',
  'This forum is run by the community. It is not a government service and nothing here is an official statement.',
  'Moderators (your LGA coordinators and the platform team) can remove content that breaks these rules. You can report any post or comment, and block an author you do not want to see.',
];

/** Rules shown once before a citizen's first post, and again whenever the rules change. */
export function ForumRulesDialog({ open, loading, onCancel, onAccept }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 900 }}>Community forum rules</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: F.body, mb: 1.5, color: '#4b5563' }}>Please read and accept these before you post.</Typography>
        <ol style={{ margin: 0, paddingLeft: 22, listStyle: 'decimal', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {RULES.map((r) => <li key={r} style={{ fontSize: F.body, lineHeight: 1.6, color: '#374151' }}>{r}</li>)}
        </ol>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel} sx={{ textTransform: 'none', fontSize: F.btn }}>Not now</Button>
        <Button variant="contained" disabled={loading} onClick={onAccept} sx={{ textTransform: 'none', fontWeight: 700, fontSize: F.btn, background: '#059669' }}>
          I accept
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * guard(fn) runs fn straight away when the citizen has accepted the current rules, otherwise shows the rules and runs fn
 * once they accept. Render `dialog` somewhere in the page.
 */
export function useForumRulesGate() {
  const { data: terms } = useForumTerms();
  const accept = useAcceptForumTerms();
  const [pending, setPending] = useState(null);

  const guard = useCallback((fn) => {
    // Unknown (still loading or signed out): let the request go; the server enforces the rules either way.
    if (!terms || terms.accepted) fn();
    else setPending(() => fn);
  }, [terms]);

  const dialog = (
    <ForumRulesDialog
      open={Boolean(pending)}
      loading={accept.isLoading}
      onCancel={() => setPending(null)}
      onAccept={() => accept.mutate(terms.currentVersion, {
        onSuccess: () => { const fn = pending; setPending(null); fn?.(); },
      })}
    />
  );
  return { guard, dialog };
}
