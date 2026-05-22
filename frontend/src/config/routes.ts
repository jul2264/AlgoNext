// AlgoNext — Route Definitions

export const ROUTES = {
  HOME: '/',
  AUTH: {
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',
  },
  CURRICULUM: '/curriculum',
  PROBLEM: '/problem/:slug',
  DASHBOARD: '/dashboard',
  VISUALIZER: '/visualizer',
  PROFILE: '/profile',
  FACULTY: '/faculty',
} as const;

/**
 * Generate a problem route with a specific slug
 */
export function problemRoute(slug: string): string {
  return `/problem/${slug}`;
}
