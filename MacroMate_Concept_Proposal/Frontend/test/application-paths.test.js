import test from 'node:test';
import assert from 'node:assert/strict';
import { canReturnToApp, isApplicationPath } from '../src/utils/applicationPaths.js';

test('keeps the existing application document and rejects unknown URLs', () => {
  assert.equal(isApplicationPath('/'), true);
  assert.equal(isApplicationPath('/index.html'), true);
  for (const path of ['/404', '/missing-page', '/index.html/missing', '/nested/unknown']) {
    assert.equal(isApplicationPath(path), false, path);
  }
});

test('respects a deployment base without accepting similarly named paths', () => {
  for (const path of ['/macromate', '/macromate/', '/macromate/index.html']) {
    assert.equal(isApplicationPath(path, '/macromate/'), true, path);
  }
  for (const path of ['/', '/macromate-other/', '/macromate/unknown']) {
    assert.equal(isApplicationPath(path, '/macromate/'), false, path);
  }
});

test('back navigation falls home when the referrer is absent, external or another missing page', () => {
  const origin = 'https://macromate.example';
  assert.equal(canReturnToApp(`${origin}/?confirmed=true#section`, origin), true);
  assert.equal(canReturnToApp(`${origin}/index.html`, origin), true);
  for (const referrer of ['', 'not a URL', 'https://other.example/', `${origin}/missing`]) {
    assert.equal(canReturnToApp(referrer, origin), false, referrer);
  }
  assert.equal(canReturnToApp(`${origin}/macromate/`, origin, '/macromate/'), true);
  assert.equal(canReturnToApp(`${origin}/`, origin, '/macromate/'), false);
});
