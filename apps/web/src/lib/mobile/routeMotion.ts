export type RouteMotionDirection = 'next' | 'prev' | 'secondary';

const GLOBAL_ROUTES = ['/hope', '/tempus', '/nexus', '/wallet', '/vitae'] as const;
const SECONDARY_ROUTES = ['/account', '/exchange', '/notifications', '/preferences', '/developer'] as const;

function rootFor(path: string) {
  const normalized = path.split('?')[0]?.split('#')[0] || '/';
  const segment = normalized.split('/').filter(Boolean)[0];
  return segment ? `/${segment}` : '/hope';
}

function globalRank(path: string) {
  const root = rootFor(path);
  if (root === '/app') return GLOBAL_ROUTES.indexOf('/hope');
  return GLOBAL_ROUTES.indexOf(root as (typeof GLOBAL_ROUTES)[number]);
}

function isSecondary(path: string) {
  const root = rootFor(path);
  return SECONDARY_ROUTES.includes(root as (typeof SECONDARY_ROUTES)[number]);
}

export function directionForRoute(from: string, to: string): RouteMotionDirection {
  const fromGlobalRank = globalRank(from);
  const toGlobalRank = globalRank(to);

  if (isSecondary(to) || isSecondary(from)) return 'secondary';
  if (fromGlobalRank === -1 || toGlobalRank === -1) return 'secondary';
  if (fromGlobalRank === toGlobalRank) return 'next';

  return toGlobalRank > fromGlobalRank ? 'next' : 'prev';
}

export function primeRouteMotion(from: string, to: string) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.cardDirection = directionForRoute(from, to);
}
