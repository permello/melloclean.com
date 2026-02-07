/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

/**
 * Tailwind classes for the slider track background.
 */
export const trackClasses = [
  'relative',
  'h-2',
  'w-full',
  'rounded-full',
  'bg-slate-200',
];

/**
 * Tailwind classes for the filled portion of the slider track.
 */
export const fillClasses = [
  'absolute',
  'h-full',
  'rounded-full',
  'bg-emerald-500',
];

/**
 * Base Tailwind classes for the slider thumb.
 */
export const thumbBaseClasses = [
  'w-5',
  'h-5',
  'rounded-full',
  'bg-emerald-600',
  'top-1/2',
  'shadow-md',
  'cursor-pointer',
  'outline-none',
  'transition-shadow',
  'duration-200',
];

/**
 * Tailwind classes for the default slider thumb variant.
 */
export const thumbDefaultClasses = ['hover:shadow-lg'];

/**
 * Tailwind classes for the error slider thumb variant.
 */
export const thumbErrorClasses = ['bg-red-500'];
