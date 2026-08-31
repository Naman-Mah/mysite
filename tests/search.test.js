import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchIndex } from '../src/search/index-builder.js';

test('Search: build TF-IDF search index', () => {
  const pages = [
    { title: 'Node.js SSG', description: 'Zero dependency generator', contentHtml: '<p>Fast build system</p>', url: '/node-ssg.html' },
    { title: 'Python Guide', description: 'Python programming', contentHtml: '<p>Learn Python basics</p>', url: '/python.html' }
  ];

  const { pages: indexedPages, index } = buildSearchIndex(pages);

  assert.equal(indexedPages.length, 2);
  assert.ok(index['ssg'] || index['generator']);
  assert.ok(index['python']);
});
