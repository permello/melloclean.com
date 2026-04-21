/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { useCallback } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../util/cn';
import { toggleButtonVariants } from './ts/variants';
import type { ToggleButtonGroupProps } from './ts/types';

/**
 * Multi-select toggle button group component.
 * Renders a grid of pill-shaped buttons that can be individually toggled on/off.
 * Supports label, error, and hint layout matching other form components.
 *
 * @example
 * ```tsx
 * <ToggleButtonGroup
 *   label="Priority Areas"
 *   options={[{ key: 'kitchen', label: 'Kitchen' }]}
 *   selectedKeys={['kitchen']}
 *   onSelectionChange={setAreas}
 * />
 * ```
 *
 * @param props - Component props
 * @returns Rendered toggle button group
 */
const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
  label,
  errorMessage,
  hint,
  options,
  selectedKeys,
  onSelectionChange,
  className,
}: ToggleButtonGroupProps) => {
  /** Toggles a key in/out of the selected set. */
  const handleToggle = useCallback(
    (key: string) => {
      if (selectedKeys.includes(key)) {
        onSelectionChange(selectedKeys.filter((k) => k !== key));
      } else {
        onSelectionChange([...selectedKeys, key]);
      }
    },
    [selectedKeys, onSelectionChange],
  );

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <label className='text-sm font-medium text-slate-700'>{label}</label>}

      <div className='flex flex-wrap gap-2' role='group' aria-label={label}>
        {options.map((option) => {
          const isSelected = selectedKeys.includes(option.key);
          return (
            <button
              key={option.key}
              type='button'
              role='option'
              aria-selected={isSelected}
              className={cn(toggleButtonVariants({ selected: isSelected }))}
              onClick={() => handleToggle(option.key)}
            >
              {isSelected && <Check className='h-3.5 w-3.5' />}
              {option.label}
            </button>
          );
        })}
      </div>

      {hint && !errorMessage && <p className='text-sm text-slate-500'>{hint}</p>}
      {errorMessage && <p className='text-sm text-red-500'>{errorMessage}</p>}
    </div>
  );
};

export { ToggleButtonGroup };
