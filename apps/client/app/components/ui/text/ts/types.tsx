/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithoutRef, ElementType } from 'react';
import type { TextVariants } from './variants';

/**
 * Props for the polymorphic Text component.
 * Combines HTML text element attributes with CVA variant props.
 */
export type TextProps<T extends ElementType> = ComponentPropsWithoutRef<T> &
  VariantProps<typeof TextVariants>;
