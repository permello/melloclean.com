/**
 * MIT License
 *
 * Copyright (c) 2025-present Eduardo Turcios.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/**
 * Shared Zod schemas and inferred TypeScript types for auth data, under the
 * current Express + Appwrite architecture.
 *
 * Login and signup happen directly between the browser and the Appwrite SDK —
 * Express never sees those requests. The only Express auth endpoints are
 * `GET /api/auth/me` and `POST /api/auth/logout`.
 *
 * `userSchema` mirrors the Appwrite Database document shape (snake_case),
 * while `loginSchema`/`signupSchema` mirror form/JS state (camelCase). This is
 * deliberate layering, not accidental drift between "the same data": the
 * request schemas describe what a form collects, the response schema
 * describes what the database stores.
 */

import { z } from 'zod';

/**
 * User role as stored in the Appwrite user document.
 */
export const userRoleSchema = z.enum(['CLIENT', 'WORKER', 'ADMIN']);

/**
 * User document shape returned by `GET /api/auth/me`.
 */
export const userSchema = z.object({
  id: z.string(),
  appwrite_id: z.string(),
  email: z.email(),
  first_name: z.string(),
  last_name: z.string(),
  role: userRoleSchema,
  email_verified: z.boolean(),
  created_at: z.string(),
  tos_accepted_at: z.string().nullable(),
  tos_first_booking_at: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;

/**
 * Login request body, matching the current hand-rolled login validation.
 */
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type LoginRequest = z.infer<typeof loginSchema>;

/**
 * Signup request body. Deliberately excludes service-address fields
 * (street/city/state/zip) — address isn't part of the Appwrite user account
 * and is deferred to a separate future issue.
 *
 * `confirmPassword` must be stripped before calling Appwrite's
 * `account.create()`, which has no `confirmPassword` parameter.
 */
export const signupSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupRequest = z.infer<typeof signupSchema>;
