import { Link, useLocation } from 'react-router-dom';

// Ported verbatim from the artifact's civicChrome(): the orange section
// banner + the white quicknav strip directly beneath it are the real
// navigation for this vertical — Hub/Tournaments/Talent Hunt/Transfer
// Market. Rendered as the `header` prop of FusePageSimpleWithMargin, which
// keeps it outside the scrollable content region, so it's always visible.
const TABS = [
  { label: 'Hub', to: '/youth-v2', match: (p) => p === '/youth-v2' },
  { label: 'Tournaments', to: '/youth-v2/tournaments', match: (p) => p.startsWith('/youth-v2/tournaments') },
  { label: 'Auditions', to: '/youth-v2/auditions', match: (p) => p.startsWith('/youth-v2/auditions') || p === '/youth-v2/my-auditions' },
  { label: 'Talent Hunt', to: '/youth-v2/talents', match: (p) => p.startsWith('/youth-v2/talents') },
  { label: 'Transfer Market', to: '/youth-v2/market', match: (p) => p.startsWith('/youth-v2/market') },
  { label: 'Programmes', to: '/youth-v2/programs', match: (p) => p.startsWith('/youth-v2/programs') },
  { label: 'Find a Mentor', to: '/youth-v2/mentors', match: (p) => p.startsWith('/youth-v2/mentors') },
];

export default function FloodlightsBanner() {
  const { pathname } = useLocation();

  return (
    <div className="fl2-root">
      <div className="fl2-ys-banner">
        <div className="fl2-ys-banner-inner">
          <div className="fl2-row" style={{ gap: 14 }}>
            <div className="fl2-ys-badge">🏆</div>
            <div>
              <div className="fl2-ys-title">Youth Sports</div>
              <div className="fl2-ys-sub">Leagues, clubs &amp; tournaments across every LGA</div>
            </div>
          </div>
        </div>
      </div>
      <div className="fl2-ys-quicknav">
        <div className="fl2-ys-quicknav-inner">
          {TABS.map((t) => (
            <Link key={t.label} to={t.to} className={`fl2-ys-tab ${t.match(pathname) ? 'active' : ''}`}>
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
