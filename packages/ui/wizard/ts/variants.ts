/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { cva } from 'class-variance-authority';
import {
  circleBaseClasses,
  circleActiveClasses,
  circleCompletedClasses,
  circlePendingClasses,
  labelBaseClasses,
  labelActiveClasses,
  labelCompletedClasses,
  labelPendingClasses,
  connectorBaseClasses,
  connectorCompletedClasses,
  connectorPendingClasses,
} from './constants';

/**
 * CVA variant configuration for step indicator circles.
 */
export const circleVariants = cva(circleBaseClasses, {
  variants: {
    status: {
      active: circleActiveClasses,
      completed: circleCompletedClasses,
      pending: circlePendingClasses,
    },
  },
  defaultVariants: {
    status: 'pending',
  },
});

/**
 * CVA variant configuration for step indicator labels.
 */
export const labelVariants = cva(labelBaseClasses, {
  variants: {
    status: {
      active: labelActiveClasses,
      completed: labelCompletedClasses,
      pending: labelPendingClasses,
    },
  },
  defaultVariants: {
    status: 'pending',
  },
});

/**
 * CVA variant configuration for step connector lines.
 */
export const connectorVariants = cva(connectorBaseClasses, {
  variants: {
    status: {
      completed: connectorCompletedClasses,
      pending: connectorPendingClasses,
    },
  },
  defaultVariants: {
    status: 'pending',
  },
});
