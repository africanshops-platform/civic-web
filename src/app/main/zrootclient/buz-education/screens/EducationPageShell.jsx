import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconButton } from '@mui/material';
import { Menu, School } from '@mui/icons-material';
import FusePageSimpleWithMargin from '@fuse/core/FusePageSimple/FusePageSimpleWithMargin';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { ACCENT } from '../constants';

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  '& .FusePageSimple-header': { backgroundColor: theme.palette.background.paper, borderBottomWidth: 1, borderStyle: 'solid', borderColor: theme.palette.divider },
}));

const LINKS = [
  { label: 'Find a school', path: '/education/schools', icon: '🏫' },
  { label: 'My children', path: '/education/my-children', icon: '👨‍👩‍👧' },
  { label: 'School notices', path: '/education/announcements', icon: '📣' },
  { label: 'My applications', path: '/education/applications', icon: '📝' },
];

/** The frame every education page shares: a header and the quick links on the left. */
export default function EducationPageShell({ title, subtitle, children }) {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [open, setOpen] = useState(!isMobile);
  const { pathname } = useLocation();
  useEffect(() => setOpen(!isMobile), [isMobile]);

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px', height: 72, width: '100%' }}>
      <IconButton onClick={() => setOpen((v) => !v)}><Menu sx={{ fontSize: 28 }} /></IconButton>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <School sx={{ color: 'white', fontSize: 26 }} />
      </div>
      <div>
        <div style={{ fontWeight: 800, color: '#111827', fontSize: 'clamp(1.9rem, 3.2vw, 2.2rem)', lineHeight: 1.2 }}>{title || 'Education'}</div>
        {subtitle && <div style={{ fontSize: 'clamp(1.52rem, 2.4vw, 1.8rem)', color: '#6b7280', lineHeight: 1 }}>{subtitle}</div>}
      </div>
    </div>
  );

  const left = (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: '1.56rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Education</div>
      {LINKS.map((l) => {
        const on = pathname === l.path;
        return (
          <Link key={l.path} to={l.path} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: on ? '#eef2ff' : '#f9fafb', color: on ? '#4338ca' : '#374151', textDecoration: 'none', fontSize: '1.76rem', fontWeight: 600, border: `1px solid ${on ? '#c7d2fe' : '#e5e7eb'}` }}>
            <span style={{ fontSize: '1.6rem' }}>{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <Root
      header={header}
      content={<div className="flex-auto p-6 sm:p-8" style={{ background: 'linear-gradient(180deg,#f9fafb 0%,#eef2ff 100%)', minHeight: '100%' }}>{children}</div>}
      leftSidebarOpen={open}
      leftSidebarOnClose={() => setOpen(false)}
      leftSidebarContent={left}
      scroll="content"
    />
  );
}
