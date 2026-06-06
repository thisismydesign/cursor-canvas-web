import { useComputedColorScheme } from '@mantine/core';
import { buildHostTheme, type CanvasHostTheme } from './theme';

/**
 * Returns the host theme tokens for the active color scheme. Shared by the
 * shim components and re-exported as the public `useHostTheme`.
 */
export function useHostTheme(): CanvasHostTheme {
  const scheme = useComputedColorScheme('light');
  return buildHostTheme(scheme === 'dark' ? 'dark' : 'light');
}
