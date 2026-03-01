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
 * User object returned by the API.
 */
export interface User {
  /** Unique user identifier */
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
  email_verified?: boolean;
}

/**
 * Wrapper for auth endpoints that return a user.
 */
export interface AuthResponse {
  /** The authenticated user */
  user: User;
}

/**
 * Standard error shape returned by the Flask API.
 */
export interface ApiError {
  /** Human-readable error message */
  error: string;
  /** Optional machine-readable error code */
  code?: string;
}
