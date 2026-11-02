import { useEffect, useRef } from 'react';
import portrait from '../assets/MacroMate Assets/MacroMate Icon and Assets/Aaron 404 Page.png';
import glasses from '../assets/not-found/pixel-glasses.png';
import logo from '../assets/not-found/macromate-logo.png';
import { canReturnToApp } from '../utils/applicationPaths';
import './NotFoundPage.css';

export default function NotFoundPage({ homeHref = '/' }) {
  const headingRef = useRef(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = '404 · Page not available | MacroMate';
    document.body.classList.add('not-found-active');
    headingRef.current?.focus();
    return () => {
      document.title = previousTitle;
      document.body.classList.remove('not-found-active');
    };
  }, []);

  function goBack() {
    if (window.history.length > 1 && canReturnToApp(document.referrer, window.location.origin, homeHref)) {
      window.history.back();
    } else {
      window.location.assign(homeHref);
    }
  }

  return (
    <main className="not-found-page" aria-labelledby="not-found-title">
      <div className="not-found-card">
        <div className="not-found-copy">
          <a className="not-found-brand" href={homeHref} aria-label="MacroMate home">
            <img src={logo} alt="" width="42" height="39" data-figma-node="55:849" />
            <span>MacroMate</span>
          </a>

          <p className="not-found-badge">ERROR 404</p>
          <h1 className="not-found-title" id="not-found-title" ref={headingRef} tabIndex={-1}>
            <span>Page not available</span>
            <span className="not-found-highlight">But Aaron is</span>
          </h1>

          <div className="not-found-description">
            <p>Aaron is a Main Back-End Developer, and Programmer</p>
            <p>I’m better than Cedric.</p>
          </div>

          <nav className="not-found-actions" aria-label="Page recovery">
            <a className="not-found-home" href={homeHref}>Back to home</a>
            <button className="not-found-back" type="button" onClick={goBack}>Go back</button>
          </nav>
        </div>

        <figure className="not-found-art">
          <img className="not-found-portrait" src={portrait} alt="Aaron Layman, MacroMate developer" data-figma-node="49:151" />
          <img className="not-found-glasses" src={glasses} alt="" aria-hidden="true" data-figma-node="81:43" />
        </figure>
      </div>
    </main>
  );
}
