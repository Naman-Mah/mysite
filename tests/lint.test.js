import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { checkLinks } from '../src/lint/link-checker.js';
import { runLinter } from '../src/lint/a11y.js';

test('Lint: link-checker internal path resolution and broken link detection', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mysite-lint-test-'));

  try {
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '<a href="/about.html">About</a>', 'utf8');
    fs.writeFileSync(path.join(tmpDir, 'about.html'), '<a href="/broken.html">Broken</a>', 'utf8');

    const htmlFiles = [
      { relative: 'index.html', absolute: path.join(tmpDir, 'index.html') },
      { relative: 'about.html', absolute: path.join(tmpDir, 'about.html') }
    ];

    const report = checkLinks(tmpDir, htmlFiles);

    assert.equal(report.internalChecked, 2);
    assert.equal(report.brokenInternalCount, 1);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Lint: a11y missing alt text rule flags <img src="/assets/sample.png" /> with no alt attribute', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mysite-a11y-test-'));
  const logs = [];
  const originalWarn = console.warn;

  try {
    console.warn = (msg) => {
      logs.push(msg);
    };

    const htmlContent = '<!DOCTYPE html><html lang="en"><body><img src="/assets/sample.png" /></body></html>';
    fs.writeFileSync(path.join(tmpDir, 'test.html'), htmlContent, 'utf8');

    runLinter({ src: tmpDir, out: tmpDir });

    const altWarning = logs.find((l) => l.includes('Image missing or empty alt attribute'));
    assert.ok(altWarning, 'Linter must flag <img src="/assets/sample.png" /> for missing alt attribute');
    assert.ok(altWarning.includes('test.html'));
  } finally {
    console.warn = originalWarn;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
