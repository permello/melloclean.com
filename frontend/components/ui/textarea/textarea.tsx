/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import React, { useId } from 'react';
import { cn } from '~/core/util/cn';
import { textareaVariants } from './ts/variants';
import type { TextareaProps } from './ts/types';

/**
 * Accessible textarea component with label, error, and hint support.
 * Mirrors the Input component pattern with a native textarea element.
 *
 * @example
 * ```tsx
 * <Textarea label="Description" rows={4} />
 * <Textarea label="Notes" errorMessage="Required" />
 * ```
 *
 * @param props - Component props
 * @returns Rendered textarea element with optional label and messages
 */
const Textarea: React.FC<TextareaProps> = ({
  className,
  variant,
  label,
  errorMessage,
  hint,
  rows = 4,
  value,
  onChange,
  placeholder,
  isDisabled,
}: TextareaProps) => {
  const id = useId();

  const textareaClasses = cn(
    textareaVariants({ variant: errorMessage ? 'error' : variant }),
    className,
  );

  return (
    <div className='flex flex-col gap-1.5'>
      {label && (
        <label htmlFor={id} className='text-sm font-medium text-slate-700'>
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={textareaClasses}
        rows={rows}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={isDisabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        aria-errormessage={errorMessage ? `${id}-error` : undefined}
        aria-invalid={!!errorMessage || undefined}
      />
      {hint && !errorMessage && (
        <p id={`${id}-hint`} className='text-sm text-slate-500'>
          {hint}
        </p>
      )}
      {errorMessage && (
        <p id={`${id}-error`} className='text-sm text-red-500'>
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export { Textarea };
