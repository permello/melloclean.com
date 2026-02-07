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
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
};
