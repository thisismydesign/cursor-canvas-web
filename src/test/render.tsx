import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

/** Render a tree inside the same provider the real app uses. */
export function renderWithProvider(ui: ReactNode) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}
