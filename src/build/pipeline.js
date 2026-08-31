/**
 * Zero-dependency static site build pipeline.
 */
import fs from 'node:fs';
import path from 'node:path';
import { walkDir } from './walk.js';
import { loadConfig } from '../config/load.js';
import { parseFrontmatter } from '../frontmatter/parse.js';
import { renderMarkdown } from '../markdown/render.js';
import { renderTemplate } from '../template/engine.js';
import { PartialsRegistry } from '../template/partials.js';
import { highlightCode } from '../highlight/tokenizer.js';
import { probeImageFile } from '../media/image-probe.js';
import { buildSearchIndex } from '../search/index-builder.js';
import { CLIENT_SEARCH_WIDGET_JS } from '../search/client-widget.js';
import { buildRssFeed } from '../feed/rss.js';
import { buildAtomFeed } from '../feed/atom.js';
import { buildSitemap } from '../feed/sitemap.js';
import { minifyHtml } from '../minify/html.js';
import { minifyCss } from '../minify/css.js';
import { minifyJs } from '../minify/js.js';

export function buildSite(options = {}) {
  const startTime = Date.now();
  const srcDir = path.resolve(options.src || './examples/demo-site');
  const outDir = path.resolve(options.out || './dist');
  const includeDrafts = Boolean(options.drafts);
  const doMinify = Boolean(options.minify);

  if (!fs.existsSync(srcDir)) {
    throw new Error(`Source directory does not exist: ${srcDir}`);
  }

  // Ensure output dir is clean
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  const config = loadConfig(srcDir);

  // Load template layouts & partials if present in _layouts or _partials
  const layoutsDir = path.join(srcDir, '_layouts');
  const partialsDir = path.join(srcDir, '_partials');

  const partialsRegistry = new PartialsRegistry();
  if (fs.existsSync(partialsDir)) {
    partialsRegistry.loadFromDir(partialsDir);
  }

  const allEntries = walkDir(srcDir);
  const pages = [];
  let totalAssets = 0;

  // First pass: Process Markdown pages
  for (const entry of allEntries) {
    if (entry.isDir) continue;

    // Ignore template directories
    if (entry.relative.startsWith('_layouts/') || entry.relative.startsWith('_partials/')) {
      continue;
    }

    if (entry.relative === 'mysite.config.json') continue;

    if (entry.relative.endsWith('.md')) {
      const rawText = fs.readFileSync(entry.absolute, 'utf8');
      const { data, content } = parseFrontmatter(rawText);

      if (data.draft && !includeDrafts) {
        continue;
      }

      // Highlighting & Image Probing options
      let bodyHtml = renderMarkdown(content, {
        highlight: options.highlightFn || highlightCode
      });

      // Auto-inject width and height for local images
      bodyHtml = bodyHtml.replace(/<img\s+([^>]*)\/?>/gi, (match, attrs) => {
        if (!attrs.includes('width=') && !attrs.includes('http://') && !attrs.includes('https://')) {
          const srcMatch = /src=["']([^"']+)["']/i.exec(attrs);
          if (srcMatch) {
            const src = srcMatch[1];
            const imgAbsPath = path.join(srcDir, src.startsWith('/') ? src.slice(1) : src);
            const dims = probeImageFile(imgAbsPath);
            if (dims) {
              return match.replace(/\/?>$/, ` width="${dims.width}" height="${dims.height}" />`);
            }
          }
        }
        return match;
      });

      // Target path: post.md -> post.html or post/index.html
      let relHtmlPath = entry.relative.replace(/\.md$/, '.html');

      const pageObj = {
        title: data.title || path.basename(entry.relative, '.md'),
        date: data.date || '',
        description: data.description || '',
        layout: data.layout || 'default',
        frontmatter: data,
        contentHtml: bodyHtml,
        relPath: relHtmlPath,
        url: '/' + relHtmlPath.replace(/\\/g, '/').replace(/index\.html$/, '')
      };

      pages.push(pageObj);
    }
  }

  // Second pass: Render HTML pages using templates & write to outDir
  for (const page of pages) {
    let finalHtml = '';
    const layoutPath = path.join(layoutsDir, `${page.layout}.html`);

    const pageContext = {
      site: config,
      page,
      content: page.contentHtml
    };

    if (fs.existsSync(layoutPath)) {
      const layoutTpl = fs.readFileSync(layoutPath, 'utf8');
      finalHtml = renderTemplate(layoutTpl, pageContext, partialsRegistry);
    } else {
      // Clean zero-dep default HTML5 layout
      finalHtml = getDefaultLayout(pageContext);
    }

    // Live Reload Script Injection if enabled
    if (options.liveReloadScript) {
      finalHtml = finalHtml.replace('</body>', `${options.liveReloadScript}\n</body>`);
    }

    // Minification step
    if (doMinify) {
      finalHtml = minifyHtml(finalHtml);
    }

    const destPath = path.join(outDir, page.relPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, finalHtml, 'utf8');
  }

  // Third pass: Copy static non-markdown asset files (with optional CSS/JS minification)
  for (const entry of allEntries) {
    if (entry.isDir) continue;
    if (entry.relative.startsWith('_layouts/') || entry.relative.startsWith('_partials/')) continue;
    if (entry.relative === 'mysite.config.json') continue;
    if (entry.relative.endsWith('.md')) continue;

    const destPath = path.join(outDir, entry.relative);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    if (doMinify && entry.relative.endsWith('.css')) {
      const cssContent = fs.readFileSync(entry.absolute, 'utf8');
      fs.writeFileSync(destPath, minifyCss(cssContent), 'utf8');
    } else if (doMinify && entry.relative.endsWith('.js')) {
      const jsContent = fs.readFileSync(entry.absolute, 'utf8');
      fs.writeFileSync(destPath, minifyJs(jsContent), 'utf8');
    } else {
      fs.copyFileSync(entry.absolute, destPath);
    }
    totalAssets++;
  }

  // Fourth pass: Emit Search Index, Feeds, and Sitemap
  const searchIndex = buildSearchIndex(pages);
  fs.writeFileSync(path.join(outDir, 'search-index.json'), JSON.stringify(searchIndex), 'utf8');
  fs.writeFileSync(path.join(outDir, 'mysite-search.js'), doMinify ? minifyJs(CLIENT_SEARCH_WIDGET_JS) : CLIENT_SEARCH_WIDGET_JS, 'utf8');

  const rssFeed = buildRssFeed(config, pages, options);
  fs.writeFileSync(path.join(outDir, 'rss.xml'), rssFeed, 'utf8');

  const atomFeed = buildAtomFeed(config, pages, options);
  fs.writeFileSync(path.join(outDir, 'atom.xml'), atomFeed, 'utf8');

  const sitemapXml = buildSitemap(config, pages);
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemapXml, 'utf8');

  const durationMs = Date.now() - startTime;
  return {
    totalPages: pages.length,
    totalAssets,
    durationMs,
    outDir,
    pages,
    config
  };
}

function getDefaultLayout(ctx) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(ctx.page.title)} | ${escapeHtml(ctx.site.title)}</title>
  <meta name="description" content="${escapeHtml(ctx.page.description || ctx.site.description)}">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem 1rem; color: #222; }
    header nav a { margin-right: 1rem; text-decoration: none; color: #0066cc; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background: #f4f4f4; }
    blockquote { border-left: 4px solid #0066cc; margin: 0; padding-left: 1rem; color: #555; }
    pre { background: #282c34; color: #abb2bf; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    code { font-family: monospace; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(ctx.site.title)}</h1>
    <nav>
      <a href="/">Home</a>
    </nav>
    <hr />
  </header>
  <main>
    <h2>${escapeHtml(ctx.page.title)}</h2>
    ${ctx.content}
  </main>
  <footer>
    <hr />
    <p>&copy; 2026 ${escapeHtml(ctx.site.author)}</p>
  </footer>
</body>
</html>`;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
