/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

/**
 * Props for the Slider component.
 */
export interface SliderProps {
  /** Label text displayed above the slider */
  label?: string;
  /** Error message displayed below the slider */
  errorMessage?: string;
  /** Hint text displayed below the slider when no error */
  hint?: string;
  /** Whether to show the current value */
  showValue?: boolean;
  /** Custom formatter for the displayed value */
  formatValue?: (value: number) => string;
  /** Minimum allowed value */
  minValue: number;
  /** Maximum allowed value */
  maxValue: number;
  /** Step increment between values */
  step: number;
  /** Current slider value */
  value: number;
  /** Callback fired when the value changes */
  onChange: (value: number) => void;
  /** Additional CSS classes */
  className?: string;
}
