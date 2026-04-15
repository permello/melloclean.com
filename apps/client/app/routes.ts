/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { type RouteConfig, index, route } from '@react-router/dev/routes';

/**
 * Application route configuration defining all available routes.
 */
export default [
  index('pages/landing/landing.tsx'),
  route('login', 'pages/auth/login/login.tsx'),
  route('join', 'pages/auth/join/join.tsx'),
] satisfies RouteConfig;
