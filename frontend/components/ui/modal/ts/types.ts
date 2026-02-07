/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import type { modalPanelVariants } from './variants';

/**
 * Props for the Modal component.
 */
export interface ModalProps extends VariantProps<typeof modalPanelVariants> {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback fired when the modal should close */
  onClose: () => void;
  /** Optional title displayed in the modal header */
  title?: string;
  /** Whether to show the close (X) button */
  showCloseButton?: boolean;
  /** Modal content */
  children: ReactNode;
  /** Additional CSS classes for the panel */
  className?: string;
}
