/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import type { ValidationErrors } from '~/core/util/validation';

/**
 * Response data from the signup action.
 */
export interface ActionData {
  /** Validation errors by field name */
  errors?: ValidationErrors;
  /** Whether signup was successful */
  success?: boolean;
}

/**
 * Form data structure for the signup wizard.
 */
export type SignupFormData = {
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's email address */
  email: string;
  /** Account password (min 8 characters) */
  password: string;
  /** Password confirmation — must match `password` */
  confirmPassword: string;
  /** Street address for the service location */
  street: string;
  /** City for the service location */
  city: string;
  /** State for the service location */
  state: string;
  /** Zip code for the service location (5-digit format) */
  zipCode: string;
};
