import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { navigateTo, readRouteFromHash, type AppRoute } from './app/routing';
import { SessionProvider } from './app/session-context';
import { AboutPage } from './components/about-page';
import { AskView } from './features/ask/ask-view';
import { ExploreView } from './features/explore/explore-app';

function AppRouter(): ReactElement {
  const [route, setRoute] = useState<AppRoute>(readRouteFromHash);

  useEffect(() => {
    const onHashChange = (): void => setRoute(readRouteFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('route-about', route === 'about');
    document.body.classList.toggle('route-ask', route === 'ask');
    document.body.classList.toggle('route-explore', route === 'explore');
    return () => {
      document.body.classList.remove('route-about', 'route-ask', 'route-explore');
    };
  }, [route]);

  const goAbout = useCallback((): void => {
    navigateTo('about');
    setRoute('about');
  }, []);

  const goBack = useCallback((): void => {
    const previous = sessionStorage.getItem('ourmoney-back-route');
    const target: AppRoute = previous === 'explore' ? 'explore' : 'ask';
    navigateTo(target);
    setRoute(target);
  }, []);

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
