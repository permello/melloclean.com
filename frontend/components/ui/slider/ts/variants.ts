/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { cva } from 'class-variance-authority';
import { thumbBaseClasses, thumbDefaultClasses, thumbErrorClasses } from './constants';

/**
 * CVA variant configuration for the Slider thumb.
 * Defines default and error state styles.
 */
const sliderThumbVariants = cva(thumbBaseClasses, {
  variants: {
    variant: {
      default: thumbDefaultClasses,
      error: thumbErrorClasses,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export { sliderThumbVariants };
