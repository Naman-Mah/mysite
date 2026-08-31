import test from 'node:test';
import assert from 'node:assert/strict';
import { minifyHtml } from '../src/minify/html.js';
import { minifyCss } from '../src/minify/css.js';
import { minifyJs } from '../src/minify/js.js';

test('Minify: HTML minification with pre block preservation', () => {
  const input = '<div>\n  <!-- Comment -->\n  <h1>Title</h1>\n  <pre>  formatted  code  </pre>\n</div>';
  const min = minifyHtml(input);

  assert.ok(!min.includes('<!-- Comment -->'));
  assert.ok(min.includes('<pre>  formatted  code  </pre>'));
  assert.ok(min.includes('<div><h1>Title</h1>'));
});

test('Minify: CSS minification', () => {
  const input = 'body {\n  color: #333;\n  /* comment */\n  margin: 0px ;\n}';
  const min = minifyCss(input);

  assert.equal(min, 'body{color:#333;margin:0px}');
});

test('Minify: JS minification', () => {
  const input = '// comment\nfunction test() {\n  // line comment\n  return 42;\n}';
  const min = minifyJs(input);

  assert.ok(!min.includes('// comment'));
  assert.ok(min.includes('function test()'));
  assert.ok(min.includes('return 42;'));
});
