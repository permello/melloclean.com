/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx and tailwind-merge for conditional class handling.
 *
 * @param inputs - Class values to merge (strings, objects, arrays)
 * @returns Merged and deduplicated class string
 */
function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export { cn };
