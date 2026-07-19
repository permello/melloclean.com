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
import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from '../services/authServiceInstance';
import { requireTeam } from './requireTeam';

vi.mock('../services/authServiceInstance', () => ({
  authService: { validateSession: vi.fn(), logout: vi.fn() },
}));

function buildReq(cookies: Record<string, string> = {}): Request {
  return { cookies } as unknown as Request;
}

function buildRes(): Response {
  const res = {} as Response;
  res.sendStatus = vi.fn().mockReturnValue(res);
  return res;
}

describe('requireTeam', () => {
  beforeEach(() => {
    vi.mocked(authService.validateSession).mockReset();
  });

  it('responds 401 when there is no separate requireAuth in the route chain and no session cookie', async () => {
    const req = buildReq();
    const res = buildRes();
    const next = vi.fn();

    await requireTeam('ADMIN')(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 403 when the authenticated user is missing the required team', async () => {
    vi.mocked(authService.validateSession).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      emailVerification: true,
      teams: ['CLIENT'],
    });
    const req = buildReq({ session: 'good-token' });
    const res = buildRes();
    const next = vi.fn();

    await requireTeam('ADMIN')(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() when the authenticated user has the required team', async () => {
    vi.mocked(authService.validateSession).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      emailVerification: true,
      teams: ['ADMIN'],
    });
    const req = buildReq({ session: 'good-token' });
    const res = buildRes();
    const next = vi.fn();

    await requireTeam('ADMIN')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.sendStatus).not.toHaveBeenCalled();
  });
});
