/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { VariantProps } from 'class-variance-authority';
import type { textareaVariants } from './variants';

/**
 * Props for the Textarea component combining CVA variants and behavioral props.
 */
export interface TextareaProps extends VariantProps<typeof textareaVariants> {
  /** Label text displayed above the textarea */
  label?: string;
  /** Error message displayed below the textarea */
  errorMessage?: string;
  /** Hint text displayed below the textarea when no error */
  hint?: string;
  /** Number of visible text rows */
  rows?: number;
  /** Current textarea value */
  value?: string;
  /** Callback fired when the value changes */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the textarea is disabled */
  isDisabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}
