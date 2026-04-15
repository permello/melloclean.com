/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { cva } from 'class-variance-authority';
import {
  baseClasses,
  primaryClasses,
  secondaryClasses,
  destructiveClasses,
  ghostClasses,
  linkClasses,
  smallClasses,
  defualtClasses,
  largeClasses,
} from './constants';

/**
 * CVA variant configuration for the Button component.
 * Defines variant and size options with their corresponding styles.
 */
const buttonVariants = cva(baseClasses, {
  variants: {
    variant: {
      primary: primaryClasses,
      secondary: secondaryClasses,
      destructive: destructiveClasses,
      ghost: ghostClasses,
      link: linkClasses,
    },
    size: {
      small: smallClasses,
      default: defualtClasses,
      large: largeClasses,
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'default',
  },
});

/**
 * CVA variant configuration for the loading spinner.
 * Defines border colors that match each button variant.
 */
const loadingVariants = cva(['absolute', 'inline-flex', 'items-center'], {
  variants: {
    variant: {
      primary: ['border-white'],
      secondary: ['border-gray-950'],
      destructive: ['border-white'],
      ghost: ['border-gray-950'],
      link: ['border-indigo-500'],
    },
  },
});

export { buttonVariants, loadingVariants };
