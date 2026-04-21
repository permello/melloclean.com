/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { QueuedToast, ToastState } from 'react-stately';

/**
 * Available toast notification variants.
 */
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Content structure for a toast notification.
 */
interface ToastContent {
  /** The message to display */
  message: string;
  /** Visual variant of the toast */
  variant: ToastVariant;
}

/**
 * Actions available through the toast context.
 */
interface ToastActions {
  /** Add a new toast notification */
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  /** Remove a toast by its key */
  removeToast: (key: string) => void;
}

/**
 * Props for the Toast component.
 */
type ToastProps = {
  /** The queued toast data */
  toast: QueuedToast<ToastContent>;
  /** Toast state from React Stately */
  state: ToastState<ToastContent>;
};

/**
 * Props for the ToastRegion component.
 */
interface ToastRegionProps {
  /** Toast state from React Stately */
  state: ToastState<ToastContent>;
}

export type { ToastVariant, ToastContent, ToastActions, ToastProps, ToastRegionProps };
