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
import { describe, expect, it } from 'vitest';
import { loginSchema, signupSchema, userSchema } from './authSchema';

describe('browser authentication contracts', () => {
  it('accepts the server identity and rejects missing teams or profile fields', () => {
    const identity = {
      id: 'user-1',
      email: 'user@example.com',
      emailVerified: true,
      teams: ['CLIENT'],
    };
    expect(userSchema.parse(identity)).toEqual(identity);
    expect(userSchema.safeParse({ ...identity, teams: undefined }).success).toBe(false);
    expect(userSchema.safeParse({ ...identity, role: 'CLIENT' }).success).toBe(false);
  });

  it('validates login and signup requests', () => {
    expect(loginSchema.safeParse({ email: 'invalid', password: 'password' }).success).toBe(false);
    expect(
      signupSchema.safeParse({
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        password: 'password',
        confirmPassword: 'different',
      }).success,
    ).toBe(false);
  });

  it('does not parse failed authentication responses as identities', () => {
    expect(userSchema.safeParse({ error: 'Invalid email or password.' }).success).toBe(false);
  });
});
