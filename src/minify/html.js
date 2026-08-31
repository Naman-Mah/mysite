/**
 * Zero-dependency HTML minifier (Replaces html-minifier-terser).
 */
export function minifyHtml(html) {
  if (typeof html !== 'string') return '';

  // Preserve pre and code blocks
  const preserved = [];
  let placeholderCount = 0;

  let processed = html.replace(/<(pre|code|textarea)[\s\S]*?<\/\1>/gi, (match) => {
    const key = `___PRESERVED_BLOCK_${placeholderCount++}___`;
    preserved.push({ key, content: match });
    return key;
  });

  // Remove HTML comments (except SSI/conditional comments)
  processed = processed.replace(/<!--(?!\[if)[\s\S]*?-->/g, '');

  // Collapse whitespace between tags and words
  processed = processed
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .trim();

  // Restore preserved pre/code blocks
  for (const item of preserved) {
    processed = processed.replace(item.key, item.content);
  }

  return processed;
}
