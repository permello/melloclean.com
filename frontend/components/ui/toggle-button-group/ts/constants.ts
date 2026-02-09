/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

/**
 * Base Tailwind classes for individual toggle buttons.
 */
export const toggleBaseClasses = [
  'rounded-full',
  'px-4',
  'py-2',
  'text-sm',
  'font-medium',
  'border',
  'transition-all',
  'duration-200',
  'cursor-pointer',
  'outline-none',
  'inline-flex',
  'items-center',
  'gap-1.5',
];

/**
 * Tailwind classes for unselected toggle buttons.
 */
export const toggleUnselectedClasses = [
  'bg-slate-100',
  'text-slate-600',
  'border-slate-200',
  'hover:bg-slate-200',
  'focus:ring-2',
  'focus:ring-emerald-500/20',
];

/**
 * Tailwind classes for selected toggle buttons.
 */
export const toggleSelectedClasses = [
  'bg-emerald-100',
  'text-emerald-700',
  'border-emerald-300',
  'hover:bg-emerald-200',
  'focus:ring-2',
  'focus:ring-emerald-500/20',
];
