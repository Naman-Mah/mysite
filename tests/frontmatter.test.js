import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter, parseYamlSubset } from '../src/frontmatter/parse.js';

test('Frontmatter: parse basic YAML subset', () => {
  const raw = `---
title: "My Post"
date: 2026-08-31
draft: false
tags:
  - node
  - ssg
author:
  name: Alice
  role: Developer
---
# Hello World
`;

  const { data, content } = parseFrontmatter(raw);

  assert.equal(data.title, 'My Post');
  assert.equal(data.date, '2026-08-31');
  assert.equal(data.draft, false);
  assert.deepEqual(data.tags, ['node', 'ssg']);
  assert.equal(data.author.name, 'Alice');
  assert.equal(data.author.role, 'Developer');
  assert.equal(content.trim(), '# Hello World');
});

test('Frontmatter: empty frontmatter', () => {
  const raw = '# Just Markdown\nNo frontmatter here.';
  const { data, content } = parseFrontmatter(raw);

  assert.deepEqual(data, {});
  assert.equal(content, raw);
});
