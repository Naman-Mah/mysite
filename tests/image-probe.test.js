import test from 'node:test';
import assert from 'node:assert/strict';
import { probeImage } from '../src/media/image-probe.js';

test('Image Probe: PNG header parsing', () => {
  // Minimal PNG header buffer (Width: 640, Height: 480)
  const buf = Buffer.alloc(30);
  buf.write('\x89PNG\r\n\x1a\n', 0, 'binary');
  buf.writeUInt32BE(640, 16);
  buf.writeUInt32BE(480, 20);

  const res = probeImage(buf);
  assert.equal(res.type, 'png');
  assert.equal(res.width, 640);
  assert.equal(res.height, 480);
});

test('Image Probe: GIF header parsing', () => {
  // Minimal GIF header buffer (Width: 320, Height: 240)
  const buf = Buffer.alloc(12);
  buf.write('GIF89a', 0, 'ascii');
  buf.writeUInt16LE(320, 6);
  buf.writeUInt16LE(240, 8);

  const res = probeImage(buf);
  assert.equal(res.type, 'gif');
  assert.equal(res.width, 320);
  assert.equal(res.height, 240);
});

test('Image Probe: JPEG header parsing', () => {
  // Minimal JPEG SOF0 marker buffer (Width: 800, Height: 600)
  const buf = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
    0xff, 0xc0, 0x00, 0x11, 0x08, 0x02, 0x58, 0x03, 0x20, 0x03, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01
  ]);
  // 0x02 0x58 = 600 height, 0x03 0x20 = 800 width

  const res = probeImage(buf);
  assert.equal(res.type, 'jpeg');
  assert.equal(res.width, 800);
  assert.equal(res.height, 600);
});

test('Image Probe: WebP header parsing', () => {
  // WebP VP8X header (Width: 1024, Height: 768)
  const buf = Buffer.alloc(32);
  buf.write('RIFF', 0, 'ascii');
  buf.write('WEBP', 8, 'ascii');
  buf.write('VP8X', 12, 'ascii');
  // VP8X width - 1 = 1023 (0x03FF), height - 1 = 767 (0x02FF)
  buf[24] = 0xff;
  buf[25] = 0x03;
  buf[26] = 0x00;
  buf[27] = 0xff;
  buf[28] = 0x02;
  buf[29] = 0x00;

  const res = probeImage(buf);
  assert.equal(res.type, 'webp');
  assert.equal(res.width, 1024);
  assert.equal(res.height, 768);
});
