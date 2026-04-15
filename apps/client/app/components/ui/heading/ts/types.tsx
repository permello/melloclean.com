/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithoutRef, ElementType } from 'react';
import type { headingVariants } from './variants';

/**
 * Props for the polymorphic Heading component.
 * Combines HTML heading attributes with CVA variant props.
 */
type HeadingProps<T extends ElementType> = ComponentPropsWithoutRef<T> &
  VariantProps<typeof headingVariants>;

export type { HeadingProps };
