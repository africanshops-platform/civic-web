import { useState } from 'react';
import { Alert, Button, Chip, CircularProgress, MenuItem, Tab, Tabs, TextField } from '@mui/material';
import HealthcarePageShell from './shared-components/HealthcarePageShell';
import {
  useAddReading, useChildrenIActFor, useMyAdmissions, useMyEncounters, useMyHealthId, useMyImmunisation, useMyInvoices, useMyPlans, useMyPregnancy, useMyPrescriptions, useMyResults,
} from '../hooks/useHealthcareRepo';
import { ANC_WORDS, CONDITION_WORDS, DOSE_WORDS, INVOICE_WORDS, dateOf, naira, nextSteps, readingFrom, readingReady, secondsLeft } from '../careRules';

const card = { background: 'white', borderRadius: 16, padding: 18, border: '1px solid #e5e7eb', marginBottom: 12 };
const small = { color: '#6b7280', fontSize: '1.4rem' };

function Empty({ children }) {
  return <div style={{ color: '#6b7280', fontSize: '1.6rem', padding: '8px 0' }}>{children}</div>
}
function Load({ q }) {
  return q.isLoading ? <CircularProgress size={28} sx={{ color: '#16a34a' }} /> : null
}
function Off({ q }) {
  return q.isError ? <Alert severity="info">This is not available yet.</Alert> : null
}

function Visits({ fd }) {
  const q = useMyEncounters(fd);
  const items = q.data?.items ?? [];
  return (
    <>
      <Load q={q} /><Off q={q} />
      {q.data && items.length === 0 && <Empty>No consultations on record yet.</Empty>}
      {items.map((e) => (
        <div key={e.id} style={card} data-testid={`visit-${e.id}`}>
          <b>{e.facilityName}</b> <span style={small}>{dateOf(e.closedAt)}</span>
          <div>Why you went: {e.content.complaint}</div>
          {e.content.findings && <div>What was found: {e.content.findings}</div>}
          <div>Diagnosis: {e.content.diagnoses.map((d) => d.text).join(', ')}</div>
          {e.content.plan && <div>The plan: {e.content.plan}</div>}
        </div>
      ))}
    </>
  );
}

function Results({ fd }) {
  const q = useMyResults(fd);
  const items = q.data?.items ?? [];
  return (
    <>
      <Load q={q} /><Off q={q} />
      {q.data && items.length === 0 && <Empty>No test results yet. A result appears here once a doctor has reviewed it.</Empty>}
      {items.map((r) => (
        <div key={r.id} style={card}>
          <b>{r.test}</b> <span style={small}>{r.facilityName} · {dateOf(r.reviewedAt)}</span>
          <div>{r.result.summary}</div>
          {r.result.values.map((v, i) => <div key={i} style={small}>{v.name}: {v.value} {v.unit ?? ''} {v.range ? `(normal ${v.range})` : ''}</div>)}
        </div>
      ))}
    </>
  );
}

function Medicines({ fd }) {
  const q = useMyPrescriptions(fd);
  const items = q.data?.items ?? [];
  return (
    <>
      <Load q={q} /><Off q={q} />
      {q.data && items.length === 0 && <Empty>No prescriptions.</Empty>}
      {items.map((p) => (
        <div key={p.id} style={card}>
          <b>{p.facilityName}</b> <span style={small}>{dateOf(p.issuedAt)} · {p.status === 'DISPENSED' ? 'all handed over' : p.status === 'EXPIRED' ? 'expired' : `valid until ${  dateOf(p.expiresAt)}`}</span>
          {p.items.map((it, i) => <div key={i}>{it.dispensed ? '✔ ' : '○ '}{it.drug} {it.dose}, {it.frequency}, {it.days} days</div>)}
        </div>
      ))}
    </>
  );
}

