/**
 * Zero-dependency sitemap.xml generator (Replaces sitemap).
 */
import { escapeXml } from './rss.js';

export function buildSitemap(siteConfig, pages) {
  const baseUrl = (siteConfig.baseUrl || 'http://localhost:3000').replace(/\/$/, '');

  let urlsXml = '';
  for (const page of pages) {
    const loc = `${baseUrl}${page.url}`;
    urlsXml += `  <url>
    <loc>${escapeXml(loc)}</loc>
  </url>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
\n${urlsXml}</urlset>`;
}
