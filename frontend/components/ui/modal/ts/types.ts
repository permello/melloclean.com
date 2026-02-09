/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import type { modalPanelVariants } from './variants';
import type { AriaModalOverlayProps, OverlayTriggerProps } from 'react-aria';
import { type OverlayTriggerState } from '@react-stately/overlays';

/**
 * Style props for the Modal component controlling panel size and custom styles.
 */
export interface ModalStyleProps extends VariantProps<typeof modalPanelVariants> {
  /** Additional CSS classes applied to the modal panel */
  modalStyles?: string;
}

/**
 * Props for the Modal component combining React Aria overlay behavior
 * with style and content props.
 *
 * @extends AriaModalOverlayProps - React Aria modal overlay accessibility props
 * @extends ModalStyleProps - Size variant and custom style props
 */
export interface ModalProps extends AriaModalOverlayProps, ModalStyleProps {
  /** Content rendered inside the modal panel */
  children: React.ReactNode;
  /** Overlay trigger state controlling open/close behavior */
  state: OverlayTriggerState;
}
