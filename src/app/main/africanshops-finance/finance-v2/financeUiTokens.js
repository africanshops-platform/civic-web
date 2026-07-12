export const F = {
  sectionHead: 'clamp(1.76rem, 2.6vw, 2.2rem)',
  body:        'clamp(1.5rem,  2.2vw, 1.9rem)',
  label:       'clamp(1.44rem, 2vw,   1.76rem)',
  small:       'clamp(1.3rem,  1.8vw, 1.56rem)',
  amountLg:    'clamp(2rem,    3.2vw, 2.8rem)',
};

export function fieldSx(tokens) {
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      background: tokens.pageBg,
      '& fieldset': { borderColor: tokens.borderColor },
      '&:hover fieldset': { borderColor: tokens.accentSolid },
      '&.Mui-focused fieldset': { borderColor: tokens.accentSolid },
    },
    '& input': { color: tokens.textPrimary, fontSize: 'clamp(1.5rem, 2.2vw, 1.9rem)' },
    '& .MuiInputLabel-root': { color: tokens.textMuted, fontSize: 'clamp(1.44rem, 2vw, 1.76rem)' },
    '& .MuiInputLabel-root.Mui-focused': { color: tokens.accentSolid },
    '& .MuiFormHelperText-root': { color: tokens.textMuted, fontSize: 'clamp(1.3rem, 1.8vw, 1.56rem)' },
  };
}
