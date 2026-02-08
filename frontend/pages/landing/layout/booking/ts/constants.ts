/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { WizardStageConfig } from '~/components/ui/wizard';
import { validators, type ValidatorFn } from '~/core/util/validation';

/**
 * localStorage key for persisting booking form data.
 */
export const BOOKING_STORAGE_KEY = 'melloclean_booking';

/**
 * Wizard stage configurations for the booking flow.
 * Each stage defines an id, name, and validation rules.
 */
export const bookingStages: WizardStageConfig[] = [
  {
    id: 'general',
    name: 'General Info',
    validate: {
      cleaningType: [(v: string) => validators.required(v, 'Cleaning type')],
      dirtiness: [(v: string) => validators.required(v, 'Dirtiness scale')],
    } as Record<string, ValidatorFn[]>,
  },
  {
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
    } as Record<string, ValidatorFn[]>,
  },
  {
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
    } as Record<string, ValidatorFn[]>,
  },
  {
    id: 'summary',
    name: 'Summary',
    validate: {} as Record<string, ValidatorFn[]>,
  },
];
