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
import {
  loginSchema,
  signupSchema,
  userSchema,
  type LoginRequest,
  type SignupRequest,
  type User,
} from '@permello/shared/types/authSchema';

async function request(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`/api/auth/${path}`, { ...init, credentials: 'include' });
}

async function identityRequest(path: string, body?: unknown): Promise<User> {
  const response = await request(
    path,
    body === undefined
      ? undefined
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
  );
  if (!response.ok) throw new Error(`Authentication request failed (${response.status}).`);
  return userSchema.parse(await response.json());
}

export const authApi = {
  signup: (input: SignupRequest) => identityRequest('signup', signupSchema.parse(input)),
  login: (input: LoginRequest) => identityRequest('login', loginSchema.parse(input)),
  me: () => identityRequest('me'),
  async logout(): Promise<void> {
    const response = await request('logout', { method: 'POST' });
    if (!response.ok) throw new Error(`Logout failed (${response.status}).`);
  },
};
