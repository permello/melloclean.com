/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { cva } from 'class-variance-authority';
import { toggleBaseClasses, toggleUnselectedClasses, toggleSelectedClasses } from './constants';

/**
 * CVA variant configuration for individual toggle buttons.
 * Defines selected and unselected state styles.
 */
const toggleButtonVariants = cva(toggleBaseClasses, {
  variants: {
    selected: {
      true: toggleSelectedClasses,
      false: toggleUnselectedClasses,
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export { toggleButtonVariants };
