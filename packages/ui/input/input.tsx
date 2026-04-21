/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { Eye, EyeOff } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTextField } from 'react-aria';
import { cn } from '../util/cn';
import { mergeRefs } from '../util/mergeRef';
import type { InputProps } from './ts/types';
import { inputVariants } from './ts/variants';

/**
 * Accessible input component with label, error, and hint support.
 * Built with React Aria for accessibility. Includes password visibility toggle.
 *
 * @example
 * ```tsx
 * <Input label="Email" type="email" />
 * <Input label="Password" type="password" error="Required" />
 * ```
 *
 * @param props - Component props
 * @returns Rendered input element with optional label and messages
 */
const Input: React.FC<InputProps> = (props: InputProps) => {
  const {
    className,
    variant,
    label,
    errorMessage,
    hint,
    type,
    ref,
    id,
    validate,
    validationBehavior,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const {
    labelProps,
    inputProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
  } = useTextField(
    {
      ...rest,
      description: hint,
    },
    inputRef,
  );

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const inputClasses = cn(
    inputVariants({ variant: errorMessage ? 'error' : variant }),
    isPassword && 'pr-12 ',
    className,
  );
  const mRef = mergeRefs([ref, inputRef]);
  return (
    <div className='flex flex-col gap-1.5'>
      {label && (
        <label {...labelProps} className='text-sm font-medium text-slate-700'>
          {label}
        </label>
      )}
      <div className='relative'>
        <input ref={mRef} className={inputClasses} {...inputProps} type={inputType} />
        {isPassword && (
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600'
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
          </button>
        )}
      </div>
      {hint && !isInvalid && (
        <p {...descriptionProps} className='text-sm text-slate-500 select-none'>
          {hint}
        </p>
      )}
      {isInvalid && (
        <p {...errorMessageProps} className='text-sm text-red-500 select-none'>
          {errorMessage as string}
        </p>
      )}
    </div>
  );
};

export { Input };
