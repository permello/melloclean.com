/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { useState, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '~/core/util/cn';
import { selectTriggerVariants } from './ts/variants';
import { listboxClasses, optionBaseClasses } from './ts/constants';
import type { SelectProps } from './ts/types';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Accessible select dropdown component with label, error, and hint support.
 * Uses a custom dropdown UI with keyboard navigation and click-outside dismissal.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Room Type"
 *   options={[{ key: '1', label: 'Bedroom' }]}
 *   selectedKey={value}
 *   onSelectionChange={setValue}
 * />
 * ```
 *
 * @param props - Component props
 * @returns Rendered select element with dropdown
 */
const Select: React.FC<SelectProps> = ({
  label,
  errorMessage,
  hint,
  placeholder = 'Select an option',
  options,
  selectedKey,
  onSelectionChange,
  className,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((o) => o.key === selectedKey);

  /** Closes the dropdown when clicking outside or pressing Escape. */
  const handleBlur = (e: React.FocusEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  /** Handles keyboard navigation within the dropdown. */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    } else if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  /** Selects an option and closes the dropdown. */
  const handleSelect = (key: string) => {
    onSelectionChange(key);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const triggerClasses = cn(
    selectTriggerVariants({ variant: errorMessage ? 'error' : 'default' }),
    className,
  );

  return (
    <div className='flex flex-col gap-1.5' ref={containerRef} onBlur={handleBlur}>
      {label && <label className='text-sm font-medium text-slate-700'>{label}</label>}

      <div className='relative'>
        <button
          ref={triggerRef}
          type='button'
          className={triggerClasses}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-haspopup='listbox'
          aria-expanded={isOpen}
        >
          <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn('h-5 w-5 text-slate-400 transition-transform duration-200', {
              'rotate-180': isOpen,
            })}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              role='listbox'
              className={cn(listboxClasses, 'absolute')}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {options.map((option) => {
                const isSelected = option.key === selectedKey;
                return (
                  <li
                    key={option.key}
                    role='option'
                    aria-selected={isSelected}
                    className={cn(optionBaseClasses, {
                      'bg-emerald-50 text-emerald-700': isSelected,
                      'text-slate-700 hover:bg-slate-50': !isSelected,
                    })}
                    onClick={() => handleSelect(option.key)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelect(option.key);
                      }
                    }}
                    tabIndex={0}
                  >
                    <span className='flex items-center justify-between'>
                      {option.label}
                      {isSelected && <Check className='h-4 w-4 text-emerald-600' />}
                    </span>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {hint && !errorMessage && <p className='text-sm text-slate-500'>{hint}</p>}
      {errorMessage && <p className='text-sm text-red-500'>{errorMessage}</p>}
    </div>
  );
};

export { Select };
