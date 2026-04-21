/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { VariantProps } from 'class-variance-authority';
import type { selectTriggerVariants } from './variants';

/**
 * Represents a single option in the select dropdown.
 */
export interface SelectOption {
  /** Unique key for the option */
  key: string;
  /** Display label for the option */
  label: string;
}

/**
 * Props for the Select component.
 */
export interface SelectProps extends VariantProps<typeof selectTriggerVariants> {
  /** Label text displayed above the select */
  label?: string;
  /** Error message displayed below the select */
  errorMessage?: string;
  /** Hint text displayed below the select when no error */
  hint?: string;
  /** Placeholder text when no option is selected */
  placeholder?: string;
  /** Available options to choose from */
  options: SelectOption[];
  /** Key of the currently selected option */
  selectedKey: string;
  /** Callback fired when the selection changes */
  onSelectionChange: (key: string) => void;
  /** Additional CSS classes */
  className?: string;
}
