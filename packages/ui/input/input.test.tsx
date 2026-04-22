/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  it('renders with a label', () => {
    render(<Input label='Email' />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders without a label when label prop is omitted', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders hint text when hint prop is provided', () => {
    render(<Input label='Email' hint='Enter your work email' />);
    expect(screen.getByText('Enter your work email')).toBeInTheDocument();
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    render(<Input label='Name' />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'John');
    expect(input).toHaveValue('John');
  });

  it('renders a password toggle button for password inputs', () => {
    render(<Input label='Password' type='password' />);
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
  });
});
