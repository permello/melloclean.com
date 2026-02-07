/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

/**
 * Collection of common validation functions for form fields.
 */
export const validators = {
  /** Validates that a field is not empty */
  required: (value: string, fieldName: string): string | null =>
    !value || value.trim() === '' ? `${fieldName} is required` : null,

  /** Validates email format */
  email: (value: string): string | null =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email address' : null,

  /** Validates minimum string length */
  minLength: (value: string, min: number): string | null =>
    value.length < min ? `Must be at least ${min} characters` : null,

  /** Validates 5-digit US zip code format */
  zipCode: (value: string): string | null =>
    !/^\d{5}$/.test(value) ? 'Zip code must be 5 digits' : null,

  /** Validates that password confirmation matches */
  confirmPassword: (value: string, data: Record<string, string>): string | null =>
    value !== data.password ? 'Passwords do not match' : null,

  /** Validates that a numeric string meets a minimum value */
  minNumber: (value: string, min: number, message?: string): string | null =>
    isNaN(Number(value)) || Number(value) < min
      ? message || `Must be at least ${min}`
      : null,
};

export type ValidatorFn<T extends Record<string, string> = Record<string, string>> = (
  value: string,
  data: T,
) => string | null;
/**
 * Record of field names to error messages.
 */
export type ValidationErrors = Record<string, string>;

/**
 * Validates form data against a set of rules.
 *
 * @param data - Form data object with string values
 * @param rules - Validation rules for each field
 * @returns Object containing validation errors by field name
 */
export function validateForm<T extends Record<string, string>>(
  data: T,
  rules: Record<keyof T, ValidatorFn[]>,
): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const field in rules) {
    const value = data[field] ?? '';

    for (const rule of rules[field]) {
      const error = rule(value, data);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  return errors;
}
