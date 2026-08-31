/**
 * Zero-dependency reproducible build verifier module.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import colors from '../cli/colors.js';
import { buildSite } from '../build/pipeline.js';
import { hashDirectory } from '../build/hash.js';

export async function verifyReproducible(options = {}) {
  const rootDir = process.cwd();
  const srcDir = path.resolve(options.src || './examples/demo-site');

  const tmp1 = fs.mkdtempSync(path.join(os.tmpdir(), 'mysite-build1-'));
  const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), 'mysite-build2-'));

  try {
    buildSite({ ...options, src: srcDir, out: tmp1 });
    const hash1 = hashDirectory(tmp1);

    buildSite({ ...options, src: srcDir, out: tmp2 });
    const hash2 = hashDirectory(tmp2);

    const isMatch = hash1 === hash2;

    const lines = [
      `Build 1 hash: ${hash1}`,
      `Build 2 hash: ${hash2}`
    ];

    if (isMatch) {
      lines.push('✓ builds are byte-identical (deterministic)');
    } else {
      lines.push('✗ builds produce different content hashes (non-deterministic)');
    }

    const reportText = lines.join('\n');
    console.log(reportText);

    const reproPath = path.join(rootDir, 'repro-hashes.txt');
    fs.writeFileSync(reproPath, reportText + '\n', 'utf8');
    console.log(colors.gray(`Wrote determinism report to ${reproPath}`));

    if (!isMatch) {
      process.exit(1);
    }
  } finally {
    fs.rmSync(tmp1, { recursive: true, force: true });
    fs.rmSync(tmp2, { recursive: true, force: true });
  }
}
