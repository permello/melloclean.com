/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

/**
 * Base Tailwind classes applied to all button variants.
 */
export const baseClasses = [
  'inline-flex',
  'items-center',
  'justify-center',
  'relative',
  'cursor-pointer',
  'disabled:cursor-not-allowed',
  'tracking-wide',
  'transition-[background-color,box-shadow,text-color,transform]',
  'duration-200',
  'rounded-full',
  'outline-none',
  'font-semibold',
  'select-none',
];
/**
 * Tailwind classes for the primary button variant.
 */
export const primaryClasses = [
  'bg-emerald-600',
  'text-white',
  'shadow',
  'data-[hovered=true]:bg-emerald-700',
  'data-[hovered=true]:shadow-md',
  'disabled:bg-emerald-500/50',
  'disabled:shadow',
  'data-[pressed=true]:scale-[0.98]',
  'data-[focus-visible=true]:ring-emerald-500/70',
  'data-[focus-visible=true]:ring-2',
  'data-[focus-visible=true]:ring-offset-2',
];
/**
 * Tailwind classes for the secondary button variant.
 */
export const secondaryClasses = [
  'bg-gray-50',
  'disabled:bg-gray-50',
  'text-gray-950',
  'shadow',
  'border',
  'border-neutral-200/50',
  'data-[hovered=true]:bg-gray-100',
  'data-[pressed=true]:scale-[0.98]',
  'data-[focus-visible=true]:ring-gray-200',
  'data-[focus-visible=true]:ring-2',
  'data-[focus-visible=true]:ring-offset-2',
];
/**
 * Tailwind classes for the destructive button variant.
 */
export const destructiveClasses = [
  'bg-red-500',
  'data-[hovered=true]:bg-red-600',
  'text-white',
  'rounded-full',
  'shadow',
  'hover:shadow-md',
  'disabled:bg-red-500/50',
  'disabled:shadow',
  'data-[pressed=true]:scale-[0.98]',
  'data-[focus-visible=true]:ring-red-500',
  'data-[focus-visible=true]:ring-2',
  'data-[focus-visible=true]:ring-offset-2',
];
/**
 * Tailwind classes for the ghost button variant.
 */
export const ghostClasses = [
  'text-emerald-500',
  'disabled:text-gray-950',
  'border-2',
  'border-slate-200',
  'border-emerald-400',
  'data-[pressed=true]:scale-[0.98]',
  'data-[hovered=true]:text-emerald-400',
  'data-[hovered=true]:border-emerald-300',
  'data-[hovered=true]:bg-emerald-50',
  'data-[focus-visible=true]:ring-emerald-500/30',
  'data-[focus-visible=true]:ring-2',
  'data-[focus-visible=true]:ring-offset-2',
];
/**
 * Tailwind classes for the link button variant.
 */
export const linkClasses = [
  'font-light',
  'text-emerald-500',
  'data-[hovered=true]:text-emerald-600',
  'data-[hovered=true]:underline',
  'disabled:text-emerald-500/50',
  'disabled:no-underline',
  'data-[focus-visible=true]:ring-emerald-500/30',
  'data-[focus-visible=true]:ring-1',
];
/** Tailwind classes for small button size. */
export const smallClasses = ['text-sm', 'py-2', 'px-6'];
/** Tailwind classes for default button size. */
export const defualtClasses = ['text-lg', 'py-3', 'px-8'];
/** Tailwind classes for large button size. */
export const largeClasses = ['text-lg', 'py-4', 'px-12'];
