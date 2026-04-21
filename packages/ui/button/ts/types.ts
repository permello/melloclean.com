/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { VariantProps } from 'class-variance-authority';
import type { buttonVariants, loadingVariants } from './variants';
import type { AriaButtonProps } from 'react-aria';
import type { ComponentPropsWithRef } from 'react';

/**
 * Behavioral props specific to the Button component.
 */
interface ButtonBehaviorProp {
  /** Whether the button is in a loading state */
  isLoading?: boolean;
}

/**
 * Props for the Button component combining HTML button attributes,
 * CVA variants, and React Aria accessibility props.
 */
type ButtonProps = ComponentPropsWithRef<'button'> &
  VariantProps<typeof buttonVariants> &
  ButtonBehaviorProp &
  AriaButtonProps<'button'>;

/**
 * Props for the loading indicator component.
 */
type LoadingProps = VariantProps<typeof loadingVariants>;
export type { ButtonProps, LoadingProps };
