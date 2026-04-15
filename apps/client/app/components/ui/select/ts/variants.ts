/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { cva } from 'class-variance-authority';
import { triggerBaseClasses, defaultClasses, errorClasses } from './constants';

/**
 * CVA variant configuration for the Select trigger button.
 * Defines default and error state styles.
 */
const selectTriggerVariants = cva(triggerBaseClasses, {
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

export { selectTriggerVariants };
