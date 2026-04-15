/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

/**
 * Base Tailwind classes applied to all toast variants.
 */
export const baseClasses = [
  'flex',
  'items-center',
  'gap-3',
  'rounded-lg',
  'px-4',
  'py-3',
  'shadow-lg',
  'min-w-[300px]',
  'max-w-[400px]',
];

/** Tailwind classes for the success toast variant. */
export const successClasses = ['bg-emerald-50', 'text-emerald-800', 'border', 'border-emerald-200'];

/** Tailwind classes for the error toast variant. */
export const errorClasses = ['bg-red-50', 'text-red-800', 'border', 'border-red-200'];

/** Tailwind classes for the warning toast variant. */
export const warningClasses = ['bg-amber-50', 'text-amber-800', 'border', 'border-amber-200'];

/** Tailwind classes for the info toast variant. */
export const infoClasses = ['bg-blue-50', 'text-blue-800', 'border', 'border-blue-200'];
