/**
 * Zero-dependency Accessibility & Quality Linter.
 */
import fs from 'node:fs';
import path from 'node:path';
import colors from '../cli/colors.js';
import { walkDir } from '../build/walk.js';
import { checkLinks } from './link-checker.js';

export function runLinter(options = {}) {
  const srcDir = path.resolve(options.src || './examples/demo-site');
  const outDir = path.resolve(options.out || './dist');

  console.log(colors.cyan(colors.bold(`Running accessibility & link linter on ${srcDir}...`)));

  const htmlFiles = walkDir(outDir).filter((f) => !f.isDir && f.relative.endsWith('.html'));

  if (htmlFiles.length === 0) {
    console.warn(colors.yellow('No HTML files found in output directory. Make sure to run `mysite build` first.'));
    return;
  }

  let totalWarnings = 0;
  let totalErrors = 0;

  const BAD_LINK_TEXT = new Set(['click here', 'here', 'read more', 'link', 'more', 'info']);

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file.absolute, 'utf8');

    // 1. Missing lang attribute on <html>
    if (!/<html[^>]*lang=["'][^"']+["']/i.test(html)) {
      console.warn(colors.yellow(`[a11y] ${file.relative}: Missing or empty <html lang="..."> attribute.`));
      totalWarnings++;
    }

    // 2. Missing or empty alt attribute on <img>
    const imgRegex = /<img\s+([^>]*)\/?>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      const attrs = imgMatch[1];
      const altMatch = /\balt\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/i.exec(attrs);
      if (!altMatch || (altMatch[1] !== undefined && altMatch[1].trim() === '') || (altMatch[2] !== undefined && altMatch[2].trim() === '')) {
        console.warn(colors.yellow(`[a11y] ${file.relative}: Image missing or empty alt attribute: ${imgMatch[0]}`));
        totalWarnings++;
      }
    }

    // 3. Skipped heading levels
    const headingRegex = /<h([1-6])[^>]*>/gi;
    let hMatch;
    let lastLevel = 0;
    while ((hMatch = headingRegex.exec(html)) !== null) {
      const level = Number(hMatch[1]);
      if (lastLevel > 0 && level > lastLevel + 1) {
        console.warn(
          colors.yellow(
            `[a11y] ${file.relative}: Skipped heading level from h${lastLevel} to h${level}.`
          )
        );
        totalWarnings++;
      }
      lastLevel = level;
    }

    // 4. Non-descriptive link text
    const linkRegex = /<a[^>]*>(.*?)<\/a>/gi;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const text = linkMatch[1].replace(/<[^>]+>/g, '').trim().toLowerCase();
      if (BAD_LINK_TEXT.has(text)) {
        console.warn(colors.yellow(`[a11y] ${file.relative}: Non-descriptive link text "${linkMatch[1]}".`));
        totalWarnings++;
      }
    }
  }

  // Run broken link check
  const linkReport = checkLinks(outDir, htmlFiles);
  totalErrors += linkReport.brokenInternalCount;

  console.log(colors.bold('\n--- Linter Summary ---'));
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(colors.green('✓ All accessibility & link checks passed with zero issues!'));
  } else {
    console.log(colors.yellow(`Warnings: ${totalWarnings}, Errors: ${totalErrors}`));
  }
}
