/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { ElementType } from 'react';
import type { HeadingProps } from './ts/types';
import { cn } from '~/core/util/cn';
import { headingVariants } from './ts/variants';

/**
 * Polymorphic heading component that renders the appropriate HTML heading element.
 * Automatically maps the level prop to the corresponding h1-h6 element.
 *
 * @example
 * ```tsx
 * <Heading level={1}>Main Title</Heading>
 * <Heading level={2}>Section Title</Heading>
 * ```
 *
 * @param props - Component props
 * @param props.level - Heading level (1-6), determines both the HTML element and text size
 * @returns Rendered heading element
 */
const Heading = <T extends ElementType>(props: HeadingProps<T>) => {
  const { level, className, ...rest } = props;
  const Component = `h${level ?? 1}` as ElementType;

  return <Component className={cn(headingVariants({ level, className }))} {...rest} />;
};

export { Heading };
