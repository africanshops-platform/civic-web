import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Slider, CircularProgress, Divider,
} from '@mui/material';
import LgaCascadePicker from '../../civic-shared/LgaCascadePicker';

export default function EditCivicSplitDialog({ open, onClose, summary, onSave, isSaving }) {
  const [homeOrigin, setHomeOrigin] = useState({});
  const [dwelling, setDwelling] = useState({});
  // Slider represents dwelling's share; home-origin is the remainder — same
  // "one number drives both" convention the page's original mock UI used.
  const [dwellingPercent, setDwellingPercent] = useState(summary?.dwelling?.percent ?? 40);

  useEffect(() => {
    if (open) setDwellingPercent(summary?.dwelling?.percent ?? 40);
  }, [open, summary]);

  const canSave = homeOrigin.lgaId && dwelling.lgaId;

  const handleSave = () => {
    onSave({
      homeOriginCountryId: homeOrigin.countryId,
      homeOriginStateId: homeOrigin.stateId,
      homeOriginLgaId: homeOrigin.lgaId,
      dwellingCountryId: dwelling.countryId,
      dwellingStateId: dwelling.stateId,
      dwellingLgaId: dwelling.lgaId,
      taxSplitHomeOrigin: 100 - dwellingPercent,
      taxSplitDwelling: dwellingPercent,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Your Civic Tax Split</DialogTitle>
      <DialogContent className="flex flex-col gap-16 pt-8">
        <LgaCascadePicker label="🏡 Home Origin" initial={summary?.homeOrigin} onChange={setHomeOrigin} />
        <Divider />
        <LgaCascadePicker label="🏙️ Dwelling" initial={summary?.dwelling} onChange={setDwelling} />
        <Divider />
        <div>
          <div className="font-bold text-14 mb-8">
            Split — Dwelling gets {dwellingPercent}%, Home Origin gets {100 - dwellingPercent}%
          </div>
          {/* Bounded to 30-70 on each side (sums to 100 by construction) — a
              platform-wide rule so neither LGA a user contributes to can be
              starved to near-zero or take the whole payment. Enforced again
              server-side (auth-service validateTaxSplit) regardless. */}
          <Slider
            value={dwellingPercent}
            onChange={(_e, v) => setDwellingPercent(v)}
            min={30}
            max={70}
            step={5}
            marks={[{ value: 30, label: '30%' }, { value: 50, label: '50%' }, { value: 70, label: '70%' }]}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v}% Dwelling`}
          />
          <div className="text-12 text-gray-500 mt-4">
            Each LGA must keep between 30% and 70% of your civic tax.
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!canSave || isSaving} onClick={handleSave}>
          {isSaving ? <CircularProgress size={20} color="inherit" /> : 'Save Split'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
