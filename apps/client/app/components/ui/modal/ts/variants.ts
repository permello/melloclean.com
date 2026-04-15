/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { cva } from 'class-variance-authority';
import { panelBaseClasses, panelDefaultClasses, panelLargeClasses } from './constants';

/**
 * CVA variant configuration for the Modal panel.
 * Defines size variants for the modal container.
 */
const modalPanelVariants = cva(panelBaseClasses, {
  variants: {
    size: {
      default: panelDefaultClasses,
      large: panelLargeClasses,
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export { modalPanelVariants };
