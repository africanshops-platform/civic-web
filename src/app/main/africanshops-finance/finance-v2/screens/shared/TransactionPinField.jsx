import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { F } from '../../financeUiTokens';

/** Matches the 6-digit dot-indicator PIN set at WalletSetupWizard account creation. */
export default function TransactionPinField({ value, onChange, tokens, label = 'Enter transaction PIN' }) {
  return (
    <div>
      <Typography style={{ fontSize: F.body, fontWeight: 600, color: tokens.textPrimary, marginBottom: 12, textAlign: 'center' }}>
        {label}
      </Typography>
      <div className="flex gap-10 justify-center mb-16">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-full transition-all duration-200"
            style={{
              background: i < value.length ? tokens.accentSolid : tokens.borderColor,
              transform: i < value.length ? 'scale(1.15)' : 'scale(1)',
            }}
          />
        ))}
      </div>
      <TextField
        type="password"
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        fullWidth
        inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*', style: { textAlign: 'center', fontSize: 24, letterSpacing: 12, color: tokens.textPrimary } }}
        placeholder="••••••"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            background: tokens.pageBg,
            '& fieldset': { borderColor: tokens.borderColor },
            '&:hover fieldset': { borderColor: tokens.accentSolid },
            '&.Mui-focused fieldset': { borderColor: tokens.accentSolid },
          },
        }}
      />
    </div>
  );
}
