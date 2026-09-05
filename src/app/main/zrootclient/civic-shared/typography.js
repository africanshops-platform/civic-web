/**
 * Canonical civic-web type scale — the default font sizing for every screen
 * built in this app going forward.
 *
 * Why this exists: this app's `html` root is set to `font-size: 62.5%`
 * (src/styles/app-base.css), so `1rem = 10px` here, not the usual 16px.
 * Values that "look right" for a normal 16px-rem app (e.g. `0.95rem` body
 * text) collapse to ~9.5px here — real, tiny, illegible text. The SOC
 * screens (buz-security) already solved this correctly by using larger rem
 * multipliers with a `vw`-based fluid clamp() on top, tuned against this
 * app's actual 10px root. This module is that same scale, extracted so
 * every future page reaches for it instead of guessing rem values that
 * assume a 16px root.
 */
export const TYPE = {
  meta: 'clamp(1.2rem, 1.8vw, 1.5rem)',       // small labels, timestamps, badges, captions
  body: 'clamp(1.3rem, 2vw, 1.64rem)',        // standard paragraph/body copy
  bodyLg: 'clamp(1.4rem, 2.2vw, 1.8rem)',     // emphasized body text, card copy
  cardTitle: 'clamp(1.5rem, 2.2vw, 1.8rem)',  // card/tile titles
  btn: 'clamp(1.3rem, 2vw, 1.56rem)',         // button labels
  subH: 'clamp(1.4rem, 2.2vw, 1.8rem)',       // sub-headings (h3/h4-level)
  sectionH: 'clamp(2.2rem, 3.6vw, 3rem)',     // section headings (h2-level)
  hero: 'clamp(2.4rem, 5.5vw, 4.2rem)',       // page hero headline (h1-level)
};

export default TYPE;
