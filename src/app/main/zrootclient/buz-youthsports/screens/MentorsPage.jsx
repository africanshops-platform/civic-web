import { styled } from '@mui/material/styles';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import YouthSportsHeader from './shared-components/YouthSportsHeader';
import YouthSportsSidebarLeft from './shared-components/YouthSportsSidebarLeft';
import YouthSportsSidebarRight from './shared-components/YouthSportsSidebarRight';
import { useRequestMentorship } from '../hooks/useYouthSportsRepo';
import { SPORT_ICONS } from '../mock';

const SPORTS = Object.keys(SPORT_ICONS);

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

const INPUT_SX = { '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '1.76rem' } };
const SX_LABEL = { fontSize: '1.76rem' };
const SX_ITEM = { fontSize: '1.76rem' };

function ActiveMentorsPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => { setLeftSidebarOpen(!isMobile); setRightSidebarOpen(!isMobile); }, [isMobile]);

  const [sport, setSport] = useState('');
  const [talentDescription, setTalentDescription] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [errors, setErrors] = useState({});

  const requestMutation = useRequestMentorship();

  const handleLeftToggle = useCallback(() => setLeftSidebarOpen((v) => !v), []);
  const handleRightToggle = useCallback(() => setRightSidebarOpen((v) => !v), []);
  const handleLeftClose = useCallback(() => setLeftSidebarOpen(false), []);
  const handleRightClose = useCallback(() => setRightSidebarOpen(false), []);

  const header = useMemo(() => (
    <YouthSportsHeader leftSidebarToggle={handleLeftToggle} rightSidebarToggle={handleRightToggle}
      title="Request a Mentor" subtitle="Youth & Sports · Learn · Grow · Get Discovered" />
  ), [handleLeftToggle, handleRightToggle]);

  const leftSidebar = useMemo(() => <YouthSportsSidebarLeft />, []);
  const rightSidebar = useMemo(() => <YouthSportsSidebarRight />, []);

  const handleSubmit = useCallback(() => {
    const next = {};
    if (!sport) next.sport = 'Please select a sport or discipline';
    if (!talentDescription.trim()) next.talentDescription = 'Tell us about your talent or goals';
    if (!state.trim()) next.state = 'State is required';
    if (!lga.trim()) next.lga = 'LGA is required';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    requestMutation.mutate({
      sport,
      talentDescription: talentDescription.trim(),
      jurisdiction: { country: 'NG', state: state.trim(), lga: lga.trim() },
    });
  }, [sport, talentDescription, state, lga, requestMutation]);

  const content = useMemo(() => {
    if (requestMutation.isSuccess) {
      return (
        <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#fff7ed 100%)', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', maxWidth: 480 }}>
            <CheckCircle sx={{ fontSize: 88, color: '#ea580c', mb: 2 }} />
            <h2 style={{ margin: '0 0 12px', fontWeight: 900, color: '#111827', fontSize: '3rem' }}>Request Submitted</h2>
            <p style={{ color: '#6b7280', fontSize: '1.9rem', lineHeight: 1.7 }}>
              A civic youth coordinator will review your request and match you with a mentor. There's no live directory to browse yet — matches are made by the coordinator team.
            </p>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#fff7ed 100%)', minHeight: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 640, margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'clamp(2.6rem,4.5vw,3.6rem)', color: '#111827' }}>🤝 Request a Mentor</h1>
          <p style={{ margin: '8px 0 32px', color: '#6b7280', fontSize: '1.8rem' }}>
            There's no mentor directory to browse yet — describe your talent and a coordinator will match you with one.
          </p>

          <div style={{ background: 'white', borderRadius: 22, padding: 'clamp(20px,3vw,32px)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <FormControl size="small" error={Boolean(errors.sport)} fullWidth>
              <InputLabel sx={SX_LABEL}>Sport / Discipline *</InputLabel>
              <Select value={sport} label="Sport / Discipline *" onChange={(e) => { setSport(e.target.value); setErrors((p) => ({ ...p, sport: undefined })); }} sx={{ borderRadius: '12px', fontSize: '1.76rem' }}>
                {SPORTS.map((s) => <MenuItem key={s} value={s} sx={SX_ITEM}><span style={{ marginRight: 8 }}>{SPORT_ICONS[s]}</span>{s}</MenuItem>)}
              </Select>
              {errors.sport && <div style={{ color: '#dc2626', fontSize: '1.4rem', marginTop: 6 }}>{errors.sport}</div>}
            </FormControl>

            <TextField
              label="Tell us about your talent or goals *"
              multiline rows={4}
              value={talentDescription}
              onChange={(e) => { setTalentDescription(e.target.value); setErrors((p) => ({ ...p, talentDescription: undefined })); }}
              error={Boolean(errors.talentDescription)}
              helperText={errors.talentDescription}
              placeholder="E.g. achievements so far, what you're hoping to learn, current skill level..."
              sx={INPUT_SX}
              inputProps={{ maxLength: 500 }}
            />
            <div style={{ textAlign: 'right', fontSize: '1.4rem', color: '#9ca3af', marginTop: -12 }}>{talentDescription.length} / 500</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <TextField
                label="State *"
                value={state}
                onChange={(e) => { setState(e.target.value); setErrors((p) => ({ ...p, state: undefined })); }}
                error={Boolean(errors.state)}
                helperText={errors.state}
                placeholder="e.g. Lagos"
                size="small"
                sx={INPUT_SX}
              />
              <TextField
                label="LGA *"
                value={lga}
                onChange={(e) => { setLga(e.target.value); setErrors((p) => ({ ...p, lga: undefined })); }}
                error={Boolean(errors.lga)}
                helperText={errors.lga}
                placeholder="e.g. Ikeja"
                size="small"
                sx={INPUT_SX}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={requestMutation.isLoading}
              variant="contained"
              sx={{ background: 'linear-gradient(135deg,#ea580c 0%,#dc2626 100%)', color: 'white', fontWeight: 800, borderRadius: '14px', textTransform: 'none', py: 2, fontSize: '2rem', '&:hover': { filter: 'brightness(0.92)' } }}
            >
              {requestMutation.isLoading ? <CircularProgress size={28} sx={{ color: 'white' }} /> : 'Submit Request'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }, [sport, talentDescription, state, lga, errors, requestMutation, handleSubmit]);

  return (
    <Root header={header} content={content}
      leftSidebarOpen={leftSidebarOpen} leftSidebarOnClose={handleLeftClose} leftSidebarContent={leftSidebar}
      rightSidebarOpen={rightSidebarOpen} rightSidebarOnClose={handleRightClose} rightSidebarContent={rightSidebar}
      scroll="content" />
  );
}

const MemoizedActivePage = memo(ActiveMentorsPage);
export default function MentorsPage() { return <MemoizedActivePage />; }
