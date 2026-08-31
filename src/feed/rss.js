/**
 * Zero-dependency RSS 2.0 XML feed generator (Replaces feed).
 */
export function buildRssFeed(siteConfig, pages, options = {}) {
  const baseUrl = (siteConfig.baseUrl || 'http://localhost:3000').replace(/\/$/, '');
  const buildDate = options.withTimestamp ? new Date().toUTCString() : 'Thu, 01 Jan 1970 00:00:00 GMT';

  let itemsXml = '';
  for (const page of pages) {
    const link = `${baseUrl}${page.url}`;
    itemsXml += `    <item>
      <title>${escapeXml(page.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <description>${escapeXml(page.description || page.title)}</description>
    </item>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <lastBuildDate>${buildDate}</lastBuildDate>
\n${itemsXml}  </channel>
</rss>`;
}

export function escapeXml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
