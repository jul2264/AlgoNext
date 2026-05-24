// AlgoNext — Route Definitions

export const ROUTES = {
  HOME: '/',
  AUTH: {
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',
  },
  CURRICULUM: '/dsa',
  DASHBOARD: '/dashboard',
  PROBLEMS: '/problems',
  PROBLEM_DETAIL: (slug: string) => `/problems/${slug}`,
  VISUALIZER: '/daa',
  PROFILE: '/profile',
} as const;

/**
 * Generate a problem route with a specific slug
 */
export function problemRoute(slug: string): string {
  return `/problem/${slug}`;
}
