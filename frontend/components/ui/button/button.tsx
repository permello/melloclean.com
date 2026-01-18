import React, { useRef, type ForwardedRef } from 'react';
import { cn } from '~/core/util/cn';
import { buttonVariants, loadingVariants } from './ts/variants';
import type { ButtonProps, LoadingProps } from './ts/types';
import { mergeProps, useButton, useFocusRing, useHover } from 'react-aria';
import { mergeRefs } from '~/core/util/mergeRef';

const LoadingButton: React.FC<LoadingProps> = ({ variant }: LoadingProps) => {
  const loadingClasses = cn(loadingVariants({ variant }));
  return (
    <div className={loadingClasses}>
      <div className='h-4 w-4 animate-spin rounded-full border-2 border-[inherit] border-b-transparent' />
    </div>
  );
};

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
