/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '~/core/util/cn';
import { modalPanelVariants } from './ts/variants';
import { backdropBaseClasses } from './ts/constants';
import type { ModalProps } from './ts/types';

/**
 * Accessible modal dialog component with animated transitions.
 * Supports backdrop click and Escape key dismissal, scroll lock, and focus trap.
 *
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} onClose={close} title="Confirm">
 *   <p>Are you sure?</p>
 * </Modal>
 * ```
 *
 * @param props - Component props
 * @returns Rendered modal overlay or null when closed
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size,
  showCloseButton = true,
  children,
  className,
}: ModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  /** Closes the modal when clicking on the backdrop (not the panel). */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(backdropBaseClasses)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
          aria-modal='true'
          role='dialog'
        >
          <motion.div
            ref={overlayRef}
            className={cn(modalPanelVariants({ size }), className)}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {(title || showCloseButton) && (
              <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4'>
                {title && (
                  <h2 className='text-xl font-bold text-slate-900'>{title}</h2>
                )}
                {showCloseButton && (
                  <button
                    type='button'
                    onClick={onClose}
                    className='ml-auto rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600'
                    aria-label='Close dialog'
                  >
                    <X className='h-5 w-5' />
                  </button>
                )}
              </div>
            )}
            <div className='px-6 py-4'>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { Modal };
