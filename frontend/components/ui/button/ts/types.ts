import type { VariantProps } from 'class-variance-authority';
import type { buttonVariants, loadingVariants } from './variants';
import type { AriaButtonProps } from 'react-aria';
import type React from 'react';

interface ButtonBehaviorProp {
  isLoading?: boolean;
}

type ButtonProps = React.ComponentPropsWithRef<'button'> &
  VariantProps<typeof buttonVariants> &
  ButtonBehaviorProp &
  AriaButtonProps<'button'>;

type LoadingProps = VariantProps<typeof loadingVariants>;
export type { ButtonProps, LoadingProps };
