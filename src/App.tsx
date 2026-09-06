import { useCallback, useEffect, type ReactElement } from 'react';
import type { AppRoute } from './app/routing';
import { SessionProvider, useSession } from './app/session-context';
import { AboutPage } from './components/about-page';
import { OfflineBanner } from './components/offline-banner';
import { RtiComposerHost } from './components/rti-composer-host';
import { AskView } from './features/ask/ask-view';
import { ExploreView } from './features/explore/explore-app';
import { ComparePage } from './features/pages/compare-page';
import { FeaturesPage } from './features/pages/features-page';
import { ScalePage } from './features/pages/scale-page';

const ROUTE_BODY_CLASSES: readonly AppRoute[] = [
  'ask',
  'explore',
  'about',
  'compare',
  'features',
  'scale'
];

function AppRouter(): ReactElement {
  const session = useSession();
  const route = session.route;

  useEffect(() => {
    for (const name of ROUTE_BODY_CLASSES) {
      document.body.classList.toggle(`route-${name}`, route === name);
    }
    return () => {
      for (const name of ROUTE_BODY_CLASSES) {
        document.body.classList.remove(`route-${name}`);
      }
    };
  }, [route]);

  const goBack = useCallback((): void => {
    const previous = sessionStorage.getItem('ourmoney-back-route');
    const target: AppRoute = previous === 'explore' ? 'explore' : 'ask';
    session.setRoute(target);
  }, [session]);

  let page: ReactElement;
  switch (route) {
    case 'about':
      page = <AboutPage onBack={goBack} />;
      break;
    case 'compare':
      page = <ComparePage onBack={goBack} />;
      break;
    case 'features':
      page = <FeaturesPage onBack={goBack} />;
      break;
    case 'scale':
      page = <ScalePage onBack={goBack} />;
      break;
    case 'explore':
      page = <ExploreView />;
      break;
    case 'ask':
    default:
      page = <AskView />;
      break;
  }

  return (
    <>
      <OfflineBanner />
      {page}
      {session.rtiTarget ? (
        <RtiComposerHost
          schemeId={session.rtiTarget.schemeId}
          nodeId={session.rtiTarget.nodeId}
          onClose={session.closeRti}
        />
      ) : null}
    </>
  );
}

export function App(): ReactElement {
  return (
    <SessionProvider>
      <AppRouter />
    </SessionProvider>
  );
}
