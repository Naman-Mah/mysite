/**
 * Zero-dependency static file server module (Replaces Express / Serve).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import colors from '../cli/colors.js';
import { buildSite } from '../build/pipeline.js';
import { LiveReloadServer, LIVE_RELOAD_PATH, LIVE_RELOAD_SCRIPT } from './live-reload.js';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

export function startServer(options = {}) {
  const port = options.port || 3000;
  const srcDir = path.resolve(options.src || './examples/demo-site');
  const outDir = path.resolve(options.out || './dist');

  const liveReloadServer = new LiveReloadServer();

  // Perform initial build with live reload script injected
  console.log(colors.cyan('Building site for dev server...'));
  buildSite({
    ...options,
    src: srcDir,
    out: outDir,
    liveReloadScript: LIVE_RELOAD_SCRIPT
  });

  // Start watching content source directory
  liveReloadServer.watchDirectory(srcDir, () => {
    buildSite({
      ...options,
      src: srcDir,
      out: outDir,
      liveReloadScript: LIVE_RELOAD_SCRIPT
    });
  });

  const server = http.createServer((req, res) => {
    const urlPath = req.url ? req.url.split('?')[0] : '/';

    // Handle Live Reload SSE endpoint
    if (urlPath === LIVE_RELOAD_PATH) {
      liveReloadServer.handleSSE(req, res);
      return;
    }

    let filePath = path.join(outDir, decodeURIComponent(urlPath));

    // Handle directory index resolution
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    // Try appending .html if extension omitted
    if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      const notFoundPath = path.join(outDir, '404.html');
      if (fs.existsSync(notFoundPath)) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(notFoundPath));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stat = fs.statSync(filePath);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });

  server.listen(port, () => {
    console.log(colors.green(`\n✓ mysite dev server running at http://localhost:${port}`));
    console.log(colors.gray(`  Serving from: ${outDir}`));
    console.log(colors.gray('  Live reload active. Press Ctrl+C to stop.\n'));
  });

  return server;
}
