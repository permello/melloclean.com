/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { cva } from 'class-variance-authority';
import { baseClasses, defaultClasses, errorClasses } from './constants';

/**
 * CVA variant configuration for the Textarea component.
 * Defines default and error state styles.
 */
const textareaVariants = cva(baseClasses, {
  variants: {
    variant: {
      default: defaultClasses,
      error: errorClasses,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export { textareaVariants };