function Bills({ fd }) {
  const q = useMyInvoices(fd);
  const items = q.data?.items ?? [];
  return (
    <>
      <Load q={q} /><Off q={q} />
      {q.data && items.length === 0 && <Empty>No bills.</Empty>}
      {items.map((i) => (
        <div key={i.id} style={card}>
          <b>{i.facilityName}</b> <span style={small}>{dateOf(i.createdAt)}</span> <Chip size="small" label={INVOICE_WORDS[i.status] ?? i.status} />
          {i.lines.map((l) => <div key={l.id} style={small}>{l.description} × {l.qty} = {naira(l.lineKobo)}</div>)}
          <div>Total {naira(i.totalKobo)} · Paid {naira(i.paidKobo)} · <b>Owed {naira(i.owedKobo)}</b></div>
        </div>
      ))}
      {items.length > 0 && <div style={small}>You pay at the facility's counter. Payments are written down by the facility.</div>}
    </>
  );
}

function Stay({ fd }) {
  const q = useMyAdmissions(fd);
  const items = q.data?.items ?? [];
  return (
    <>
      <Load q={q} /><Off q={q} />
      {q.data && items.length === 0 && <Empty>No hospital stays.</Empty>}
      {items.map((a) => (
        <div key={a.id} style={card}>
          <b>{a.facilityName}</b> · {a.wardName}, bed {a.bedLabel} <Chip size="small" label={a.status === 'ADMITTED' ? 'In hospital now' : 'Discharged'} />
          <div style={small}>Since {dateOf(a.admittedAt)}{a.dischargedAt ? ` until ${dateOf(a.dischargedAt)}` : ''} · {a.reason}</div>
          <div>{a.days} day{a.days === 1 ? '' : 's'} so far · <b>{a.status === 'ADMITTED' ? 'running bill ' : 'bill '}{naira(a.runningKobo)}</b></div>
          {a.summary && <div>Summary: {a.summary}</div>}
        </div>
      ))}
    </>
  );
}

function Vaccines({ fd }) {
  const q = useMyImmunisation(fd);
  const d = q.data;
  return (
    <>
      <Load q={q} /><Off q={q} />
      {d && !d.hasCard && <Empty>No immunisation card yet. A clinic starts it with the child's date of birth.</Empty>}
      {d?.hasCard && d.doses.map((x) => (
        <div key={x.vaccine} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '8px 0', borderTop: '1px solid #f1f5f9' }}>
          <span>{x.label} <span style={small}>{x.givenAt ? `given ${dateOf(x.givenAt)}` : `due ${dateOf(x.dueDate)}`}</span></span>
          <Chip size="small" label={DOSE_WORDS[x.state]} color={x.state === 'GIVEN' ? 'success' : x.state === 'OVERDUE' ? 'error' : x.state === 'DUE' ? 'warning' : 'default'} />
        </div>
      ))}
    </>
  );
}

