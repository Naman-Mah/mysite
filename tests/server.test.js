import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { LiveReloadServer, LIVE_RELOAD_PATH } from '../src/server/live-reload.js';

test('Server: LiveReloadServer SSE endpoint responds with text/event-stream', async () => {
  const liveReload = new LiveReloadServer();

  const server = http.createServer((req, res) => {
    if (req.url === LIVE_RELOAD_PATH) {
      liveReload.handleSSE(req, res);
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    const res = await new Promise((resolve, reject) => {
      const req = http.get(`http://127.0.0.1:${port}${LIVE_RELOAD_PATH}`, (res) => {
        resolve(res);
      });
      req.on('error', reject);
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['content-type'], 'text/event-stream');
    assert.equal(res.headers['connection'], 'keep-alive');
    res.destroy();
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
