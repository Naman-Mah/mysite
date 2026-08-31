import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { buildSite } from '../src/build/pipeline.js';
import { hashDirectory } from '../src/build/hash.js';

test('Determinism: consecutive builds produce byte-identical SHA-256 output hash', () => {
  const srcDir = path.resolve('./examples/demo-site');
  if (!fs.existsSync(srcDir)) {
    // Create temporary minimal site if demo-site not populated yet
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(srcDir, 'index.md'), '# Test\nDeterministic build test.', 'utf8');
  }

  const tmp1 = fs.mkdtempSync(path.join(os.tmpdir(), 'mysite-det-1-'));
  const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), 'mysite-det-2-'));

  try {
    buildSite({ src: srcDir, out: tmp1 });
    const hash1 = hashDirectory(tmp1);

    buildSite({ src: srcDir, out: tmp2 });
    const hash2 = hashDirectory(tmp2);

    assert.equal(hash1, hash2, 'Build outputs must be byte-identical');
    assert.ok(hash1.length === 64, 'Hash must be valid SHA-256 hex string');
  } finally {
    fs.rmSync(tmp1, { recursive: true, force: true });
    fs.rmSync(tmp2, { recursive: true, force: true });
  }
});
