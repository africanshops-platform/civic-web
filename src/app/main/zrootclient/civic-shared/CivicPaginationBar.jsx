import React from 'react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

/**
 * CivicPaginationBar
 * Props:
 *   pagination   — { page, totalPages, total, limit, hasNext, hasPrev }
 *   onPageChange — (newPage: number) => void
 *   theme        — 'light' (default, civictax green) | 'dark' (SOC dark)
 *   className    — extra wrapper classes
 */
export default function CivicPaginationBar({ pagination, onPageChange, theme = 'light', className = '' }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit, hasNext, hasPrev } = pagination;
  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  const isDark = theme === 'dark';

  const wrapperStyle = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '1.2rem 1.6rem',
    borderRadius:   '1.2rem',
    background:     isDark ? 'rgba(255,255,255,0.04)' : 'rgba(22,163,74,0.06)',
    border:         isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(22,163,74,0.18)',
    marginTop:      '2rem',
    flexWrap:       'wrap',
    gap:            '1rem',
  };

  const infoStyle = {
    fontSize:   '1.4rem',
    color:      isDark ? 'rgba(255,255,255,0.55)' : '#4b5563',
    fontWeight: '500',
  };

  const controlStyle = {
    display:    'flex',
    alignItems: 'center',
    gap:        '0.8rem',
  };

  const pageLabel = {
    fontSize:   '1.5rem',
    fontWeight: '700',
    color:      isDark ? 'rgba(255,255,255,0.85)' : '#111827',
    minWidth:   '6rem',
    textAlign:  'center',
  };

  const btnBase = {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            '0.4rem',
    padding:        '0.6rem 1.4rem',
    borderRadius:   '0.8rem',
    fontSize:       '1.4rem',
    fontWeight:     '600',
    cursor:         'pointer',
    border:         'none',
    transition:     'all 0.15s',
  };

  const btnActive = isDark
    ? { background: 'rgba(255,255,255,0.12)', color: '#fff' }
    : { background: 'rgba(22,163,74,0.12)', color: '#166534' };

  const btnDisabled = isDark
    ? { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }
    : { background: 'rgba(0,0,0,0.04)', color: '#9ca3af', cursor: 'not-allowed' };

  const pages = buildPageNumbers(page, totalPages);

  return (
    <div style={wrapperStyle} className={className}>
      <span style={infoStyle}>
        {total > 0 ? `Showing ${start}–${end} of ${total}` : 'No results'}
      </span>

      <div style={controlStyle}>
        <button
          style={{ ...btnBase, ...(hasPrev ? btnActive : btnDisabled) }}
          onClick={() => hasPrev && onPageChange(page - 1)}
          disabled={!hasPrev}
          aria-label="Previous page"
        >
          <ChevronLeft style={{ fontSize: '1.8rem' }} />
          Prev
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} style={{ ...infoStyle, padding: '0 0.4rem' }}>…</span>
          ) : (
            <button
              key={p}
              style={{
                ...btnBase,
                ...(p === page
                  ? isDark
                    ? { background: '#3b82f6', color: '#fff' }
                    : { background: '#16a34a', color: '#fff' }
                  : hasPrev || hasNext
                    ? btnActive
                    : btnDisabled),
                minWidth: '3.6rem',
                padding: '0.6rem 0.8rem',
              }}
              onClick={() => p !== page && onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          style={{ ...btnBase, ...(hasNext ? btnActive : btnDisabled) }}
          onClick={() => hasNext && onPageChange(page + 1)}
          disabled={!hasNext}
          aria-label="Next page"
        >
          Next
          <ChevronRight style={{ fontSize: '1.8rem' }} />
        </button>
      </div>
    </div>
  );
}

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}
