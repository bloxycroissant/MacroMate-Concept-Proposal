// MacroMate's existing screens share one document; they do not have URL routes.
export function isApplicationPath(pathname, basePath = '/') {
  const base = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return pathname === base || pathname === `${base}index.html`
    || (base !== '/' && pathname === base.slice(0, -1));
}

export function canReturnToApp(referrer, origin, basePath = '/') {
  if (!referrer) return false;
  try {
    const previous = new URL(referrer);
    return previous.origin === origin && isApplicationPath(previous.pathname, basePath);
  } catch {
    return false;
  }
}
