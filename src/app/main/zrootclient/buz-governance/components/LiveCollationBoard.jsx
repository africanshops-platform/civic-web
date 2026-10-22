import { memo, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';
import { candidateColor } from '../constants';

/**
 * Results: ward-collated votes plus the online tally. Online ballots are secret while voting is open and are counted when the
 * vote closes, so until then the board says how many citizens voted online. Nothing is shown that the service did not report.
 */
function LiveCollationBoard({ collation, isLoading }) {
  const candidates = useMemo(() => collation?.candidates ?? [], [collation]);
  const colors = useMemo(() => candidates.map((c) => candidateColor(c.index)), [candidates]);

  const barOptions = {
    chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout', speed: 600 }, background: 'transparent' },
    plotOptions: { bar: { horizontal: true, borderRadius: 8, distributed: true, dataLabels: { position: 'top' } } },
    legend: { show: false },
    dataLabels: { enabled: true, formatter: (val) => val.toLocaleString(), offsetX: 4, style: { fontSize: '12px', fontWeight: 700, colors: ['#374151'] } },
    xaxis: { categories: candidates.map((c) => c.name), labels: { style: { fontSize: '11px', fontWeight: 600, colors: '#6b7280' } } },
    yaxis: { labels: { style: { fontSize: '12px', fontWeight: 700, colors: '#111827' } } },
    grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
    colors: colors.length ? colors : ['#1d4ed8'],
    tooltip: { y: { formatter: (val) => `${val.toLocaleString()} votes` } },
    theme: { mode: 'light' },
  };

  if (isLoading) {
    return (
      <div data-testid="collation-board-skeleton" style={{ padding: 24 }}>
        {[100, 80, 60, 40].map((w) => (
          <div key={w} style={{ height: 32, width: `${w}%`, background: '#e5e7eb', borderRadius: 8, marginBottom: 12 }} />
        ))}
      </div>
    );
  }

  if (!collation) return null;

  const { summary } = collation;
  const hasVotes = summary.totalVotesCounted > 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <span style={{ fontWeight: 800, color: '#111827', fontSize: '1.05rem' }}>{collation.status === 'CLOSED' && summary.onlineTallyStatus === 'PUBLISHED' ? 'FINAL RESULTS' : 'RESULTS SO FAR'}</span>
        <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>
          {summary.wardsReported} ward{summary.wardsReported === 1 ? '' : 's'} reported · {summary.onlineVoters.toLocaleString()} voted online
        </div>
      </div>

      {summary.onlineTallyStatus === 'AFTER_CLOSE' && (
        <div style={{ padding: '0 0 12px', color: '#6b7280', fontSize: '0.85rem' }}>
          Online votes are secret and are counted when voting closes.
        </div>
      )}
      {summary.onlineTallyStatus === 'PENDING' && (
        <div style={{ padding: '0 0 12px', color: '#b45309', fontSize: '0.85rem' }}>
          Voting has closed. The online count has not been published yet.
        </div>
      )}
      {summary.onlineTallyStatus === 'WITHHELD' && (
        <div style={{ padding: '0 0 12px', color: '#6b7280', fontSize: '0.85rem' }}>
          {summary.onlineValid.toLocaleString()} online vote{summary.onlineValid === 1 ? ' was' : 's were'} cast. To keep every ballot secret, online results are only shown when at least {summary.onlineMinimum ?? 5} people voted online, so they are not included here.
        </div>
      )}
      {summary.onlineTallyStatus === 'PUBLISHED' && (
        <div style={{ padding: '0 0 12px', color: '#6b7280', fontSize: '0.85rem' }}>
          Online count published at close: {summary.onlineValid.toLocaleString()} valid{summary.onlineRejected ? `, ${summary.onlineRejected.toLocaleString()} rejected` : ''}.
          {summary.onlineMismatch && <strong style={{ color: '#dc2626' }}> The number of ballots does not match the number of voters. This has been flagged for review.</strong>}
        </div>
      )}

      {!hasVotes && (
        <div style={{ padding: '20px 0', color: '#6b7280', fontSize: '0.9rem' }}>
          No votes have been counted yet.
        </div>
      )}

      {hasVotes && (
        <div style={{ marginBottom: 20 }}>
          <ReactApexChart type="bar" series={[{ name: 'Votes', data: candidates.map((c) => c.totalVotes) }]} options={barOptions} height={Math.max(180, candidates.length * 52 + 40)} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {candidates.map((c, i) => (
          <motion.div
            key={c.candidateId}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: '#f9fafb', border: '1px solid #e5e7eb' }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors[i], flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
              {c.party && <div style={{ fontSize: '0.76rem', color: '#6b7280' }}>{c.party}</div>}
            </div>
            {hasVotes && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 900, color: colors[i], fontSize: '1rem' }}>{c.percentage}%</div>
                <div style={{ fontSize: '0.76rem', color: '#6b7280' }}>
                  {c.totalVotes.toLocaleString()}{c.onlineVotes != null ? ` (${c.wardVotes.toLocaleString()} ward + ${c.onlineVotes.toLocaleString()} online)` : ''}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default memo(LiveCollationBoard);
