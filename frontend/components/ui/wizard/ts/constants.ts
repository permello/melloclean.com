/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

/**
 * Base Tailwind classes for step indicator circles.
 */
export const circleBaseClasses = [
  'flex',
  'items-center',
  'justify-center',
  'w-8',
  'h-8',
  'rounded-full',
  'text-sm',
  'font-semibold',
  'transition-all',
  'duration-300',
  'select-none',
];

/** Tailwind classes for active step circle. */
export const circleActiveClasses = ['bg-emerald-600', 'text-white', 'cursor-default'];

/** Tailwind classes for completed step circle. */
export const circleCompletedClasses = ['bg-emerald-600', 'text-white', 'cursor-pointer'];

/** Tailwind classes for pending step circle. */
export const circlePendingClasses = ['bg-slate-200', 'text-slate-500', 'cursor-not-allowed'];

/**
 * Base Tailwind classes for step indicator labels.
 */
export const labelBaseClasses = [
  'text-sm',
  'mt-2',
  'transition-colors',
  'duration-300',
  'max-w-20',
  'text-center',
  'line-clamp-2',
  'select-none',
];

/** Tailwind classes for active step label. */
export const labelActiveClasses = ['text-emerald-600', 'font-semibold', 'cursor-default'];

/** Tailwind classes for completed step label. */
export const labelCompletedClasses = ['text-emerald-600', 'cursor-pointer'];

/** Tailwind classes for pending step label. */
export const labelPendingClasses = ['text-slate-400', 'cursor-not-allowed'];

/**
 * Base Tailwind classes for connector lines between steps.
 */
export const connectorBaseClasses = [
  'flex-1',
  'h-0.5',
  'mx-3',
  'transition-colors',
  'duration-300',
];

/** Tailwind classes for completed connector line. */
export const connectorCompletedClasses = ['bg-emerald-600'];

/** Tailwind classes for pending connector line. */
export const connectorPendingClasses = ['bg-slate-200'];
