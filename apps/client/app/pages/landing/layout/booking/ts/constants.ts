/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { WizardStageConfig } from '@permello/ui';
import { validators } from '~/core/util/validation';

/**
 * localStorage key for persisting booking form data.
 */
export const BOOKING_STORAGE_KEY = 'booking';

/**
 * General info stage config.
 * Validates cleaning type and dirtiness level.
 */
export const GENERAL_CONFIG: WizardStageConfig = {
  id: 'general',
  name: 'General Info',
  validate: {
    cleaningType: [(v: string) => validators.required(v, 'Cleaning type')],
    dirtiness: [(v: string) => validators.required(v, 'Dirtiness scale')],
  },
};

/**
 * Home details stage config.
 * Validates bedrooms, bathrooms, square footage, and last cleaned date.
 */
export const HOME_CONFIG: WizardStageConfig = {
  id: 'home',
  name: 'Home Details',
  validate: {
    bedrooms: [(v: string) => validators.required(v, 'Bedrooms')],
    bathrooms: [(v: string) => validators.required(v, 'Bathrooms')],
    squareFootage: [
      (v: string) => validators.required(v, 'Square footage'),
      (v: string) => validators.minNumber(v, 1, 'Square footage must be at least 1'),
    ],
    lastCleaned: [(v: string) => validators.required(v, 'Last professionally cleaned')],
  },
};

/**
 * Visit preferences stage config.
 * Validates preferred date and conditional special occasion description.
 */
export const VISIT_CONFIG: WizardStageConfig = {
  id: 'visit',
  name: 'Your Visit',
  validate: {
    preferredDate: [(v: string) => validators.required(v, 'Preferred date')],
    specialOccasion: [
      (v: string, data: Record<string, string>) =>
        data.hasSpecialOccasion === 'yes' && (!v || v.trim() === '')
          ? 'Please describe the occasion'
          : null,
    ],
  },
};

/**
 * Summary stage config.
 * Display-only stage with no validation rules.
 */
export const SUMMARY_CONFIG: WizardStageConfig = {
  id: 'summary',
  name: 'Summary',
  validate: {},
};
