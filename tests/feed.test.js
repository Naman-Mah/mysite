import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRssFeed } from '../src/feed/rss.js';
import { buildAtomFeed } from '../src/feed/atom.js';
import { buildSitemap } from '../src/feed/sitemap.js';

test('Feed: RSS XML escaping for special characters (&, <, >, ", \')', () => {
  const siteConfig = {
    title: 'Tom & Jerry\'s <Blog> "2026"',
    description: 'A & B <C> "D" \'E\'',
    baseUrl: 'http://localhost:3000'
  };
  const pages = [
    { title: 'Fish & Chips <Deluxe> "Special" \'Menu\'', description: 'Fresh & tasty <food>', url: '/post.html' }
  ];

  const xml = buildRssFeed(siteConfig, pages);

  assert.ok(xml.includes('Tom &amp; Jerry&apos;s &lt;Blog&gt; &quot;2026&quot;'));
  assert.ok(xml.includes('Fish &amp; Chips &lt;Deluxe&gt; &quot;Special&quot; &apos;Menu&apos;'));
  assert.ok(!xml.includes('Tom & Jerry'));
});

test('Feed: Atom XML escaping for special characters', () => {
  const siteConfig = {
    title: 'Code & Data <Tag>',
    description: 'Dev & Ops',
    baseUrl: 'http://localhost:3000'
  };
  const pages = [
    { title: 'Item 1 & 2 <Test>', description: 'Summary & Details', url: '/item1.html' }
  ];

  const xml = buildAtomFeed(siteConfig, pages);

  assert.ok(xml.includes('Code &amp; Data &lt;Tag&gt;'));
  assert.ok(xml.includes('Item 1 &amp; 2 &lt;Test&gt;'));
});

test('Feed: Sitemap XML generation and link escaping', () => {
  const siteConfig = { baseUrl: 'http://example.com' };
  const pages = [
    { url: '/index.html' },
    { url: '/posts/first.html?a=1&b=2' }
  ];

  const xml = buildSitemap(siteConfig, pages);

  assert.ok(xml.includes('<loc>http://example.com/index.html</loc>'));
  assert.ok(xml.includes('<loc>http://example.com/posts/first.html?a=1&amp;b=2</loc>'));
});
