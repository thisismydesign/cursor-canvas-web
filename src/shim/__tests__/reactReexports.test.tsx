import { describe, expect, it } from 'vitest';
import * as React from 'react';
import { type CSSProperties, type RefObject } from 'cursor/canvas';
import * as canvas from 'cursor/canvas';

// The real SDK re-exports these from React so a canvas needs one import.
// They must be the *same* functions as the consumer's React, not copies,
// or hooks would break with "invalid hook call".
describe('React re-exports from cursor/canvas', () => {
  it.each(['useEffect', 'useMemo', 'useRef', 'useState'] as const)(
    'exports React.%s unchanged',
    (name) => {
      expect(canvas[name]).toBe(React[name]);
    },
  );

  it('exports the CSSProperties and RefObject types', () => {
    const style: CSSProperties = { padding: 4 };
    const ref: RefObject<HTMLDivElement | null> = { current: null };
    expect(style.padding).toBe(4);
    expect(ref.current).toBeNull();
  });
});
