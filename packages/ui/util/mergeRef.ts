/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type * as React from 'react';

/**
 * Merges multiple React refs into a single ref callback.
 *
 * @param refs - Array of refs to merge (RefObjects or ref callbacks)
 * @returns A ref callback that updates all provided refs
 */
export function mergeRefs<T = any>(
  refs: Array<React.RefObject<T> | React.RefAttributes<T>['ref']>,
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.RefObject<T | null>).current = value;
      }
    });
  };
}
