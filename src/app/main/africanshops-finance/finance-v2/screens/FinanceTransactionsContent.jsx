import { useState, useCallback, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Pagination from '@mui/material/Pagination';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';
import { formatKobo } from '../hooks/useFintechApi';
import { useFinanceTheme } from '../FinanceThemeContext';

const F = {
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  body:        'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:       'clamp(1.44rem, 2vw,   1.76rem)',
  small:       'clamp(1.3rem,  1.8vw, 1.56rem)',
};

// Retail-3 (2026-07-11, revised): flat white card + solid MUI input styling,
// no glass/blur — same fix as the shell/Overview conversion.
function inputSx(tokens, fontSize) {
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      background: tokens.pageBg,
      '& fieldset': { borderColor: tokens.borderColor },
      '&:hover fieldset': { borderColor: tokens.accentSolid },
      '&.Mui-focused fieldset': { borderColor: tokens.accentSolid },
    },
    '& input': { color: tokens.textPrimary, fontSize },
    '& .MuiInputLabel-root': { color: tokens.textMuted, fontSize },
    '& .MuiSelect-select': { color: tokens.textPrimary, fontSize },
    '& .MuiSvgIcon-root': { color: tokens.textMuted },
  };
}

function statusStyle(tokens, status) {
  const map = {
    COMPLETED: { bg: tokens.successBg, text: tokens.success },
    PENDING:   { bg: tokens.warningBg, text: tokens.warning },
    FAILED:    { bg: tokens.dangerBg,  text: tokens.danger },
  };
  return map[status] ?? map.COMPLETED;
}

