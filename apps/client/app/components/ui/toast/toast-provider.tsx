/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import React, { createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useToastState } from 'react-stately';
import { ToastRegion } from './toast-region';
import type { ToastContent, ToastVariant, ToastActions } from './ts/types';

/**
 * React context for toast actions.
 */
const ToastContext = createContext<ToastActions | null>(null);

/**
 * Provider component that manages toast state and renders the toast region.
 * Wraps the application to enable toast notifications throughout.
 *
 * @param props - Component props
 * @param props.children - Child components
 * @returns Provider with toast region portal
 */
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const state = useToastState<ToastContent>({ maxVisibleToasts: 5 });

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration: number = 5000) => {
      state.add({ message, variant }, { timeout: duration > 0 ? duration : undefined });
    },
    [state],
  );

  const removeToast = useCallback(
    (key: string) => {
      state.close(key);
    },
    [state],
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {typeof document !== 'undefined' &&
        state.visibleToasts.length > 0 &&
        createPortal(<ToastRegion state={state} />, document.body)}
    </ToastContext.Provider>
  );
};

/**
 * Hook to access toast actions from any component.
 *
 * @throws Error if used outside of ToastProvider
 * @returns Toast actions (addToast, removeToast)
 */
const useToast = (): ToastActions => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export { ToastProvider, useToast };
