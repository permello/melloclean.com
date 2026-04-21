/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import React, { useRef } from 'react';
import { useToastRegion } from 'react-aria';
import { AnimatePresence } from 'framer-motion';
import { Toast } from './toast';
import type { ToastRegionProps } from './ts/types';

/**
 * Container region for displaying toast notifications.
 * Positioned in the top-right corner with animated transitions.
 *
 * @param props - Component props
 * @param props.state - Toast state containing visible toasts
 * @returns Rendered toast region with all visible toasts
 */
const ToastRegion: React.FC<ToastRegionProps> = ({ state }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { regionProps } = useToastRegion({}, state, ref);

  return (
    <div {...regionProps} ref={ref} className='fixed top-4 right-4 z-50 flex flex-col gap-2'>
      <AnimatePresence mode='popLayout'>
        {state.visibleToasts.map((toast) => (
          <Toast key={toast.key} toast={toast} state={state} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export { ToastRegion };
