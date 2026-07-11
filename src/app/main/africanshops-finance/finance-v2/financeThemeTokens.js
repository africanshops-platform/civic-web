// Retail-3 (2026-07-11, revised): rebuilt around the founder's own reference
// design system ("Meridian" screenshots) — flat, solid surfaces, no blur or
// translucency anywhere. That matters beyond taste: glass-over-light-background
// was the literal cause of the invisible-text bug (white text + rgba(255,255,255,X)
// "glass" cards read as white-on-white once the page background went light).
// Going fully flat/solid fixes that class of bug at the root, not just this instance.
//
// Palette logic: orange is our brand/active-accent (replaces the reference's
// green in nav/CTA/logo contexts); green is KEPT as the positive/semantic color
// (income, gains, completed, under-budget) exactly as the reference used it —
// dropping it entirely would lose a real, useful signal. Warm gold/tan is the
// tertiary neutral accent (categories, secondary badges). Cards are solid white
// (light) / solid dark (dark) with a thin border and a soft shadow, never blur.
export const FINANCE_THEMES = {
  light: {
    pageBg: '#f2efe8',
    headerBg: '#f2efe8',
    headerBorder: '#e6e1d4',
    sidebarBg: '#ffffff',
    sidebarBorder: '#e9e5d9',

    cardBg: '#ffffff',
    cardBorder: '#e6e1d4',
    cardShadow: '0 1px 2px rgba(20,16,8,0.04), 0 4px 16px rgba(20,16,8,0.05)',

    // Hero balance card — solid near-black, warm undertone, orange used only
    // for the accent badge/buttons inside it (mirrors the reference's black
    // hero card, with our brand color doing the accent work green did there).
    heroBg: 'linear-gradient(135deg, #201a14 0%, #120d09 100%)',
    heroText: '#ffffff',
    heroTextMuted: 'rgba(255,255,255,0.55)',

    textPrimary: '#1a1712',
    textSecondary: '#6b6558',
    textMuted: '#9c9686',
    borderColor: '#e6e1d4',

    accentSolid: '#ea580c',
    accentGradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    accentSoft: '#fdf1e4',

    success: '#15803d', successBg: '#e7f2ea',
    warning: '#a16207', warningBg: '#f6ecd7',
    danger: '#b91c1c', dangerBg: '#fbeaea',
    info: '#1d4ed8', infoBg: '#eaf0fd',

    // Tertiary neutral accent (categories, small badges) — the reference's tan/gold swatch
    tertiary: '#a16207', tertiaryBg: '#f6ecd7',
  },
  dark: {
    pageBg: '#15120d',
    headerBg: '#15120d',
    headerBorder: 'rgba(255,255,255,0.08)',
    sidebarBg: '#1b1611',
    sidebarBorder: 'rgba(255,255,255,0.08)',

    cardBg: '#211b15',
    cardBorder: 'rgba(255,255,255,0.08)',
    cardShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.35)',

    // Dark mode inverts the emphasis: the hero is a vivid orange gradient
    // (pops against the dark page) instead of the light theme's near-black —
    // a deliberate light/dark distinction, not just an inverted palette.
    heroBg: 'linear-gradient(135deg, #f97316 0%, #9a3412 100%)',
    heroText: '#ffffff',
    heroTextMuted: 'rgba(255,255,255,0.7)',

    textPrimary: '#f5f0e6',
    textSecondary: 'rgba(245,240,230,0.6)',
    textMuted: 'rgba(245,240,230,0.4)',
    borderColor: 'rgba(255,255,255,0.08)',

    accentSolid: '#fb923c',
    accentGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    accentSoft: 'rgba(249,115,22,0.16)',

    success: '#4ade80', successBg: 'rgba(34,197,94,0.15)',
    warning: '#fbbf24', warningBg: 'rgba(217,160,15,0.18)',
    danger: '#f87171', dangerBg: 'rgba(239,68,68,0.15)',
    info: '#60a5fa', infoBg: 'rgba(59,130,246,0.15)',

    tertiary: '#d4a441', tertiaryBg: 'rgba(212,164,65,0.16)',
  },
};
