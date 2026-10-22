import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const output = path.resolve('dist');
const html = readFileSync(path.join(output, 'index.html'), 'utf8');
assert.match(html, /<div id="root"><\/div>/);
const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]);
assert.ok(scripts.length > 0, 'Production HTML must load a JavaScript entry point');
for (const asset of scripts) {
  assert.ok(!asset.startsWith('http') && asset.endsWith('.js'), `Bundled entry required: ${asset}`);
  assert.ok(existsSync(path.join(output, asset)), `Missing entry: ${asset}`);
}
const assets = readdirSync(path.join(output, 'assets'));
assert.ok(assets.some(asset => asset.endsWith('.css')), 'Compiled styles required');
assert.ok(assets.some(asset => asset.endsWith('.woff2')), 'Local fonts required');
for (const asset of ['index.html', ...assets.filter(asset => /\.(js|css)$/.test(asset)).map(asset => `assets/${asset}`)]) {
  const body = readFileSync(path.join(output, asset), 'utf8');
  assert.doesNotMatch(body, /aistudiocdn\.com|esm\.sh|cdn\.tailwindcss\.com|fonts\.googleapis\.com|STATIC_BUILD_TEST_SENTINEL|process\.env\.(?:API_KEY|GEMINI_API_KEY)|type="importmap"/, `Runtime coupling in ${asset}`);
  if (asset.endsWith('.css')) {
    for (const [, url] of body.matchAll(/url\(([^)]+)\)/g)) {
      const local = url.replace(/["']/g, '');
      assert.ok(!/^https?:/.test(local), `External style asset: ${local}`);
      if (!local.startsWith('data:')) assert.ok(existsSync(path.join(output, local)), `Missing style asset: ${local}`);
    }
  }
}
console.log(`Static build smoke passed: ${scripts.length} entry point(s), bundled CSS/fonts, no AI Studio runtime or test key.`);
