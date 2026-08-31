/**
 * Zero-dependency template engine (Replaces Handlebars / EJS / Nunjucks).
 */
import { escapeHtml } from '../markdown/inline.js';

export function renderTemplate(template, context = {}, partialsRegistry = null) {
  const tokens = tokenizeTemplate(template);
  return renderTokens(tokens, context, partialsRegistry);
}

function tokenizeTemplate(src) {
  const tokens = [];
  let pos = 0;

  while (pos < src.length) {
    const openIdx = src.indexOf('{{', pos);
    if (openIdx === -1) {
      tokens.push({ type: 'text', value: src.slice(pos) });
      break;
    }

    if (openIdx > pos) {
      tokens.push({ type: 'text', value: src.slice(pos, openIdx) });
    }

    const isRaw = src.startsWith('{{{', openIdx);
    const closeSeq = isRaw ? '}}}' : '}}';
    const closeIdx = src.indexOf(closeSeq, openIdx);

    if (closeIdx === -1) {
      tokens.push({ type: 'text', value: src.slice(openIdx) });
      break;
    }

    const tagContent = src.slice(openIdx + (isRaw ? 3 : 2), closeIdx).trim();
    pos = closeIdx + closeSeq.length;

    if (tagContent.startsWith('#if ')) {
      tokens.push({ type: 'if_open', expr: tagContent.slice(4).trim() });
    } else if (tagContent === 'else') {
      tokens.push({ type: 'else' });
    } else if (tagContent === '/if') {
      tokens.push({ type: 'if_close' });
    } else if (tagContent.startsWith('#each ')) {
      tokens.push({ type: 'each_open', expr: tagContent.slice(6).trim() });
    } else if (tagContent === '/each') {
      tokens.push({ type: 'each_close' });
    } else if (tagContent.startsWith('> ')) {
      tokens.push({ type: 'partial', name: tagContent.slice(2).trim() });
    } else {
      tokens.push({ type: 'var', expr: tagContent, raw: isRaw });
    }
  }

  return tokens;
}

function renderTokens(tokens, context, partialsRegistry) {
  let output = '';
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === 'text') {
      output += token.value;
      i++;
    } else if (token.type === 'var') {
      const val = getPathValue(context, token.expr);
      const strVal = val !== undefined && val !== null ? String(val) : '';
      output += token.raw ? strVal : escapeHtml(strVal);
      i++;
    } else if (token.type === 'partial') {
      if (partialsRegistry) {
        const partialTpl = partialsRegistry.get(token.name);
        if (partialTpl) {
          output += renderTemplate(partialTpl, context, partialsRegistry);
        }
      }
      i++;
    } else if (token.type === 'if_open') {
      const condVal = getPathValue(context, token.expr);
      const isTrue = isTruthy(condVal);

      let depth = 1;
      let elseIdx = -1;
      let closeIdx = -1;

      for (let j = i + 1; j < tokens.length; j++) {
        if (tokens[j].type === 'if_open') depth++;
        else if (tokens[j].type === 'if_close') {
          depth--;
          if (depth === 0) {
            closeIdx = j;
            break;
          }
        } else if (tokens[j].type === 'else' && depth === 1) {
          elseIdx = j;
        }
      }

      if (closeIdx === -1) {
        i++;
        continue;
      }

      let subTokens = [];
      if (isTrue) {
        const end = elseIdx !== -1 ? elseIdx : closeIdx;
        subTokens = tokens.slice(i + 1, end);
      } else if (elseIdx !== -1) {
        subTokens = tokens.slice(elseIdx + 1, closeIdx);
      }

      output += renderTokens(subTokens, context, partialsRegistry);
      i = closeIdx + 1;
    } else if (token.type === 'each_open') {
      const listVal = getPathValue(context, token.expr);

      let depth = 1;
      let closeIdx = -1;

      for (let j = i + 1; j < tokens.length; j++) {
        if (tokens[j].type === 'each_open') depth++;
        else if (tokens[j].type === 'each_close') {
          depth--;
          if (depth === 0) {
            closeIdx = j;
            break;
          }
        }
      }

      if (closeIdx === -1) {
        i++;
        continue;
      }

      const bodyTokens = tokens.slice(i + 1, closeIdx);

      if (Array.isArray(listVal)) {
        for (let idx = 0; idx < listVal.length; idx++) {
          const item = listVal[idx];
          const itemCtx = typeof item === 'object' && item !== null
            ? { ...context, ...item, this: item, '@index': idx }
            : { ...context, this: item, '@index': idx };
          output += renderTokens(bodyTokens, itemCtx, partialsRegistry);
        }
      }

      i = closeIdx + 1;
    } else {
      i++;
    }
  }

  return output;
}

function getPathValue(obj, pathStr) {
  if (!pathStr) return obj;
  if (pathStr === 'this') return obj.this !== undefined ? obj.this : obj;

  const parts = pathStr.split('.');
  let curr = obj;

  for (const part of parts) {
    if (curr === null || curr === undefined) return undefined;
    curr = curr[part];
  }

  return curr;
}

function isTruthy(val) {
  if (!val) return false;
  if (Array.isArray(val)) return val.length > 0;
  return true;
}
