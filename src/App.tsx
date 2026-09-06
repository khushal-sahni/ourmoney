import { useCallback, useEffect, type ReactElement } from 'react';
import type { AppRoute } from './app/routing';
import { SessionProvider, useSession } from './app/session-context';
import { AboutPage } from './components/about-page';
import { AskView } from './features/ask/ask-view';
import { ExploreView } from './features/explore/explore-app';

function AppRouter(): ReactElement {
  const session = useSession();
  const route = session.route;

  useEffect(() => {
    document.body.classList.toggle('route-about', route === 'about');
    document.body.classList.toggle('route-ask', route === 'ask');
    document.body.classList.toggle('route-explore', route === 'explore');
    return () => {
      document.body.classList.remove('route-about', 'route-ask', 'route-explore');
    };
  }, [route]);

  const goAbout = useCallback((): void => {
    session.setRoute('about');
  }, [session]);

  const goBack = useCallback((): void => {
    const previous = sessionStorage.getItem('ourmoney-back-route');
    const target: AppRoute = previous === 'explore' ? 'explore' : 'ask';
    session.setRoute(target);
  }, [session]);

  if (route === 'about') {
    return <AboutPage onBack={goBack} />;
  }

  if (route === 'explore') {
    return <ExploreView onAbout={goAbout} />;
  }

  return <AskView onAbout={goAbout} />;
}

export function App(): ReactElement {
  return (
    <SessionProvider>
      <AppRouter />
    </SessionProvider>
  );
}
