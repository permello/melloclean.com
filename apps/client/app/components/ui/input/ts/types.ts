/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { VariantProps } from 'class-variance-authority';
import type { inputVariants } from './variants';
import type { AriaTextFieldProps } from 'react-aria';
import type { RefObject } from 'react';

/**
 * Behavioral props specific to the Input component.
 */
interface InputBehaviorProps {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Hint text displayed below the input when no error */
  hint?: string;
  /** Ref to the underlying input element */
  ref?: RefObject<HTMLInputElement | null>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for the Input component combining CVA variants,
 * behavioral props, and React Aria accessibility props.
 */
type InputProps = VariantProps<typeof inputVariants> & InputBehaviorProps & AriaTextFieldProps;

export type { InputProps };
