import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Chip, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import EducationPageShell from './EducationPageShell';
import { useMyTertiaryApplications, useUploadTertiaryDocument } from '../hooks/useEducationRepo';
import { fileProblem, STATUS_WORDS } from '../tertiary';

function DocRow({ application, item }) {
  const upload = useUploadTertiaryDocument();
  const input = useRef(null);
  const open = ['PENDING', 'WAITLISTED'].includes(application.status);

  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const problem = fileProblem(file);
    if (problem) return toast.error(problem);
    const reader = new FileReader();
    reader.onload = () => upload.mutate({ applicationId: application.id, kind: item.kind, base64: reader.result });
    reader.readAsDataURL(file);
    return undefined;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 0', borderTop: '1px solid #f1f5f9' }}>
      <span>{item.uploaded ? '✔' : '○'} {item.label}</span>
      {open && (
        <>
          <input ref={input} type="file" accept="image/*,application/pdf" hidden onChange={pick} data-testid={`file-${application.id}-${item.kind}`} />
          <Button size="small" variant="outlined" disabled={upload.isLoading} onClick={() => input.current?.click()}>{item.uploaded ? 'Replace' : 'Upload'}</Button>
        </>
      )}
    </div>
  );
}

/** My university applications, each with its documents checklist (civic-65). */
export default function TertiaryApplicationsPage() {
  const { data, isLoading, isError } = useMyTertiaryApplications();
  const rows = data?.data?.applications ?? [];

  return (
    <EducationPageShell title="University applications" subtitle="Education · Your documents">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><CircularProgress /></div>}
        {isError && <Alert severity="error">We could not load your applications.</Alert>}
        {!isLoading && !isError && rows.length === 0 && <p data-testid="none">No university applications yet. <Link to="/education/schools">Find a university</Link></p>}
        {rows.map((a) => (
          <div key={a.id} data-testid={`tapp-${a.id}`} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 18, padding: 20, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <b>{a.school?.name} · {a.programme.name} ({a.programme.award})</b>
              <Chip size="small" label={STATUS_WORDS[a.status] ?? a.status} />
            </div>
            {a.status === 'APPROVED' && <Alert severity="success" sx={{ my: 1 }}>You have been admitted. The school will give you your matriculation number.</Alert>}
            {a.decisionNote && <p style={{ color: '#374151' }}>From the school: {a.decisionNote}</p>}
            {a.missingDocs.length > 0 && ['PENDING', 'WAITLISTED'].includes(a.status) && (
              <p style={{ color: '#b45309' }} data-testid={`missing-${a.id}`}>The school needs {a.missingDocs.length} more document{a.missingDocs.length === 1 ? '' : 's'} before it can admit you.</p>
            )}
            {a.checklist.map((item) => <DocRow key={item.kind} application={a} item={item} />)}
          </div>
        ))}
      </div>
    </EducationPageShell>
  );
}
