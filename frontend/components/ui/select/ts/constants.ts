/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

/**
 * Base Tailwind classes applied to the select trigger button.
 */
export const triggerBaseClasses = [
  'w-full',
  'rounded-lg',
  'border',
  'px-4',
  'py-3',
  'text-base',
  'text-left',
  'outline-none',
  'transition-[border-color,box-shadow]',
  'duration-200',
  'disabled:cursor-not-allowed',
  'disabled:bg-slate-50',
  'disabled:text-slate-500',
  'flex',
  'items-center',
  'justify-between',
  'cursor-pointer',
];

/**
 * Tailwind classes for the default select trigger variant.
 */
export const defaultClasses = [
  'border-slate-300',
  'bg-white',
  'focus:border-emerald-500',
  'focus:ring-2',
  'focus:ring-emerald-500/20',
];

/**
 * Tailwind classes for the error select trigger variant.
 */
export const errorClasses = [
  'border-red-500',
  'bg-white',
  'focus:border-red-500',
  'focus:ring-2',
  'focus:ring-red-500/20',
];

/**
 * Tailwind classes for the select dropdown listbox.
 */
export const listboxClasses = [
  'mt-1',
  'w-full',
  'rounded-lg',
  'border',
  'border-slate-200',
  'bg-white',
  'py-1',
  'shadow-lg',
  'outline-none',
  'max-h-60',
  'overflow-y-auto',
  'z-50',
];

/**
 * Tailwind classes for individual select option items.
 */
export const optionBaseClasses = [
  'px-4',
  'py-2.5',
  'text-base',
  'cursor-pointer',
  'outline-none',
  'transition-colors',
  'duration-100',
];
