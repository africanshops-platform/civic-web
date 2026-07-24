/* eslint-disable class-methods-use-this, @typescript-eslint/no-empty-function, lines-between-class-members */
require('@testing-library/jest-dom');

// jsdom doesn't implement IntersectionObserver at all — framer-motion's
// `whileInView`/`useInView` (used across the civic landing pages, e.g.
// CampaignProgressBar's count-up animation is gated on `isInView`) calls it on
// mount and crashes every render without a stub. A no-op stub only stops the
// crash — it never invokes the callback, so `isInView`-gated effects would
// stay permanently false and its animation would never start. Fire the
// callback as "intersecting" on observe() so that gated content renders,
// matching what a real observer reports for an element already in the DOM.
class IntersectionObserverStub {
  constructor(callback) {
    this.callback = callback;
  }

  observe(target) {
    this.callback([{ isIntersecting: true, target }], this);
  }

  unobserve() {}

  disconnect() {}
}

// ResizeObserver has no such gating behavior in this codebase's usage
// (react-leaflet/MUI just need it to exist) — a no-op stub is enough.
class ResizeObserverStub {
  observe() {}

  unobserve() {}

  disconnect() {}
}

global.IntersectionObserver = global.IntersectionObserver || IntersectionObserverStub;
global.ResizeObserver = global.ResizeObserver || ResizeObserverStub;

// jsdom has no layout engine, so it never implements matchMedia — MUI's
// useMediaQuery (breakpoint-aware components) throws without this stub.
window.matchMedia = window.matchMedia || function matchMedia(query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  };
};

// Real value comes from .env/.env.prod at runtime (Vite); tests never hit a real
// API (RepositoryAuthClient is always jest.mock'd), this just keeps
// import.meta.env.VITE_API_BASE_URL_PROD reads from throwing if a future test
// imports a file that references it without mocking that module.
process.env.VITE_API_BASE_URL_PROD = process.env.VITE_API_BASE_URL_PROD || 'http://localhost:8000';
