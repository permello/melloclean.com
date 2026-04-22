/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('is disabled when the disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onPress when clicked', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('does not call onPress when disabled and clicked', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <Button disabled onPress={onPress}>
        Click me
      </Button>,
    );
    await user.click(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
