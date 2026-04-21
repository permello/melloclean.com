/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { cva } from 'class-variance-authority';

/**
 * CVA variant configuration for the Heading component.
 * Defines responsive text sizes for each heading level (h1-h6).
 */
const headingVariants = cva(['text-slate-900, font-bold'], {
  variants: {
    level: {
      1: 'text-5xl md:text-6xl lg:text-7xl',
      2: 'text-4xl md:text-5xl',
      3: 'text-3xl',
      4: 'text-2xl',
      5: 'text-xl',
      6: 'text-lg',
    },
  },
  defaultVariants: {
    level: 1,
  },
});

export { headingVariants };
