/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

/**
 * Represents a single option in the toggle button group.
 */
export interface ToggleOption {
  /** Unique key for the option */
  key: string;
  /** Display label for the option */
  label: string;
}

/**
 * Props for the ToggleButtonGroup component.
 */
export interface ToggleButtonGroupProps {
  /** Label text displayed above the group */
  label?: string;
  /** Error message displayed below the group */
  errorMessage?: string;
  /** Hint text displayed below the group when no error */
  hint?: string;
  /** Available options to toggle */
  options: ToggleOption[];
  /** Keys of currently selected options */
  selectedKeys: string[];
  /** Callback fired when the selection changes */
  onSelectionChange: (keys: string[]) => void;
  /** Additional CSS classes */
  className?: string;
}
