/**
 * Zero-dependency Atom 1.0 XML feed generator.
 */
import { escapeXml } from './rss.js';

export function buildAtomFeed(siteConfig, pages, options = {}) {
  const baseUrl = (siteConfig.baseUrl || 'http://localhost:3000').replace(/\/$/, '');
  const updatedDate = options.withTimestamp ? new Date().toISOString() : '1970-01-01T00:00:00.000Z';

  let entriesXml = '';
  for (const page of pages) {
    const link = `${baseUrl}${page.url}`;
    entriesXml += `  <entry>
    <title>${escapeXml(page.title)}</title>
    <link href="${escapeXml(link)}"/>
    <id>${escapeXml(link)}</id>
    <updated>${updatedDate}</updated>
    <summary>${escapeXml(page.description || page.title)}</summary>
  </entry>\n`;
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteConfig.title)}</title>
  <link href="${escapeXml(baseUrl)}"/>
  <updated>${updatedDate}</updated>
  <id>${escapeXml(baseUrl)}/</id>
\n${entriesXml}</feed>`;
}
