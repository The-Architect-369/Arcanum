export type RouteMotionDirection = 'next' | 'prev';

const ROUTE_ORDER = [
  '/account',
  '/hope',
  '/tempus',
  '/nexus',
  '/wallet',
  '/exchange',
  '/vitae',
  '/notifications',
  '/preferences',
  '/developer',
] as const;

function rootFor(path: string) {
  const normalized = path.split('?')[0]?.split('#')[0] || '/';
  const segment = normalized.split('/').filter(Boolean)[0];
  return segment ? `/${segment}` : '/hope';
}

function routeRank(path: string) {
  const root = rootFor(path);
  const direct = ROUTE_ORDER.indexOf(root as (typeof ROUTE_ORDER)[number]);
  if (direct !== -1) return direct;

  if (root === '/app') return ROUTE_ORDER.indexOf('/hope');
  return ROUTE_ORDER.length;
}

export function directionForRoute(from: string, to: string): RouteMotionDirection {
  const fromRank = routeRank(from);
  const toRank = routeRank(to);

  if (fromRank === toRank) return 'next';
  return toRank > fromRank ? 'next' : 'prev';
}

export function primeRouteMotion(from: string, to: string) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.cardDirection = directionForRoute(from, to);
}
