import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { RouterProvider } from './router-context';
import './styles/index.css';

/**
 * Client entry.
 *
 * Every page is prerendered to static HTML, so this always hydrates rather than
 * mounting from scratch. If the root element is missing (which should not
 * happen), it fails loudly instead of silently rendering nothing.
 */
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root was not found; cannot hydrate the application.');
}

hydrateRoot(
  container,
  <StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </StrictMode>,
);
