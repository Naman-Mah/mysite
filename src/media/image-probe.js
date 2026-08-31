/**
 * Zero-dependency binary image header parser (Replaces image-size / probe-image-size).
 * Supports PNG, JPEG, GIF, and WebP format dimension probing without decoding pixels.
 */
import fs from 'node:fs';

export function probeImageFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  return probeImage(buffer);
}

export function probeImage(buf) {
  if (!buf || buf.length < 10) return null;

  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    if (buf.length >= 24) {
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      return { type: 'png', width, height };
    }
  }

  // GIF
  if (
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    (buf[3] === 0x38 && (buf[4] === 0x37 || buf[4] === 0x39) && buf[5] === 0x61)
  ) {
    if (buf.length >= 10) {
      const width = buf.readUInt16LE(6);
      const height = buf.readUInt16LE(8);
      return { type: 'gif', width, height };
    }
  }

  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    let offset = 2;
    while (offset < buf.length) {
      if (buf[offset] !== 0xff) break;
      const marker = buf[offset + 1];
      offset += 2;

      // Standalone markers without length
      if (marker === 0xd8 || marker === 0xd9) continue;

      if (offset + 2 > buf.length) break;
      const length = buf.readUInt16BE(offset);

      // SOF0..SOF15 markers (excluding DHT, DAC)
      const isSOF =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf);

      if (isSOF) {
        if (offset + 7 <= buf.length) {
          const height = buf.readUInt16BE(offset + 3);
          const width = buf.readUInt16BE(offset + 5);
          return { type: 'jpeg', width, height };
        }
      }

      offset += length;
    }
  }

  // WebP
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    const chunkType = buf.toString('ascii', 12, 16);

    if (chunkType === 'VP8 ' && buf.length >= 30) {
      const width = (buf.readUInt16LE(26) & 0x3fff);
      const height = (buf.readUInt16LE(28) & 0x3fff);
      return { type: 'webp', width, height };
    }

    if (chunkType === 'VP8L' && buf.length >= 25) {
      const bits = buf.readUInt32LE(21);
      const width = (bits & 0x3fff) + 1;
      const height = ((bits >> 14) & 0x3fff) + 1;
      return { type: 'webp', width, height };
    }

    if (chunkType === 'VP8X' && buf.length >= 30) {
      const width = (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1;
      const height = (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1;
      return { type: 'webp', width, height };
    }
  }

  return null;
}
