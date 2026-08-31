import test from 'node:test';
import assert from 'node:assert/strict';
import { highlightCode } from '../src/highlight/tokenizer.js';

test('Highlight: JavaScript syntax', () => {
  const code = 'const msg = "Hello";\nfunction test() { return 42; }';
  const html = highlightCode(code, 'js');

  assert.ok(html.includes('<span class="hl-keyword">const</span>'));
  assert.ok(html.includes('<span class="hl-string">&quot;Hello&quot;</span>'));
  assert.ok(html.includes('<span class="hl-function">test</span>'));
  assert.ok(html.includes('<span class="hl-number">42</span>'));
});

test('Highlight: Python syntax', () => {
  const code = 'def hello():\n    # Comment\n    return "world"';
  const html = highlightCode(code, 'python');

  assert.ok(html.includes('<span class="hl-keyword">def</span>'));
  assert.ok(html.includes('<span class="hl-comment"># Comment</span>'));
  assert.ok(html.includes('<span class="hl-string">&quot;world&quot;</span>'));
});

test('Highlight: HTML syntax', () => {
  const code = '<div class="container">Hello</div>';
  const html = highlightCode(code, 'html');

  assert.ok(html.includes('<span class="hl-tag">&lt;div</span>'));
  assert.ok(html.includes('<span class="hl-attr">class</span>'));
});
