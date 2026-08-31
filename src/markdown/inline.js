/**
 * Zero-dependency Markdown inline parser & renderer.
 */

export function parseInline(text, linkDefs = {}) {
  if (!text) return '';

  let html = '';
  let i = 0;

  while (i < text.length) {
    // Escaped character: \x
    if (text[i] === '\\' && i + 1 < text.length) {
      html += escapeHtml(text[i + 1]);
      i += 2;
      continue;
    }

    // Inline Code: `code`
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        const codeContent = text.slice(i + 1, end);
        html += `<code>${escapeHtml(codeContent)}</code>`;
        i = end + 1;
        continue;
      }
    }

    // Strikethrough: ~~text~~
    if (text.startsWith('~~', i)) {
      const end = text.indexOf('~~', i + 2);
      if (end !== -1) {
        const inner = text.slice(i + 2, end);
        html += `<del>${parseInline(inner, linkDefs)}</del>`;
        i = end + 2;
        continue;
      }
    }

    // Bold: **text** or __text__
    if (text.startsWith('**', i) || text.startsWith('__', i)) {
      const delim = text.slice(i, i + 2);
      const end = text.indexOf(delim, i + 2);
      if (end !== -1) {
        const inner = text.slice(i + 2, end);
        html += `<strong>${parseInline(inner, linkDefs)}</strong>`;
        i = end + 2;
        continue;
      }
    }

    // Italic: *text* or _text_
    if ((text[i] === '*' || text[i] === '_') && text[i + 1] !== text[i]) {
      const delim = text[i];
      // Simple lookahead for matching delim
      const end = text.indexOf(delim, i + 1);
      if (end !== -1 && text[end - 1] !== ' ') {
        const inner = text.slice(i + 1, end);
        html += `<em>${parseInline(inner, linkDefs)}</em>`;
        i = end + 1;
        continue;
      }
    }

    // Image: ![alt](url "title") or ![alt][ref]
    if (text.startsWith('![', i)) {
      const closeBracket = findMatchingBracket(text, i + 1);
      if (closeBracket !== -1) {
        const altText = text.slice(i + 2, closeBracket);
        let nextCharIdx = closeBracket + 1;

        if (text[nextCharIdx] === '(') {
          const closeParen = text.indexOf(')', nextCharIdx + 1);
          if (closeParen !== -1) {
            const rawTarget = text.slice(nextCharIdx + 1, closeParen).trim();
            const { url, title } = parseUrlAndTitle(rawTarget);
            const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
            html += `<img src="${escapeHtml(url)}" alt="${escapeHtml(altText)}"${titleAttr} />`;
            i = closeParen + 1;
            continue;
          }
        } else if (text[nextCharIdx] === '[') {
          const closeRef = text.indexOf(']', nextCharIdx + 1);
          if (closeRef !== -1) {
            const refKey = (text.slice(nextCharIdx + 1, closeRef) || altText).toLowerCase();
            const def = linkDefs[refKey];
            if (def) {
              const titleAttr = def.title ? ` title="${escapeHtml(def.title)}"` : '';
              html += `<img src="${escapeHtml(def.href)}" alt="${escapeHtml(altText)}"${titleAttr} />`;
            } else {
              html += escapeHtml(text.slice(i, closeRef + 1));
            }
            i = closeRef + 1;
            continue;
          }
        }
      }
    }

    // Link: [text](url "title") or [text][ref]
    if (text[i] === '[') {
      const closeBracket = findMatchingBracket(text, i);
      if (closeBracket !== -1) {
        const linkText = text.slice(i + 1, closeBracket);
        let nextCharIdx = closeBracket + 1;

        if (text[nextCharIdx] === '(') {
          const closeParen = findMatchingParen(text, nextCharIdx);
          if (closeParen !== -1) {
            const rawTarget = text.slice(nextCharIdx + 1, closeParen).trim();
            const { url, title } = parseUrlAndTitle(rawTarget);
            const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
            html += `<a href="${escapeHtml(url)}"${titleAttr}>${parseInline(linkText, linkDefs)}</a>`;
            i = closeParen + 1;
            continue;
          }
        } else if (text[nextCharIdx] === '[') {
          const closeRef = text.indexOf(']', nextCharIdx + 1);
          if (closeRef !== -1) {
            const refKey = (text.slice(nextCharIdx + 1, closeRef) || linkText).toLowerCase();
            const def = linkDefs[refKey];
            if (def) {
              const titleAttr = def.title ? ` title="${escapeHtml(def.title)}"` : '';
              html += `<a href="${escapeHtml(def.href)}"${titleAttr}>${parseInline(linkText, linkDefs)}</a>`;
            } else {
              html += escapeHtml(text.slice(i, closeRef + 1));
            }
            i = closeRef + 1;
            continue;
          }
        }
      }
    }

    // Autolink or Raw HTML tag
    if (text[i] === '<') {
      const closeAngle = text.indexOf('>', i + 1);
      if (closeAngle !== -1) {
        const content = text.slice(i + 1, closeAngle);
        if (/^https?:\/\//i.test(content) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content)) {
          const href = content.includes('@') && !content.startsWith('mailto:') ? `mailto:${content}` : content;
          html += `<a href="${escapeHtml(href)}">${escapeHtml(content)}</a>`;
          i = closeAngle + 1;
          continue;
        }
      }

      // Raw HTML tag pass-through (e.g. <img ... />, <a ...>, etc.)
      const htmlTagMatch = text.slice(i).match(/^<(\/?[\w-]+)(?:\s+[^>]*|\s*)\/?>/);
      if (htmlTagMatch) {
        const fullTag = htmlTagMatch[0];
        html += fullTag;
        i += fullTag.length;
        continue;
      }
    }

    html += escapeHtml(text[i]);
    i++;
  }

  return html;
}

export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function findMatchingBracket(str, startIdx) {
  let depth = 0;
  for (let i = startIdx; i < str.length; i++) {
    if (str[i] === '[') depth++;
    else if (str[i] === ']') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function findMatchingParen(str, startIdx) {
  let depth = 0;
  for (let i = startIdx; i < str.length; i++) {
    if (str[i] === '(') depth++;
    else if (str[i] === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function parseUrlAndTitle(target) {
  const match = target.match(/^(\S+)(?:\s+["'(]([^"'(]+)["')])?$/);
  if (match) {
    return { url: match[1], title: match[2] || '' };
  }
  return { url: target, title: '' };
}
