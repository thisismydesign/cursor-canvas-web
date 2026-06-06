import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProvider } from '../../test/render';
import DemoCanvas from '../../../.cursor/canvases/demo.canvas';

describe('DemoCanvas showcase', () => {
  it('renders the intro, section headings and modules without crashing', () => {
    renderWithProvider(<DemoCanvas />);

    expect(
      screen.getByRole('heading', { name: 'Cursor Canvas on the Web' }),
    ).toBeInTheDocument();
    expect(screen.getByText('How it works')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Typography & text' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Graph layout (computeDAGLayout)' }),
    ).toBeInTheDocument();
    // A form control wired to useCanvasState is present.
    expect(screen.getByLabelText('Verbose logging')).toBeInTheDocument();
  });
});
