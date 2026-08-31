/**
 * Zero-dependency safe JS minifier (Replaces terser).
 * Safe comment & line whitespace stripper (non-mangling).
 */
export function minifyJs(js) {
  if (typeof js !== 'string') return '';

  const lines = js.split('\n');
  const cleaned = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;
    // Strip trailing single line comments if not in string
    const commentIdx = trimmed.indexOf('//');
    if (commentIdx !== -1 && !trimmed.includes('"//') && !trimmed.includes("'//")) {
      cleaned.push(trimmed.slice(0, commentIdx).trim());
    } else {
      cleaned.push(trimmed);
    }
  }

  return cleaned.join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
}
