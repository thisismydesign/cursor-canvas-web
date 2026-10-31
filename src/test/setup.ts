import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// jsdom lacks these APIs that Mantine + Recharts rely on.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverMock as typeof ResizeObserver;

// jsdom does no layout, so every element measures 0x0 and Recharts'
// ResponsiveContainer warns on each chart. Report a fixed, non-zero box so
// charts size themselves and render real SVG in tests.
const TEST_BOX = { width: 800, height: 400 };
HTMLElement.prototype.getBoundingClientRect = function () {
  return {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    bottom: TEST_BOX.height,
    right: TEST_BOX.width,
    ...TEST_BOX,
    toJSON: () => ({}),
  } as DOMRect;
};
