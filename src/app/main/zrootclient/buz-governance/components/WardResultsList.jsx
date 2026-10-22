import { memo } from 'react';

/** The wards the collation officers have reported, with the votes each candidate received there. Real figures only. */
function WardResultsList({ wards = [], candidates = [] }) {
  const nameOf = (id) => candidates.find((c) => c.id === id || c.candidateId === id)?.name ?? 'Candidate';
  if (!wards.length) return <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>No ward has reported yet.</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {wards.map((w) => (
        <div key={w.id ?? w.wardId} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 14px' }}>
          <div style={{ fontWeight: 800, color: '#111827', fontSize: '0.92rem' }}>{w.wardName}</div>
          <div style={{ fontSize: '0.74rem', color: '#9ca3af', marginBottom: 6 }}>
            Reported {new Date(w.submittedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          {(w.results ?? []).map((r) => (
            <div key={r.candidateId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#374151' }}>
              <span>{nameOf(r.candidateId)}</span>
              <strong>{Number(r.votes).toLocaleString()}</strong>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default memo(WardResultsList);
