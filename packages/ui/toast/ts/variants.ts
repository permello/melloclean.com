/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { cva } from 'class-variance-authority';
import {
  baseClasses,
  successClasses,
  errorClasses,
  warningClasses,
  infoClasses,
} from './constants';

/**
 * CVA variant configuration for the Toast component.
 * Defines styles for success, error, warning, and info variants.
 */
const toastVariants = cva(baseClasses, {
  variants: {
    variant: {
      success: successClasses,
      error: errorClasses,
      warning: warningClasses,
      info: infoClasses,
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

export { toastVariants };
