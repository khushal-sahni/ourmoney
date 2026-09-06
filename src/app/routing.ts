export type AppRoute = 'ask' | 'explore' | 'about';

export interface IExploreRouteParams {
  readonly schemeId?: string;
  readonly nodeId?: string;
}

export function readRouteFromHash(): AppRoute {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash === 'about' || hash.startsWith('about')) return 'about';
  if (hash === 'explore' || hash.startsWith('explore')) return 'explore';
  return 'ask';
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
      window.location.hash = 'about';
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