function TxRow({ tx, tokens }) {
  const isCredit = tx?.direction === 'CREDIT' || tx?.type === 'CREDIT';
  const status = (tx?.status ?? 'COMPLETED').toUpperCase();
  const st = statusStyle(tokens, status);
  const dotColor = isCredit ? tokens.success : tokens.danger;
  const dotBg = isCredit ? tokens.successBg : tokens.dangerBg;

  return (
    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b" style={{ borderColor: tokens.borderColor }}>
      <td className="py-14 px-12">
        <div className="flex items-center gap-12">
          <div className="w-40 h-40 rounded-full flex items-center justify-center shrink-0" style={{ background: dotBg }}>
            <FuseSvgIcon size={18} style={{ color: dotColor }}>
              {isCredit ? 'heroicons-solid:arrow-down' : 'heroicons-solid:arrow-up'}
            </FuseSvgIcon>
          </div>
          <div className="min-w-0">
            <Typography className="truncate max-w-xs" style={{ fontSize: F.body, fontWeight: 600, color: tokens.textPrimary }}>
              {tx?.narration ?? tx?.description ?? 'Transaction'}
            </Typography>
            <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>
              {tx?.reference ?? tx?.id ?? '—'}
            </Typography>
          </div>
        </div>
      </td>
      <td className="py-14 px-12">
        <Typography style={{ fontSize: F.small, color: tokens.textSecondary }}>
          {tx?.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
        </Typography>
      </td>
      <td className="py-14 px-12">
        <Typography style={{ fontSize: F.body, fontWeight: 700, color: dotColor }}>
          {isCredit ? '+' : '-'}{formatKobo(tx?.amount ?? tx?.amountKobo)}
        </Typography>
      </td>
      <td className="py-14 px-12">
        <span className="rounded-full px-12 py-4 font-semibold" style={{ fontSize: F.small, background: st.bg, color: st.text }}>
          {status}
        </span>
      </td>
      <td className="py-14 px-12">
        <Typography style={{ fontSize: F.small, color: tokens.textMuted }}>
          {tx?.accountNumber ?? '—'}
        </Typography>
      </td>
    </motion.tr>
  );
}

export default function FinanceTransactionsContent() {
  const { account } = useOutletContext();
  const { tokens } = useFinanceTheme();
  const card = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow };

  const [filters, setFilters] = useState({
    startDate: '', endDate: '', status: '', accountNumber: account?.accountNumber ?? '', search: '',
  });
  const [page, setPage] = useState(1);
  const limit = 20;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csvLoading, setCsvLoading] = useState(false);

  const fetchTx = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries({ ...filters, page, limit, offset: (page - 1) * limit }).filter(([, v]) => v)
      );
      const q = new URLSearchParams(params).toString();
      const res = await AuthApi().get(`/fintech-accounts/user/transaction/history?${q}`);
      setData(res.data?.payload ?? res.data?.data ?? res.data);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  const transactions = useMemo(() => data?.transactions ?? data ?? [], [data]);
  const total = data?.total ?? transactions.length;
  const pageCount = Math.ceil(total / limit);

  async function downloadCsv() {
    setCsvLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const q = new URLSearchParams({ ...params, format: 'csv' }).toString();
      const res = await AuthApi().get(`/fintech-accounts/user/statement?${q}`);
      const csv = res.data?.csv ?? res.data;
      if (csv) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setCsvLoading(false);
    }
  }

  function updateFilter(key, value) { setFilters(f => ({ ...f, [key]: value })); setPage(1); }
  function clearFilters() { setFilters({ startDate: '', endDate: '', status: '', accountNumber: account?.accountNumber ?? '', search: '' }); setPage(1); }
  const activeFilterCount = Object.values(filters).filter(v => v && v !== account?.accountNumber).length;

  return (
    <div className="w-full px-16 md:px-24 xl:px-32 py-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
        <div className="flex items-center justify-between mb-16">
          <div>
            <Typography style={{ fontSize: F.sectionHead, fontWeight: 700, color: tokens.textPrimary }}>Transaction History</Typography>
            <Typography style={{ fontSize: F.body, color: tokens.textMuted, marginTop: 2 }}>
              {total > 0 ? `${total} transactions found` : 'No transactions'}
            </Typography>
          </div>
          <Button
            onClick={downloadCsv}
            disabled={csvLoading}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:download</FuseSvgIcon>}
            sx={{
              color: tokens.accentSolid, border: `1px solid ${tokens.accentSolid}55`, borderRadius: '10px',
              textTransform: 'none', fontWeight: 600, fontSize: F.small,
              '&:hover': { background: tokens.accentSoft, border: `1px solid ${tokens.accentSolid}` },
            }}
            variant="outlined"
          >
            {csvLoading ? 'Exporting…' : 'Export CSV'}
          </Button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl p-16 mb-16" style={card}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 items-end">
            <TextField label="Search" value={filters.search} onChange={e => updateFilter('search', e.target.value)} size="small"
              InputProps={{ startAdornment: <FuseSvgIcon size={16} style={{ color: tokens.textMuted, marginRight: 4 }}>heroicons-outline:search</FuseSvgIcon> }}
              sx={inputSx(tokens, F.small)} />
            <TextField label="Account Number" value={filters.accountNumber} onChange={e => updateFilter('accountNumber', e.target.value)} size="small" sx={inputSx(tokens, F.small)} />
            <TextField label="Start Date" type="date" value={filters.startDate} onChange={e => updateFilter('startDate', e.target.value)} size="small" InputLabelProps={{ shrink: true }} sx={inputSx(tokens, F.small)} />
            <TextField label="End Date" type="date" value={filters.endDate} onChange={e => updateFilter('endDate', e.target.value)} size="small" InputLabelProps={{ shrink: true }} sx={inputSx(tokens, F.small)} />
            <FormControl size="small" sx={inputSx(tokens, F.small)}>
              <InputLabel>Status</InputLabel>
              <Select value={filters.status} label="Status" onChange={e => updateFilter('status', e.target.value)}
                MenuProps={{ PaperProps: { sx: { background: tokens.cardBg, color: tokens.textPrimary, '& .MuiMenuItem-root': { fontSize: F.small }, '& .MuiMenuItem-root:hover': { background: tokens.accentSoft } } } }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
              </Select>
            </FormControl>
          </div>
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-8 mt-12">
              <Chip
                label={`${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
                size="small"
                onDelete={clearFilters}
                sx={{ background: tokens.accentSoft, color: tokens.accentSolid, fontSize: F.small, '& .MuiChip-deleteIcon': { color: tokens.accentSolid } }}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr style={{ borderBottom: `1px solid ${tokens.borderColor}`, background: tokens.pageBg }}>
                {['Transaction', 'Date', 'Amount', 'Status', 'Account'].map(col => (
                  <th key={col} className="py-14 px-12 text-left">
                    <Typography className="uppercase tracking-wider font-semibold" style={{ fontSize: F.small, color: tokens.textMuted }}>{col}</Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b" style={{ borderColor: tokens.borderColor }}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="py-14 px-12">
                            <Skeleton variant="text" sx={{ width: j === 0 ? '80%' : '60%', height: 22 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : transactions.length === 0
                    ? (
                      <tr>
                        <td colSpan={5} className="py-48 text-center">
                          <FuseSvgIcon size={44} style={{ color: tokens.textMuted, margin: '0 auto 12px', display: 'block' }}>heroicons-outline:clipboard-list</FuseSvgIcon>
                          <Typography style={{ fontSize: F.body, color: tokens.textMuted }}>No transactions found</Typography>
                        </td>
                      </tr>
                    )
                    : transactions.map((tx, i) => <TxRow key={tx?.id ?? i} tx={tx} tokens={tokens} />)
                }
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {pageCount > 1 && (
          <div className="flex justify-center py-16 border-t" style={{ borderColor: tokens.borderColor }}>
            <Pagination
              count={pageCount} page={page} onChange={(_, v) => setPage(v)}
              sx={{ '& .MuiPaginationItem-root': { color: tokens.textSecondary, fontSize: F.small }, '& .MuiPaginationItem-root.Mui-selected': { background: tokens.accentSolid, color: 'white' } }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
