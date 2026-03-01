/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */
/**
 * Shared TypeScript types for Flask API responses.
 *
 * All API communication flows through RR7 client-side loaders and actions.
 * The browser talks to Flask directly using `fetch()` with `credentials: 'include'`,
 * so cookies are handled automatically. The client has no way to inspect auth
 * state — it relies solely on server responses (e.g., 401) to detect auth problems.
 *
 * The API uses an envelope pattern: success responses wrap data in `{ data: ... }`,
 * while error responses use `{ error: { code, message } }`.
 *
 * @example
 * ```
 * Browser ──RR7 loader/action──▶ fetch() with credentials: 'include' ──▶ Flask API
 * ```
 */

/**
 * User role as returned by the Flask API.
 */
export type Role = 'CLIENT' | 'WORKER' | 'ADMIN';

/**
 * User returned by auth endpoints (login/signup).
 * Excludes `id` and `role` since the frontend does not need them at auth time.
 */
export interface AuthUser {
  /** User email address */
  email: string;
  /** User first name */
  first_name: string;
  /** User last name */
  last_name: string;
  /** Whether the user's email has been verified */
  email_verified: boolean;
}

/**
 * Full user object returned by `GET /api/auth/me`.
 * Includes `id` and `role` for dashboard and RBAC use.
 */
export interface User {
  /** Unique user identifier (UUID) */
  id: string;
  /** User email address */
  email: string;
  /** User first name */
  first_name: string;
  /** User last name */
  last_name: string;
  /** User role */
  role: Role;
  /** Whether the user's email has been verified */
  email_verified: boolean;
}

/**
 * Admin-facing user object returned by admin endpoints.
 * Extends {@link User} with a creation timestamp.
 */
export interface AdminUser extends User {
  /** ISO 8601 timestamp of when the user was created */
  created_at: string;
}

/**
 * Generic success response envelope returned by the Flask API.
 *
 * @typeParam T - The shape of the wrapped data payload
 */
export interface ApiResponse<T> {
  /** The response payload */
  data: T;
}

/**
 * Success response for actions that produce no meaningful data
 * (e.g., logout, verify-email, forgot-password, reset-password).
 */
export interface ApiActionResponse {
  /** Status envelope */
  data: { status: 'completed' };
}

/**
 * Auth response returned by login and signup endpoints.
 * Wraps an {@link AuthUser} in the standard data envelope.
 */
export interface AuthResponse {
  /** The authenticated user wrapped in a data envelope */
  data: { user: AuthUser };
}

/**
 * Paginated response returned by list endpoints (e.g., admin user list).
 *
 * @typeParam T - The shape of each item in the list
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  data: T[];
  /** Pagination metadata */
  meta: {
    /** Current page number */
    page: number;
    /** Number of items per page */
    pageSize: number;
    /** Total number of items across all pages */
    total: number;
  };
}

/**
 * Standard error response returned by the Flask API.
 */
export interface ApiError {
  /** Error details */
  error: {
    /** Machine-readable error code (e.g., `"INVALID_CREDENTIALS"`) */
    code: string;
    /** Human-readable error message */
    message: string;
  };
}

/**
 * Validation error response returned when one or more fields fail validation.
 * The `code` is always `"VALIDATION_FAILED"`.
 */
export interface ApiValidationError {
  /** Validation error details */
  error: {
    /** Always `"VALIDATION_FAILED"` */
    code: 'VALIDATION_FAILED';
    /** Human-readable summary message */
    message: string;
    /** Per-field validation errors */
    details: Array<{
      /** The field that failed validation */
      field: string;
      /** Description of the validation issue */
      issue: string;
    }>;
  };
}
