/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { useRef, useCallback } from 'react';
import { cn } from '~/core/util/cn';
import { trackClasses, fillClasses } from './ts/constants';
import { sliderThumbVariants } from './ts/variants';
import type { SliderProps } from './ts/types';

/**
 * Accessible slider component for selecting numeric values within a range.
 * Uses a native input[type=range] for accessibility and progressive enhancement.
 *
 * @example
 * ```tsx
 * <Slider
 *   label="Dirtiness"
 *   minValue={1}
 *   maxValue={10}
 *   step={1}
 *   value={5}
 *   onChange={setValue}
 *   showValue
 * />
 * ```
 *
 * @param props - Component props
 * @returns Rendered slider element with track, thumb, and optional labels
 */
const Slider: React.FC<SliderProps> = ({
  label,
  errorMessage,
  hint,
  showValue = true,
  formatValue,
  minValue,
  maxValue,
  step,
  value,
  onChange,
  className,
}: SliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
  const displayValue = formatValue ? formatValue(value) : String(value);

  /** Handles changes from the native range input. */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  const thumbClasses = cn(sliderThumbVariants({ variant: errorMessage ? 'error' : 'default' }));

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || showValue) && (
        <div className='flex items-center justify-between'>
          {label && <label className='text-sm font-medium text-slate-700'>{label}</label>}
          {showValue && (
            <span className='text-sm font-semibold text-emerald-600'>{displayValue}</span>
          )}
        </div>
      )}

      <div className='relative pt-2 pb-2'>
        <div ref={trackRef} className={cn(trackClasses)}>
          <div className={cn(fillClasses)} style={{ width: `${percentage}%` }} />
        </div>

        <input
          type='range'
          min={minValue}
          max={maxValue}
          step={step}
          value={value}
          onChange={handleChange}
          className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
          aria-label={label}
          aria-valuemin={minValue}
          aria-valuemax={maxValue}
          aria-valuenow={value}
          aria-valuetext={displayValue}
        />

        {/* Visual thumb positioned over the track */}
        <div
          className={cn(thumbClasses, 'pointer-events-none absolute -translate-y-1/2')}
          style={{ left: `calc(${percentage}% - 10px)`, top: '50%' }}
        />
      </div>

      <div className='flex justify-between'>
        <span className='text-xs text-slate-400'>{minValue}</span>
        <span className='text-xs text-slate-400'>{maxValue}</span>
      </div>

      {hint && !errorMessage && <p className='text-sm text-slate-500'>{hint}</p>}
      {errorMessage && <p className='text-sm text-red-500'>{errorMessage}</p>}
    </div>
  );
};

export { Slider };
