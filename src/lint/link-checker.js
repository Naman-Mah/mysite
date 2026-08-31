/**
 * Zero-dependency broken link checker module (Replaces broken-link-checker).
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import colors from '../cli/colors.js';

export function checkLinks(outDir, htmlFiles) {
  let brokenInternalCount = 0;
  const internalLinks = [];
  const externalLinks = new Set();

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file.absolute, 'utf8');
    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1].trim();

      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
        continue;
      }

      if (href.startsWith('http://') || href.startsWith('https://')) {
        externalLinks.add(href);
      } else {
        internalLinks.push({ sourceFile: file.relative, href });
      }
    }
  }

  // Verify internal links
  for (const link of internalLinks) {
    const [urlPath, anchor] = link.href.split('#');
    if (!urlPath && anchor) continue;

    let targetPath = '';
    if (urlPath.startsWith('/')) {
      targetPath = path.join(outDir, urlPath.slice(1));
    } else {
      const sourceDir = path.dirname(path.join(outDir, link.sourceFile));
      targetPath = path.join(sourceDir, urlPath);
    }

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
      targetPath = path.join(targetPath, 'index.html');
    }

    if (!fs.existsSync(targetPath) && !fs.existsSync(targetPath + '.html')) {
      console.error(colors.red(`[link-checker] Broken internal link in ${link.sourceFile}: href="${link.href}" -> ${targetPath} not found.`));
      brokenInternalCount++;
    }
  }

  return {
    internalChecked: internalLinks.length,
    externalChecked: externalLinks.size,
    brokenInternalCount
  };
}

export function checkExternalLink(url, timeoutMs = 3000) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const transport = parsed.protocol === 'https:' ? https : http;

      const req = transport.request(
        url,
        { method: 'HEAD', timeout: timeoutMs, headers: { 'User-Agent': 'mysite-link-checker/1.0' } },
        (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve({ url, ok: true, status: res.statusCode });
          } else {
            resolve({ url, ok: false, status: res.statusCode });
          }
        }
      );

      req.on('error', (err) => resolve({ url, ok: false, error: err.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ url, ok: false, error: 'timeout' });
      });
      req.end();
    } catch (err) {
      resolve({ url, ok: false, error: err.message });
    }
  });
}
