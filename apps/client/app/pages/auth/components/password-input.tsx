/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import React from 'react';
import { Input } from '~/components/ui/input';
import type { InputProps } from '~/components/ui/input';

/**
 * Props for the PasswordInput component.
 */
interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /** Whether to show password requirements hint */
  showRequirements?: boolean;
}

/**
 * Password input field with optional requirements hint.
 * Wraps the base Input component with password-specific behavior.
 *
 * @param props - Component props
 * @returns Password input with visibility toggle
 */
const PasswordInput: React.FC<PasswordInputProps> = ({
  showRequirements = false,
  hint,
  ...props
}) => {
  return <Input {...props} type='password' hint={showRequirements ? 'Min 8 characters' : hint} />;
};

export { PasswordInput };
