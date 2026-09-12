import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { applyTheme, resolveInitialTheme } from './utils/theme';
import { applyDataMode, resolveInitialDataMode } from './utils/data-mode';
import { bindAppHeight } from './utils/viewport';
import './styles.css';

applyTheme(resolveInitialTheme());
applyDataMode(resolveInitialDataMode());
bindAppHeight();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