function Pregnancy({ fd }) {
  const q = useMyPregnancy(fd);
  const p = q.data?.pregnancy;
  return (
    <>
      <Load q={q} /><Off q={q} />
      {q.data && !p && <Empty>No pregnancy on record.</Empty>}
      {p && (
        <div style={card}>
          <b>Week {p.gestWeeksNow}</b> · baby due {dateOf(p.edd)}
          {p.schedule.map((s) => (
            <div key={s.contact} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
              <span>Visit {s.contact} · week {s.weeks} <span style={small}>({dateOf(s.dueDate)})</span></span>
              <Chip size="small" label={ANC_WORDS[s.state]} color={s.state === 'DONE' ? 'success' : s.state === 'MISSED' ? 'error' : s.state === 'DUE' ? 'warning' : 'default'} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ReadingForm({ planId, fd }) {
  const add = useAddReading(fd);
  const [f, setF] = useState({ systolic: '', diastolic: '', pulse: '', glucoseMmol: '' });
  const r = readingFrom(f);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
      <TextField size="small" label="Top number" value={f.systolic} onChange={set('systolic')} sx={{ width: 110 }} />
      <TextField size="small" label="Bottom number" value={f.diastolic} onChange={set('diastolic')} sx={{ width: 120 }} />
      <TextField size="small" label="Pulse" value={f.pulse} onChange={set('pulse')} sx={{ width: 90 }} />
      <TextField size="small" label="Blood sugar" value={f.glucoseMmol} onChange={set('glucoseMmol')} sx={{ width: 120 }} />
      <Button size="small" variant="outlined" disabled={!readingReady(r) || add.isLoading} onClick={() => add.mutate({ planId, ...r }, { onSuccess: () => setF({ systolic: '', diastolic: '', pulse: '', glucoseMmol: '' }) })}>Save reading</Button>
    </div>
  );
}

function LongTerm({ fd }) {
  const q = useMyPlans(fd);
  const items = q.data?.items ?? [];
  return (
    <>
      <Load q={q} /><Off q={q} />
      {q.data && items.length === 0 && <Empty>No long-term care plan.</Empty>}
      {items.map((p) => (
        <div key={p.id} style={card} data-testid={`plan-${p.id}`}>
          <b>{CONDITION_WORDS[p.condition] ?? p.condition}</b> <span style={small}>{p.facilityName} · next review {dateOf(p.nextReviewAt)}</span>
          <div style={small}>Enter your readings from home here. Your clinic sees them at your review.</div>
          <ReadingForm planId={p.id} fd={fd} />
        </div>
      ))}
    </>
  );
}

function HealthId({ fd }) {
  const [shown, setShown] = useState(false);
  const q = useMyHealthId(fd, shown);
  const left = q.data ? secondsLeft(q.data.expiresAt) : 0;
  return (
    <div style={card}>
      <p style={{ marginTop: 0 }}>At a clinic, show this code instead of answering questions at the desk. It works for 10 minutes and the clinic sees nothing until you show it.</p>
      <Button variant="contained" onClick={() => { setShown(true); q.refetch(); }} sx={{ background: '#16a34a', textTransform: 'none' }}>Show my health ID</Button>
      {shown && q.data && (
        <div data-testid="hid" style={{ marginTop: 12 }}>
          <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', wordBreak: 'break-all', background: '#f0fdf4', padding: 12, borderRadius: 10 }}>{q.data.code}</div>
          <div style={small}>{left > 0 ? `Valid for ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} more` : 'Expired. Show it again for a new one.'}</div>
          <Button size="small" onClick={() => navigator.clipboard?.writeText(q.data.code).catch(() => undefined)}>Copy</Button>
        </div>
      )}
    </div>
  );
}

const TABS = [['visits', 'Visits', Visits], ['results', 'Results', Results], ['medicines', 'Medicines', Medicines], ['bills', 'Bills', Bills], ['stay', 'Hospital stay', Stay], ['vaccines', 'Vaccines', Vaccines], ['pregnancy', 'Pregnancy', Pregnancy], ['longterm', 'Long-term care', LongTerm], ['id', 'Health ID', HealthId]];

/** Everything about my care, or a child's I look after: what happened, what is owed, and what to do next (civic-70/71). */
export default function MyCarePage() {
  const [fd, setFd] = useState('');
  const [tab, setTab] = useState('visits');
  const { data: children = [] } = useChildrenIActFor();
  const imm = useMyImmunisation(fd || undefined).data;
  const pregnancy = useMyPregnancy(fd || undefined).data?.pregnancy;
  const plans = useMyPlans(fd || undefined).data?.items;
  const steps = nextSteps({ imm, pregnancy, plans });
  const Body = TABS.find(([k]) => k === tab)[2];

  return (
    <HealthcarePageShell title="My care" subtitle="Healthcare · My care">
      <div style={{ padding: 28, maxWidth: 900 }}>
        <h2 style={{ margin: '0 0 6px', fontWeight: 900, fontSize: 'clamp(2.6rem, 4vw, 3.4rem)', color: '#111827' }}>My care</h2>
        {children.length > 0 && (
          <TextField select size="small" label="Acting for" value={fd} onChange={(e) => setFd(e.target.value)} sx={{ mb: 2, minWidth: 260 }}>
            <MenuItem value="">Myself</MenuItem>
            {children.map((c) => <MenuItem key={c.id} value={c.id}>{c.fullName} ({c.age})</MenuItem>)}
          </TextField>
        )}
        {steps.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }} data-testid="next-steps">{steps.map((s) => <div key={s}>{s}</div>)}</Alert>
        )}
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" sx={{ mb: 2 }}>
          {TABS.map(([k, label]) => <Tab key={k} value={k} label={label} />)}
        </Tabs>
        <Body key={`${tab}-${fd}`} fd={fd || undefined} />
      </div>
    </HealthcarePageShell>
  );
}
