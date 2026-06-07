import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Divider } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useElectionDetail, useElectionCollation, useSubmitCollationEntry } from '../hooks/useGovernanceRepo';
import LiveCollationBoard from '../components/LiveCollationBoard';
import CollationEntryForm from '../components/CollationEntryForm';
import { CivicLoadingSkeleton } from '../../civic-shared';

export default function CollationCenterPage() {
  const { electionId } = useParams();
  const { data: elecData, isLoading: elecLoading } = useElectionDetail(electionId);
  const { data: collData, isLoading: collLoading } = useElectionCollation(electionId);
  const { mutate: submitEntry, isLoading: isSaving } = useSubmitCollationEntry();

  const election = useMemo(() => elecData?.data?.election, [elecData]);
  const candidates = useMemo(() => elecData?.data?.candidates || [], [elecData]);
  const collation = useMemo(() => collData?.data, [collData]);

  if (elecLoading) return <div style={{ padding: 32 }}><CivicLoadingSkeleton /></div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(20px, 4vw, 40px)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <Button component={Link} to="/governance/dashboard" startIcon={<ArrowBack />}
            sx={{ color: '#6b7280', textTransform: 'none', fontWeight: 600, mb: 0.5, px: 0 }}>
            Back to Dashboard
          </Button>
          <h1 style={{ margin: 0, fontWeight: 900, color: '#111827', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', lineHeight: 1.2 }}>
            Collation Center
          </h1>
          {election && (
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 4 }}>{election.title}</div>
          )}
        </div>
        <Button
          component={Link} to={`/governance/elections/${electionId}/oversight`}
          variant="outlined" startIcon={<Save />}
          sx={{ borderColor: '#7c3aed', color: '#7c3aed', fontWeight: 700, borderRadius: '12px', textTransform: 'none' }}
        >
          Oversight View
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: 24 }}>
        {/* Live board */}
        <div style={{ borderRadius: 20, padding: 'clamp(18px, 3vw, 28px)', background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 800, color: '#111827', fontSize: '1rem' }}>Live Results Board</h3>
          <LiveCollationBoard collation={collation} isLoading={collLoading} />
        </div>

        {/* Entry form */}
        <div style={{ borderRadius: 20, padding: 'clamp(18px, 3vw, 28px)', background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 800, color: '#111827', fontSize: '1rem' }}>Enter Ward Results</h3>
          <CollationEntryForm
            election={election}
            candidates={candidates}
            onSubmit={submitEntry}
            isSubmitting={isSaving}
          />
        </div>
      </div>

      {/* Ward-level table */}
      {collation?.wardResults?.length > 0 && (
        <div style={{ marginTop: 24, borderRadius: 20, padding: 'clamp(18px, 3vw, 28px)', background: 'white', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 800, color: '#111827', fontSize: '1rem' }}>Ward Collation Status</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  {['Ward', 'LGA', 'Collation Centre', 'Total Votes', 'Status', 'Officer'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {collation.wardResults.map((ward, i) => (
                  <tr key={ward.wardId} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111827' }}>{ward.wardName}</td>
                    <td style={{ padding: '10px 14px', color: '#374151' }}>{ward.lgaName}</td>
                    <td style={{ padding: '10px 14px', color: '#6b7280' }}>{ward.collationCenterName}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{ward.totalVotes.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        display: 'inline-block', borderRadius: 999, padding: '2px 10px',
                        background: ward.status === 'collated' ? '#f0fdf4' : '#fffbeb',
                        color: ward.status === 'collated' ? '#16a34a' : '#d97706',
                        fontWeight: 700, fontSize: '0.76rem',
                      }}>
                        {ward.status === 'collated' ? 'Collated' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#6b7280' }}>{ward.collationOfficer || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
