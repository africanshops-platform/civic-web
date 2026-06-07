import { memo, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';
import { FiberManualRecord } from '@mui/icons-material';

function LiveCollationBoard({ collation, isLoading }) {
  const series = useMemo(() => {
    if (!collation?.candidates) return [];
    return collation.candidates.map((c) => c.totalVotes);
  }, [collation]);

  const labels = useMemo(() => {
    if (!collation?.candidates) return [];
    return collation.candidates.map((c) => `${c.name} (${c.party})`);
  }, [collation]);

  const colors = useMemo(() => {
    if (!collation?.candidates) return [];
    return collation.candidates.map((c) => c.partyColor);
  }, [collation]);

  const barOptions = {
    chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout', speed: 600 }, background: 'transparent' },
    plotOptions: { bar: { horizontal: true, borderRadius: 8, dataLabels: { position: 'top' } } },
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toLocaleString(),
      offsetX: 4,
      style: { fontSize: '12px', fontWeight: 700, colors: ['#374151'] },
    },
    xaxis: {
      categories: collation?.candidates?.map((c) => `${c.name} (${c.party})`) || [],
      labels: { formatter: (val) => (val / 1000).toFixed(0) + 'k', style: { fontSize: '11px', fontWeight: 600, colors: '#6b7280' } },
    },
    yaxis: { labels: { style: { fontSize: '12px', fontWeight: 700, colors: '#111827' } } },
    grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
    colors: collation?.candidates?.map((c) => c.partyColor) || ['#1d4ed8'],
    tooltip: {
      y: { formatter: (val) => val.toLocaleString() + ' votes' },
    },
    theme: { mode: 'light' },
  };

  const pieOptions = {
    chart: { type: 'donut', background: 'transparent' },
    labels,
    colors,
    legend: { position: 'bottom', fontWeight: 600, fontSize: '13px' },
    dataLabels: { formatter: (val) => val.toFixed(1) + '%', style: { fontWeight: 700 } },
    plotOptions: { pie: { donut: { size: '60%', labels: { show: true, total: { show: true, label: 'Total Votes', formatter: () => collation?.summary?.validVotes?.toLocaleString() || '0', fontWeight: 900, color: '#111827' } } } } },
    tooltip: { y: { formatter: (val) => val.toLocaleString() + ' votes' } },
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

  const { summary, candidates } = collation;
  const progressPct = summary ? Math.round((summary.wardsCollated / summary.totalWards) * 100) : 0;

  return (
    <div>
      {/* Live badge + collation progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiberManualRecord sx={{ color: '#ef4444', fontSize: 14 }} className="pulse-dot" />
          <span style={{ fontWeight: 800, color: '#111827', fontSize: '1.05rem' }}>LIVE RESULTS</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>
          {summary?.wardsCollated} / {summary?.totalWards} wards collated ({progressPct}%)
        </div>
      </div>

      {/* Candidate vote bar */}
      <div style={{ marginBottom: 28 }}>
        <ReactApexChart
          type="bar"
          series={[{ name: 'Votes', data: candidates?.map((c) => c.totalVotes) || [] }]}
          options={barOptions}
          height={Math.max(180, (candidates?.length || 3) * 52 + 40)}
        />
      </div>

      {/* Donut percentage breakdown */}
      <div>
        <div style={{ fontWeight: 700, color: '#374151', marginBottom: 12, fontSize: '0.9rem' }}>Vote Share</div>
        <ReactApexChart type="donut" series={series} options={pieOptions} height={280} />
      </div>

      {/* Candidate rows */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {candidates?.map((c, i) => (
          <motion.div
            key={c.candidateId}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 12,
              background: i === 0 ? `${c.partyColor}12` : '#f9fafb',
              border: `1px solid ${i === 0 ? c.partyColor + '44' : '#e5e7eb'}`,
            }}
          >
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: c.partyColor, flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.name}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#6b7280' }}>{c.party} · {c.wardsWon} wards won</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 900, color: c.partyColor, fontSize: '1rem' }}>{c.percentage}%</div>
              <div style={{ fontSize: '0.76rem', color: '#6b7280' }}>{c.totalVotes.toLocaleString()}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default memo(LiveCollationBoard);
