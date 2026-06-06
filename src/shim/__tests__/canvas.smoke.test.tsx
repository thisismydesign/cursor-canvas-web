import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProvider } from '../../test/render';
import DemoCanvas from '../../canvas/demo.canvas';

describe('DemoCanvas smoke render', () => {
  it('renders headings, controls and the callout without crashing', () => {
    renderWithProvider(<DemoCanvas />);

    expect(
      screen.getByRole('heading', { name: 'Traffic Explorer' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Range')).toBeInTheDocument();
    expect(screen.getByText('How this works')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Compare with previous period'),
    ).toBeInTheDocument();
  });
});
