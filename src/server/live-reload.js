/**
 * Zero-dependency Live Reload server module via Server-Sent Events (SSE) and fs.watch.
 * (Replaces chokidar / browser-sync / live-server).
 */
import fs from 'node:fs';
import path from 'node:path';

export const LIVE_RELOAD_PATH = '/__livereload';

export const LIVE_RELOAD_SCRIPT = `
<!-- mysite Live Reload -->
<script>
(function() {
  var es = new EventSource('${LIVE_RELOAD_PATH}');
  es.onmessage = function(e) {
    if (e.data === 'reload') {
      console.log('[mysite] Live reload triggered, refreshing...');
      window.location.reload();
    }
  };
  es.onerror = function() {
    console.warn('[mysite] Live reload connection lost. Retrying...');
  };
})();
</script>
`;

export class LiveReloadServer {
  constructor() {
    this.clients = new Set();
  }

  handleSSE(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    res.write('data: connected\n\n');
    this.clients.add(res);

    req.on('close', () => {
      this.clients.delete(res);
    });
  }

  notifyReload() {
    for (const client of this.clients) {
      try {
        client.write('data: reload\n\n');
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  watchDirectory(dirPath, onChangeCallback) {
    if (!fs.existsSync(dirPath)) return;

    let debounceTimer = null;

    try {
      fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        // Ignore dist folder or temporary hidden files
        if (filename.startsWith('dist') || filename.startsWith('.')) return;

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          console.log(`[watch] File change detected: ${filename} (${eventType}). Rebuilding...`);
          try {
            onChangeCallback();
            this.notifyReload();
          } catch (err) {
            console.error(`[watch] Rebuild error: ${err.message}`);
          }
        }, 150);
      });
    } catch (err) {
      console.warn(`[watch] Recursive watch failed: ${err.message}. Falling back.`);
    }
  }
}
