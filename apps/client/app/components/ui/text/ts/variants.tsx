/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { cva } from 'class-variance-authority';

/**
 * CVA variant configuration for the Text component.
 * Defines styles for different text element types (p, span, em, strong).
 */
export const TextVariants = cva('', {
  variants: {
    as: {
      p: 'text-slate-600',
      span: 'bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent',
      em: 'font-semibold tracking-wider text-emerald-600 uppercase not-italic',
      strong: 'font-bold text-slate-900',
    },
  },
  defaultVariants: {
    as: 'p',
  },
});
