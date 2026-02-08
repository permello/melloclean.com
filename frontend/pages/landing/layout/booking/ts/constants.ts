/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { SelectOption } from '~/components/ui/select';
import type { ToggleOption } from '~/components/ui/toggle-button-group';
import type { WizardStageConfig } from '~/components/ui/wizard';
import { validators, type ValidatorFn } from '~/core/util/validation';

/**
 * localStorage key for persisting booking form data.
 */
export const BOOKING_STORAGE_KEY = 'melloclean_booking';

/**
 * Options for the cleaning type select field.
 */
export const cleaningTypeOptions: SelectOption[] = [
  { key: 'standard', label: 'Standard' },
  { key: 'deep', label: 'Deep' },
  { key: 'move', label: 'Move In/Out' },
  { key: 'office', label: 'Office' },
];

/**
 * Options for the number of bedrooms select field.
 */
export const bedroomOptions: SelectOption[] = [
  { key: '1', label: '1' },
  { key: '2', label: '2' },
  { key: '3', label: '3' },
  { key: '4', label: '4' },
  { key: '5', label: '5' },
  { key: '6+', label: '6+' },
];

/**
 * Options for the number of bathrooms select field.
 */
export const bathroomOptions: SelectOption[] = [
  { key: '1', label: '1' },
  { key: '1.5', label: '1.5' },
  { key: '2', label: '2' },
  { key: '2.5', label: '2.5' },
  { key: '3', label: '3' },
  { key: '3.5', label: '3.5' },
  { key: '4+', label: '4+' },
];

/**
 * Options for the "last professionally cleaned" select field.
 */
export const lastCleanedOptions: SelectOption[] = [
  { key: 'never', label: 'Never' },
  { key: '1month', label: 'Within 1 month' },
  { key: '1-3months', label: '1-3 months' },
  { key: '3-6months', label: '3-6 months' },
  { key: '6-12months', label: '6-12 months' },
  { key: '1+year', label: '1+ year' },
];

/**
 * Options for the priority areas toggle button group.
 */
export const priorityAreaOptions: ToggleOption[] = [
  { key: 'bathrooms', label: 'Bathrooms' },
  { key: 'kitchen', label: 'Kitchen' },
  { key: 'bedrooms', label: 'Bedrooms' },
  { key: 'floors', label: 'Floors' },
  { key: 'sinks', label: 'Sinks' },
  { key: 'dusting', label: 'Dusting' },
  { key: 'windows', label: 'Windows' },
  { key: 'appliances', label: 'Appliances' },
  { key: 'baseboards', label: 'Baseboards' },
  { key: 'garage', label: 'Garage' },
];

/**
 * Options for the special occasion yes/no toggle.
 */
export const occasionOptions: ToggleOption[] = [
  { key: 'yes', label: 'Yes' },
  { key: 'no', label: 'No' },
];

/**
 * Human-readable labels for cleaning type keys.
 */
export const cleaningTypeLabels: Record<string, string> = {
  standard: 'Standard',
  deep: 'Deep',
  move: 'Move In/Out',
  office: 'Office',
};

/**
 * Human-readable labels for last-cleaned keys.
 */
export const lastCleanedLabels: Record<string, string> = {
  never: 'Never',
  '1month': 'Within 1 month',
  '1-3months': '1-3 months',
  '3-6months': '3-6 months',
  '6-12months': '6-12 months',
  '1+year': '1+ year',
};

/**
 * Human-readable labels for priority area keys.
 */
export const priorityAreaLabels: Record<string, string> = {
  bathrooms: 'Bathrooms',
  kitchen: 'Kitchen',
  bedrooms: 'Bedrooms',
  floors: 'Floors',
  sinks: 'Sinks',
  dusting: 'Dusting',
  windows: 'Windows',
  appliances: 'Appliances',
  baseboards: 'Baseboards',
  garage: 'Garage',
};

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
