/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import React, { useRef } from 'react';
import { useToast } from 'react-aria';
import { motion } from 'motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../util/cn';
import { toastVariants } from './ts/variants';
import type { ToastProps } from './ts/types';

/**
 * Icon mapping for each toast variant.
 */
const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

/**
 * Individual toast notification component with animated enter/exit.
 * Displays an icon, message, and close button based on the variant.
 *
 * @param props - Component props
 * @param props.toast - The queued toast data
 * @param props.state - Toast state for managing the queue
 * @returns Rendered toast notification
 */
const Toast: React.FC<ToastProps> = ({ toast, state }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { toastProps, titleProps, closeButtonProps } = useToast({ toast }, state, ref);

  const { message, variant = 'info' } = toast.content;
  const Icon = icons[variant];

  // Filter out event handlers that conflict with Framer Motion's types
  const { onAnimationStart, onAnimationEnd, onDrag, onDragStart, onDragEnd, ...safeToastProps } =
    toastProps;

  return (
    <motion.div
      ref={ref}
      {...safeToastProps}
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(toastVariants({ variant }))}
    >
      <Icon className='h-5 w-5 flex-shrink-0' />
      <p {...titleProps} className='flex-1 text-sm font-medium'>
        {message}
      </p>
      <button
        {...closeButtonProps}
        aria-label='Close notification'
        onClick={() => state.close(toast.key)}
        className='flex-shrink-0 rounded-full p-1 transition-colors hover:bg-black/10'
      >
        <X className='h-4 w-4' />
      </button>
    </motion.div>
  );
};

export { Toast };
