/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

/**
 * Base Tailwind classes for the modal backdrop overlay.
 */
export const backdropBaseClasses = [
  'fixed',
  'inset-0',
  'z-50',
  'flex',
  'items-center',
  'justify-center',
  'bg-black/50',
  'backdrop-blur-sm',
  'p-4',
];

/**
 * Base Tailwind classes for the modal panel container.
 */
export const panelBaseClasses = [
  'relative',
  'bg-white',
  'rounded-2xl',
  'shadow-2xl',
  'w-full',
  'max-h-[90vh]',
  'overflow-y-auto',
  'outline-none',
  'px-6 py-4',
];

/**
 * Tailwind classes for the default-size modal panel.
 */
export const panelDefaultClasses = ['max-w-lg'];

/**
 * Tailwind classes for the large-size modal panel.
 */
export const panelLargeClasses = ['max-w-2xl'];
