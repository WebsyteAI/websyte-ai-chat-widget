import { render, type RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render function that includes providers if needed
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };