import { useSyncExternalStore } from 'react';
import NotFoundPage from '../pages/NotFoundPage';
import { isApplicationPath } from '../utils/applicationPaths';

function subscribe(onChange) {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

const getPathname = () => window.location.pathname;
const basePath = import.meta.env.BASE_URL;

export default function AppRouteBoundary({ children }) {
  const pathname = useSyncExternalStore(subscribe, getPathname, () => basePath);
  return isApplicationPath(pathname, basePath)
    ? children
    : <NotFoundPage homeHref={basePath} />;
}
