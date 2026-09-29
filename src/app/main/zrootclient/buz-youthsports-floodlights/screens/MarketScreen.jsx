import { toast } from 'react-toastify';
import FloodlightsPage from './shared/FloodlightsPage';
import { Avatar, naira, Pill } from './shared/flHelpers';

// No Transfer/Offer/Listing model or route exists on the backend yet — this
// screen is a visual preview of the artifact's design only, clearly marked
// as such, with every action routed to a toast rather than a fabricated
// transaction. Wiring this for real means a new domain touching club-to-club
// money movement (fintech-service), which is its own Stage-1 plan and
// founder sign-off per this repo's CLAUDE.md — not part of this port.
const PREVIEW_LISTED = [
  { id: 'pv-1', name: 'Chidinma Okafor', pos: 'FW', club: 'Ifeanyi Uba FC', rating: 8.4, valuation: 450000 },
  { id: 'pv-2', name: 'Aisha Garba', pos: 'FW', club: 'Idu Football Club Abuja', rating: 8.1, valuation: 410000 },
  { id: 'pv-3', name: 'Success Ibrahim', pos: 'MF', club: 'Comfort Nwachukwu FC', rating: 7.9, valuation: 380000 },
];

export default function MarketScreen() {
  const notReady = () => toast.info('Transfer Market isn’t live yet — this is a design preview.');

  return (
    <FloodlightsPage title="Transfer Market" subtitle="Youth & Sports · Preview">
      <div className="fl2-preview-banner">
        🔒 Preview only — real transfers aren't live yet. No offers here move money or players.
      </div>

      <div className="fl2-hero" style={{ padding: '32px 36px' }}>
        <div className="fl2-row fl2-between">
          <div className="fl2-stack" style={{ gap: 6 }}>
            <span className="fl2-eyebrow">Mid-season window (preview)</span>
            <h1 style={{ fontSize: '2.6rem' }}>Transfer Market</h1>
          </div>
          <div className="fl2-stack" style={{ gap: 2, alignItems: 'flex-end' }}>
            <span className="mono" style={{ fontFamily: "'Anton'", fontSize: '2.6rem', color: 'var(--gold)' }}>—</span>
            <span className="fl2-tiny fl2-muted">window not scheduled yet</span>
          </div>
        </div>
      </div>

      <div className="fl2-split">
        <div className="fl2-stack">
          <div className="fl2-section-title"><h2 style={{ fontSize: '1.7rem' }}>Listed players</h2><span className="fl2-small fl2-muted">Illustrative example</span></div>
          <div className="fl2-grid-2">
            {PREVIEW_LISTED.map((p) => (
              <div key={p.id} className="fl2-card fl2-stack">
                <div className="fl2-row fl2-between">
                  <div className="fl2-row" style={{ gap: 10 }}>
                    <Avatar name={p.name} size={44} />
                    <div className="fl2-stack" style={{ gap: 2 }}><span style={{ fontWeight: 800 }}>{p.name}</span><span className="fl2-tiny fl2-muted">{p.pos} · {p.club}</span></div>
                  </div>
                  <Pill variant="gold" style={{ padding: '2px 7px', fontSize: '1.1rem' }}>{p.rating}</Pill>
                </div>
                <div className="fl2-row fl2-between" style={{ marginTop: 6 }}>
                  <span className="mono" style={{ fontWeight: 800 }}>{naira(p.valuation)}</span>
                  <button type="button" className="fl2-btn fl2-btn-outline fl2-btn-sm" onClick={notReady}>Request transfer</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="fl2-stack">
          <div className="fl2-section-title"><h2 style={{ fontSize: '1.7rem' }}>My offers</h2></div>
          <div className="fl2-card fl2-small fl2-muted">No offers — this feature isn't live yet.</div>
        </div>
      </div>
    </FloodlightsPage>
  );
}
