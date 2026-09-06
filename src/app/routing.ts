export type AppRoute = 'ask' | 'explore' | 'about' | 'compare' | 'features' | 'scale';

export interface IExploreRouteParams {
  readonly schemeId?: string;
  readonly nodeId?: string;
}

const STATIC_ROUTES: readonly AppRoute[] = ['about', 'compare', 'features', 'scale'];

export function routeFromHash(hash: string): AppRoute {
  const cleaned = hash.replace(/^#/, '');
  const path = cleaned.split('?')[0] ?? '';
  if (path === 'explore' || path.startsWith('explore')) return 'explore';
  for (const route of STATIC_ROUTES) {
    if (path === route || path.startsWith(`${route}/`)) return route;
  }
  return 'ask';
}

export function readRouteFromHash(): AppRoute {
  return routeFromHash(window.location.hash);
}

export function parseExploreParams(hash: string): IExploreRouteParams {
  const queryStart = hash.indexOf('?');
  if (queryStart === -1) return {};
  const params = new URLSearchParams(hash.slice(queryStart + 1));
  return {
    schemeId: params.get('scheme') ?? undefined,
    nodeId: params.get('node') ?? undefined
  };
}

export function buildExploreHash(params?: IExploreRouteParams): string {
  if (!params?.schemeId && !params?.nodeId) return '#explore';
  const search = new URLSearchParams();
  if (params.schemeId) search.set('scheme', params.schemeId);
  if (params.nodeId) search.set('node', params.nodeId);
  return `#explore?${search.toString()}`;
}

export function navigateTo(route: AppRoute, exploreParams?: IExploreRouteParams): void {
  switch (route) {
    case 'about':
    case 'compare':
    case 'features':
    case 'scale':
      window.location.hash = route;
      break;
    case 'explore':
      window.location.hash = buildExploreHash(exploreParams).replace(/^#/, '');
      break;
    case 'ask':
    default:
      window.location.hash = '';
      break;
  }
}
