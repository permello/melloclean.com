/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { ElementType } from 'react';
import { cn } from '~/core/util/cn';
import { TextVariants } from './ts/variants';
import type { TextProps } from './ts/types';

/**
 * Polymorphic text component that renders different HTML elements with variant styling.
 * Supports paragraph, span, emphasis, and strong text elements.
 *
 * @example
 * ```tsx
 * <Text>Default paragraph text</Text>
 * <Text as="span">Gradient highlighted text</Text>
 * <Text as="em">Emphasized uppercase text</Text>
 * ```
 *
 * @param props - Component props
 * @param props.as - HTML element to render (p, span, em, strong)
 * @returns Rendered text element
 */
const Text = <T extends ElementType>(props: TextProps<T>) => {
  const { as, size, weight, className, ...rest } = props;

  const Component = `${as ?? 'p'}` as ElementType;

  return <Component className={cn(TextVariants({ as, className }))} {...rest} />;
};

export { Text };
