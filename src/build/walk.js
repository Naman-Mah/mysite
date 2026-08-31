/**
 * Zero-dependency deterministic file tree walker.
 * Returns sorted relative and absolute file paths.
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * Recursively walk directory and return sorted file paths.
 * @param {string} dirPath - Root directory absolute path
 * @returns {Array<{ relative: string, absolute: string, isDir: boolean }>}
 */
export function walkDir(dirPath) {
  if (!fs.existsSync(dirPath)) return [];

  const results = [];

  function scan(currentDir, relativeBase = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    // Sort entries deterministically by name using standard locale/code-point ordering
    entries.sort((a, b) => a.name.localeCompare(b.name, 'en'));

    for (const entry of entries) {
      const relPath = relativeBase ? path.join(relativeBase, entry.name).replace(/\\/g, '/') : entry.name;
      const absPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        results.push({ relative: relPath, absolute: absPath, isDir: true });
        scan(absPath, relPath);
      } else if (entry.isFile()) {
        results.push({ relative: relPath, absolute: absPath, isDir: false });
      }
    }
  }

  scan(dirPath);
  return results;
}
