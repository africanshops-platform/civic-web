import { memo, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';
import { candidateColor } from '../constants';

/**
 * Results so far from ward collation. Online ballots are secret and are not tallied here, so the board also says how many
 * citizens voted online. Nothing is shown that the governance service did not report.
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
        <span style={{ fontWeight: 800, color: '#111827', fontSize: '1.05rem' }}>RESULTS SO FAR</span>
        <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>
          {summary.wardsReported} ward{summary.wardsReported === 1 ? '' : 's'} reported · {summary.onlineVoters.toLocaleString()} voted online
        </div>
      </div>

      {!hasVotes && (
        <div style={{ padding: '20px 0', color: '#6b7280', fontSize: '0.9rem' }}>
          No ward results have been reported yet. Votes cast online are secret and are not counted on this board.
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
                <div style={{ fontSize: '0.76rem', color: '#6b7280' }}>{c.totalVotes.toLocaleString()}</div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default memo(LiveCollationBoard);
