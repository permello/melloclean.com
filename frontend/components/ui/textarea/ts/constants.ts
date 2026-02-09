/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

/**
 * Base Tailwind classes applied to all textarea variants.
 */
export const baseClasses = [
  'w-full',
  'rounded-lg',
  'border',
  'px-4',
  'py-3',
  'text-base',
  'text-slate-900',
  'placeholder:text-slate-400',
  'outline-none',
  'transition-[border-color,box-shadow]',
  'duration-200',
  'disabled:cursor-not-allowed',
  'disabled:bg-slate-50',
  'disabled:text-slate-500',
  'resize-none',
  'min-h-[100px]',
];

/**
 * Tailwind classes for the default textarea variant.
 */
export const defaultClasses = [
  'border-slate-300',
  'bg-white',
  'focus:border-emerald-500',
  'focus:ring-2',
  'focus:ring-emerald-500/20',
];

/**
 * Tailwind classes for the error textarea variant.
 */
export const errorClasses = [
  'border-red-500',
  'bg-white',
  'focus:border-red-500',
  'focus:ring-2',
  'focus:ring-red-500/20',
];
