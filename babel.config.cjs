// Jest-only Babel config (Vite doesn't use this — it has its own esbuild/SWC
// transform via @vitejs/plugin-react). Needed because "type": "module" in
// package.json makes Jest fall back to Babel for JSX/ESM->CJS transform.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    // import.meta.env.VITE_* (Vite's env-var convention) isn't valid syntax once
    // Babel transforms ESM to CommonJS for Jest — rewrites it to process.env.VITE_*.
    'babel-plugin-transform-vite-meta-env',
  ],
};
