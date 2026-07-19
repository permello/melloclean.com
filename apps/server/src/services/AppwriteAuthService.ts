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
import type { SessionClientFactory } from '../config/appwrite';
import type { AuthService, AuthUser } from './AuthService';

export class AppwriteAuthService implements AuthService {
  constructor(private readonly buildSessionClients: SessionClientFactory) {}

  async validateSession(token: string): Promise<AuthUser> {
    const { account, teams } = this.buildSessionClients(token);
    const [user, teamList] = await Promise.all([account.get(), teams.list()]);

    return {
      id: user.$id,
      email: user.email,
      emailVerification: user.emailVerification,
      teams: teamList.teams.map((team) => team.name),
    };
  }

  async logout(token: string): Promise<void> {
    const { account } = this.buildSessionClients(token);
    await account.deleteSession('current');
  }
}
