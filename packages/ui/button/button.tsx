/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import React, { useRef } from 'react';
import { mergeProps, useButton, useFocusRing, useHover } from 'react-aria';
import { cn } from '../util/cn';
import { mergeRefs } from '../util/mergeRef';
import type { ButtonProps, LoadingProps } from './ts/types';
import { buttonVariants, loadingVariants } from './ts/variants';

/**
 * Loading spinner displayed inside the button when loading.
 *
 * @param props - Component props
 * @param props.variant - Button variant to match spinner color
 * @returns Loading spinner element
 */
const LoadingButton: React.FC<LoadingProps> = ({ variant }: LoadingProps) => {
  const loadingClasses = cn(loadingVariants({ variant }));
  return (
    <div className={loadingClasses}>
      <div className='h-4 w-4 animate-spin rounded-full border-2 border-[inherit] border-b-transparent' />
    </div>
  );
};

/**
 * Accessible button component with multiple variants and sizes.
 * Built with React Aria for accessibility and CVA for styling.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="large">Click me</Button>
 * <Button variant="secondary" isLoading>Loading...</Button>
 * ```
 *
 * @param props - Component props
 * @returns Rendered button element
 */
const Button: React.FC<ButtonProps> = (props: ButtonProps) => {
  const { className, variant, size, disabled, isLoading, children, ref, ...rest } = props;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const { buttonProps, isPressed } = useButton({ ...rest, isDisabled: disabled }, buttonRef);
  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({
    ...props,
    isDisabled: disabled,
  });
  const buttonClasses = cn(buttonVariants({ variant, size, className }));
  const mRef = mergeRefs([ref, buttonRef]);

  const ariaProps = mergeProps(buttonProps, focusProps, hoverProps);
  return (
    <button
      ref={mRef}
      className={buttonClasses}
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}
      {...ariaProps}
    >
      {isLoading && <LoadingButton variant={variant} />}

      <span
        className={cn(
          'transition',
          {
            'opacity-0': isLoading,
            'opacity-100': !isLoading,
          },
          'inline-flex items-center justify-between gap-4',
        )}
      >
        {children}
      </span>
    </button>
  );
};

export { Button };
