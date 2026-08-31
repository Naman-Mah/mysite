import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { loadConfig } from '../src/config/load.js';

test('Config: load user configuration from mysite.config.json', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mysite-config-test-'));

  try {
    const userConfig = { title: 'Custom Site Title', author: 'Jane Doe', baseUrl: 'http://mycustomdomain.com' };
    fs.writeFileSync(path.join(tmpDir, 'mysite.config.json'), JSON.stringify(userConfig), 'utf8');

    const loaded = loadConfig(tmpDir);

    assert.equal(loaded.title, 'Custom Site Title');
    assert.equal(loaded.author, 'Jane Doe');
    assert.equal(loaded.baseUrl, 'http://mycustomdomain.com');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Config: fallback to default site config when mysite.config.json is absent', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mysite-config-absent-'));

  try {
    const loaded = loadConfig(tmpDir);

    assert.equal(loaded.title, 'mysite — Zero-Dependency SSG');
    assert.equal(loaded.author, 'mysite');
    assert.equal(loaded.baseUrl, 'http://localhost:3000');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
