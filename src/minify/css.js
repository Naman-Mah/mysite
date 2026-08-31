/**
 * Zero-dependency CSS minifier (Replaces csso / clean-css).
 */
export function minifyCss(css) {
  if (typeof css !== 'string') return '';

  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse spaces
    .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around delimiters
    .replace(/;\}/g, '}') // Remove trailing semicolons before closing brace
    .trim();
}
