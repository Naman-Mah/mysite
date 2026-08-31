/**
 * Zero-dependency ANSI color formatter (Replaces chalk / picocolors).
 */
const useColor = !process.env.NO_COLOR && (process.stdout ? process.stdout.isTTY !== false : true);

function format(code, closeCode, str) {
  if (!useColor) return String(str);
  return `\x1b[${code}m${str}\x1b[${closeCode}m`;
}

export const red = (s) => format(31, 39, s);
export const green = (s) => format(32, 39, s);
export const yellow = (s) => format(33, 39, s);
export const blue = (s) => format(34, 39, s);
export const magenta = (s) => format(35, 39, s);
export const cyan = (s) => format(36, 39, s);
export const gray = (s) => format(90, 39, s);
export const bold = (s) => format(1, 22, s);
export const dim = (s) => format(2, 22, s);

export default {
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  gray,
  bold,
  dim
};
