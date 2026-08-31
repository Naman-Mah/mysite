/**
 * Zero-dependency SHA-256 content hasher for reproducible build verification.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { walkDir } from './walk.js';

export function hashString(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

export function hashBuffer(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export function hashDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return '';

  const files = walkDir(dirPath).filter((f) => !f.isDir);
  const hasher = crypto.createHash('sha256');

  for (const file of files) {
    const relPath = file.relative.replace(/\\/g, '/');
    const content = fs.readFileSync(file.absolute);
    hasher.update(`${relPath}:${content.length}:`);
    hasher.update(content);
    hasher.update('\n');
  }

  return hasher.digest('hex');
}
