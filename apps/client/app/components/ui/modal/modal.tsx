/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { useRef } from 'react';
import type { ModalProps } from './ts/types';

import { Overlay, useModalOverlay } from 'react-aria';
import { cn } from '~/core/util/cn';
import { backdropBaseClasses } from './ts/constants';
import { modalPanelVariants } from './ts/variants';
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
  size,
  children,
  state,
  modalStyles,
  ...props
}: ModalProps) => {
  const overlayRef = useRef(null);
  const { modalProps, underlayProps } = useModalOverlay(props, state, overlayRef);

  return (
    <Overlay>
      <div className={cn(backdropBaseClasses)} {...underlayProps} />
      <div className='fixed top-0 left-0 z-101 flex h-screen w-full items-center justify-center'>
        <div
          {...modalProps}
          ref={overlayRef}
          className={cn(modalPanelVariants({ size }), modalStyles)}
        >
          {children}
        </div>
      </div>
    </Overlay>
  );
};

export { Modal };
