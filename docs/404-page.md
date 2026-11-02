# Figma 404 page

Source: [Aaron's page-not-found design](https://www.figma.com/design/YW81sDndJKqvoWsfQBhqld/MacroMate-Website?node-id=1-1850).

The page uses live text and controls, the design's portrait, pixel glasses, logo,
and locally hosted Otomanopee One / Momo Trust fonts. The existing Aaron portrait
is reused after checking it is pixel-identical to the Figma asset. Font licenses
are included beside the font files. The original design copy is preserved.
Home and Back controls are added below it for recovery. The layout stacks on
smaller screens and keyboard users receive visible focus indicators.

MacroMate currently changes screens inside its root document rather than using
separate URL routes. The root and `index.html` retain that behavior; other URL
paths (including `/404`) show the not-found screen, outside the authentication
provider so the recovery links remain usable without a Supabase connection.
The configured Vite base path is respected. Queries and authentication fragments
on the application root are not treated as missing pages.

Back returns to a known, same-origin application document when the referrer
allows it; otherwise it goes to the application home. Existing dashboard,
journal and account navigation is not converted into URL routes.

For production hosting, configure an SPA rewrite to `index.html` so the web
server sends unknown page paths to React. This is a client-side 404 view; it
does not change the server's HTTP status or deploy hosting configuration.

## Verification

From `MacroMate_Concept_Proposal/Frontend`:

```powershell
node --test test/application-paths.test.js
npm.cmd exec eslint src/components/AppRouteBoundary.jsx src/pages/NotFoundPage.jsx src/utils/applicationPaths.js
npm.cmd run build
```

The current dependency tree contains an existing React 16 peer requirement in
`react-web-notification`; a fresh install currently requires
`npm.cmd ci --legacy-peer-deps`. This change does not alter that dependency tree.

Open `/404` or any unknown path. Check Home, Back with and without a known
application referrer, browser back/forward, keyboard navigation and narrow
screens. No account creation, confirmation email or database write is needed.
