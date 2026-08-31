import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown } from '../src/markdown/render.js';
import { parseFrontmatter } from '../src/frontmatter/parse.js';
import { parseMarkdownToAst } from '../src/markdown/parser.js';

test('Markdown: headings and paragraphs', () => {
  const md = '# Title\n\nSome paragraph text with **bold** and *italic*.';
  const html = renderMarkdown(md);

  assert.ok(html.includes('<h1 id="title">Title</h1>'));
  assert.ok(html.includes('<p>Some paragraph text with <strong>bold</strong> and <em>italic</em>.</p>'));
});

test('Markdown: code fences with backticks', () => {
  const md = '```js\nconst x = "```inside```";\nconsole.log(x);\n```';
  const html = renderMarkdown(md);

  assert.ok(html.includes('<pre><code class="language-js">const x = &quot;```inside```&quot;;\nconsole.log(x);</code></pre>'));
});

test('Markdown: blockquotes and hr', () => {
  const md = '> Quote text\n\n---';
  const html = renderMarkdown(md);

  assert.ok(html.includes('<blockquote>'));
  assert.ok(html.includes('<p>Quote text</p>'));
  assert.ok(html.includes('<hr />'));
});

test('Markdown: nested lists', () => {
  const md = '- Item 1\n  - Item 1.1\n  - Item 1.2\n- Item 2';
  const html = renderMarkdown(md);

  assert.ok(html.includes('<ul>'));
  assert.ok(html.includes('Item 1'));
  assert.ok(html.includes('Item 1.1'));
  assert.ok(html.includes('Item 2'));
});

test('Markdown: GFM tables with column alignment', () => {
  const md = '| Name | Age |\n|:---|---:|\n| Alice | 30 |\n| Bob | 25 |';
  const html = renderMarkdown(md);

  assert.ok(html.includes('<table>'));
  assert.ok(html.includes('<th>Name</th>'));
  assert.ok(html.includes('<th style="text-align: right;">Age</th>'));
  assert.ok(html.includes('<td>Alice</td>'));
  assert.ok(html.includes('<td style="text-align: right;">30</td>'));
});

test('Markdown: link reference definitions and inline images', () => {
  const md = '![Logo][my-logo]\n\n[my-logo]: /assets/logo.png "Site Logo"';
  const html = renderMarkdown(md);

  assert.ok(html.includes('<img src="/assets/logo.png" alt="Logo" title="Site Logo" />'));
});

test('Markdown: autolinks and strikethrough', () => {
  const md = 'Visit <https://example.com> or ~~cancel~~.';
  const html = renderMarkdown(md);

  assert.ok(html.includes('<a href="https://example.com">https://example.com</a>'));
  assert.ok(html.includes('<del>cancel</del>'));
});
