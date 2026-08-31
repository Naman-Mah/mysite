/**
 * Zero-dependency verification module.
 * Confirms empty dependency manifest in package.json and scans source files
 * for non-stdlib bare specifiers. Writes proof to deps-proof.txt.
 */
import fs from 'node:fs';
import path from 'node:path';
import colors from '../cli/colors.js';
import { walkDir } from '../build/walk.js';

export function verifyZeroDep() {
  const rootDir = process.cwd();
  const pkgPath = path.join(rootDir, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    console.error(colors.red('Error: package.json not found in working directory.'));
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = pkg.dependencies || {};
  const devDeps = pkg.devDependencies || {};

  const depsCount = Object.keys(deps).length;
  const devDepsCount = Object.keys(devDeps).length;

  const lines = [];

  let isPass = true;

  if (depsCount === 0) {
    lines.push('✓ package.json dependencies: {} (empty)');
  } else {
    isPass = false;
    lines.push(`✗ package.json dependencies contains ${depsCount} entries`);
  }

  if (devDepsCount === 0) {
    lines.push('✓ package.json devDependencies: {} (empty)');
  } else {
    isPass = false;
    lines.push(`✗ package.json devDependencies contains ${devDepsCount} entries`);
  }

  // Scan source files for imports / requires
  const srcFiles = [
    ...walkDir(path.join(rootDir, 'src')),
    ...walkDir(path.join(rootDir, 'bin'))
  ].filter((f) => !f.isDir && f.relative.endsWith('.js'));

  let nonStdlibCount = 0;
  const invalidImports = [];

  const importRegex = /(?:import\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;

  for (const file of srcFiles) {
    const code = fs.readFileSync(file.absolute, 'utf8');
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const specifier = match[1] || match[2];
      if (
        !specifier.startsWith('node:') &&
        !specifier.startsWith('.') &&
        !specifier.startsWith('/')
      ) {
        nonStdlibCount++;
        invalidImports.push(`${file.relative}: ${specifier}`);
      }
    }
  }

  lines.push(`✓ scanned ${srcFiles.length} source files — ${nonStdlibCount} non-stdlib imports found`);

  if (nonStdlibCount > 0) {
    isPass = false;
    lines.push(`✗ invalid external imports detected:\n  ${invalidImports.join('\n  ')}`);
  }

  if (isPass) {
    lines.push('✓ zero third-party runtime dependencies confirmed');
  } else {
    lines.push('✗ zero-dependency check FAILED');
  }

  const reportText = lines.join('\n');
  console.log(reportText);

  // Write proof file
  const proofPath = path.join(rootDir, 'deps-proof.txt');
  fs.writeFileSync(proofPath, reportText + '\n', 'utf8');
  console.log(colors.gray(`\nWrote verification report to ${proofPath}`));

  if (!isPass) {
    process.exit(1);
  }
}
