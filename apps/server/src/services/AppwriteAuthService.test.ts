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
import type { Account, Teams } from 'node-appwrite';
import { describe, expect, it, vi } from 'vitest';
import type { SessionClientFactory } from '../config/appwrite';
import { AppwriteAuthService } from './AppwriteAuthService';

function buildFakeFactory() {
  const account = {
    get: vi.fn(),
    deleteSession: vi.fn(),
  };
  const teams = {
    list: vi.fn(),
  };
  const factory: SessionClientFactory = () =>
    ({ account, teams }) as unknown as { account: Account; teams: Teams };

  return { factory, account, teams };
}

describe('AppwriteAuthService', () => {
  describe('validateSession', () => {
    it('resolves identity and teams from account.get() and teams.list()', async () => {
      const { factory, account, teams } = buildFakeFactory();
      account.get.mockResolvedValue({
        $id: 'user-1',
        email: 'user@example.com',
        emailVerification: true,
      });
      teams.list.mockResolvedValue({
        teams: [{ name: 'CLIENT' }, { name: 'WORKER' }],
      });

      const service = new AppwriteAuthService(factory);
      const result = await service.validateSession('token-123');

      expect(result).toEqual({
        id: 'user-1',
        email: 'user@example.com',
        emailVerification: true,
        teams: ['CLIENT', 'WORKER'],
      });
    });

    it('rejects when the fake factory calls reject', async () => {
      const { factory, account, teams } = buildFakeFactory();
      account.get.mockRejectedValue(new Error('invalid session'));
      teams.list.mockResolvedValue({ teams: [] });

      const service = new AppwriteAuthService(factory);

      await expect(service.validateSession('bad-token')).rejects.toThrow('invalid session');
    });
  });

  describe('logout', () => {
    it('calls account.deleteSession with "current"', async () => {
      const { factory, account } = buildFakeFactory();
      account.deleteSession.mockResolvedValue({});

      const service = new AppwriteAuthService(factory);
      await service.logout('token-123');

      expect(account.deleteSession).toHaveBeenCalledWith('current');
    });
  });
});
