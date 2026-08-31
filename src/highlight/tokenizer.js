/**
 * Zero-dependency state-machine & regex syntax highlighter.
 * (Replaces Highlight.js / Prism.js).
 * Supports ~6 common languages: JS, Python, Go, JSON, Bash, HTML.
 */
import { escapeHtml } from '../markdown/inline.js';

export function highlightCode(code, lang) {
  if (!code) return '';
  const language = (lang || '').toLowerCase().trim();

  switch (language) {
    case 'js':
    case 'javascript':
    case 'ts':
    case 'typescript':
      return highlightJs(code);
    case 'py':
    case 'python':
      return highlightPython(code);
    case 'go':
    case 'golang':
      return highlightGo(code);
    case 'json':
      return highlightJson(code);
    case 'bash':
    case 'sh':
    case 'zsh':
      return highlightBash(code);
    case 'html':
    case 'xml':
      return highlightHtml(code);
    default:
      return escapeHtml(code);
  }
}

function highlightJs(code) {
  const keywords = new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'do', 'switch', 'case', 'break', 'continue', 'import', 'export', 'default',
    'from', 'class', 'extends', 'new', 'try', 'catch', 'finally', 'throw', 'async',
    'await', 'yield', 'typeof', 'instanceof', 'void', 'delete', 'true', 'false', 'null', 'undefined'
  ]);

  const rules = [
    { type: 'hl-comment', regex: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/ },
    { type: 'hl-string', regex: /("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`)/ },
    { type: 'hl-number', regex: /\b(0x[0-9a-fA-F]+|\d+(\.\d+)?)\b/ },
    { type: 'hl-function', regex: /\b([a-zA-Z_$][\w$]*)(?=\s*\()/ },
    { type: 'hl-keyword', regex: /\b([a-zA-Z_$][\w$]*)\b/, filter: (w) => keywords.has(w) },
    { type: 'hl-operator', regex: /([=+\-*/%&|^!~<>?:]+)/ }
  ];

  return tokenizeRules(code, rules);
}

function highlightPython(code) {
  const keywords = new Set([
    'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'import', 'from',
    'as', 'try', 'except', 'finally', 'raise', 'with', 'lambda', 'pass', 'break',
    'continue', 'and', 'or', 'not', 'is', 'in', 'True', 'False', 'None', 'async', 'await'
  ]);

  const rules = [
    { type: 'hl-comment', regex: /(#[^\n]*)/ },
    { type: 'hl-string', regex: /("""[\s\S]*?"""|'''[\s\S]*?'''|"([^"\\]|\\.)*"|'([^'\\]|\\.)*')/ },
    { type: 'hl-number', regex: /\b\d+(\.\d+)?\b/ },
    { type: 'hl-function', regex: /\b([a-zA-Z_]\w*)(?=\s*\()/ },
    { type: 'hl-keyword', regex: /\b([a-zA-Z_]\w*)\b/, filter: (w) => keywords.has(w) }
  ];

  return tokenizeRules(code, rules);
}

function highlightGo(code) {
  const keywords = new Set([
    'func', 'package', 'import', 'return', 'if', 'else', 'for', 'range', 'switch',
    'case', 'struct', 'interface', 'type', 'var', 'const', 'map', 'chan', 'go', 'defer',
    'select', 'break', 'continue', 'true', 'false', 'nil'
  ]);

  const rules = [
    { type: 'hl-comment', regex: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/ },
    { type: 'hl-string', regex: /("([^"\\]|\\.)*"|`[^`]*`)/ },
    { type: 'hl-number', regex: /\b\d+(\.\d+)?\b/ },
    { type: 'hl-function', regex: /\b([a-zA-Z_]\w*)(?=\s*\()/ },
    { type: 'hl-keyword', regex: /\b([a-zA-Z_]\w*)\b/, filter: (w) => keywords.has(w) }
  ];

  return tokenizeRules(code, rules);
}

function highlightJson(code) {
  const rules = [
    { type: 'hl-string', regex: /("([^"\\]|\\.)*")(?=\s*:)/, overrideType: 'hl-attr' },
    { type: 'hl-string', regex: /("([^"\\]|\\.)*")/ },
    { type: 'hl-number', regex: /-?\b\d+(\.\d+)?\b/ },
    { type: 'hl-keyword', regex: /\b(true|false|null)\b/ }
  ];

  return tokenizeRules(code, rules);
}

function highlightBash(code) {
  const keywords = new Set(['if', 'then', 'else', 'fi', 'for', 'in', 'do', 'done', 'while', 'case', 'esac', 'function', 'return']);

  const rules = [
    { type: 'hl-comment', regex: /(#[^\n]*)/ },
    { type: 'hl-string', regex: /("([^"\\]|\\.)*"|'([^'\\]|\\.)*')/ },
    { type: 'hl-attr', regex: /(\$[a-zA-Z_]\w*|\$\{[^}]+\})/ },
    { type: 'hl-keyword', regex: /\b([a-zA-Z_]\w*)\b/, filter: (w) => keywords.has(w) }
  ];

  return tokenizeRules(code, rules);
}

function highlightHtml(code) {
  let html = '';
  let pos = 0;

  while (pos < code.length) {
    if (code.startsWith('<!--', pos)) {
      const end = code.indexOf('-->', pos + 4);
      const comment = end !== -1 ? code.slice(pos, end + 3) : code.slice(pos);
      html += `<span class="hl-comment">${escapeHtml(comment)}</span>`;
      pos += comment.length;
      continue;
    }

    if (code[pos] === '<') {
      const end = code.indexOf('>', pos + 1);
      if (end !== -1) {
        const tagContent = code.slice(pos, end + 1);
        html += formatTag(tagContent);
        pos = end + 1;
        continue;
      }
    }

    html += escapeHtml(code[pos]);
    pos++;
  }

  return html;
}

function formatTag(tagStr) {
  const match = tagStr.match(/^(<\/?[a-zA-Z0-9-]+)([\s\S]*?)(\/?>)$/);
  if (!match) return escapeHtml(tagStr);

  const [, open, attrs, close] = match;
  let formatted = `<span class="hl-tag">${escapeHtml(open)}</span>`;

  // Format attributes
  const attrRegex = /([a-zA-Z0-9-]+)(?:=("[^"]*"|'[^']*'|\S+))?/g;
  let attrMatch;
  let lastIdx = 0;

  while ((attrMatch = attrRegex.exec(attrs)) !== null) {
    const [full, attrName, attrVal] = attrMatch;
    formatted += escapeHtml(attrs.slice(lastIdx, attrMatch.index));
    formatted += `<span class="hl-attr">${escapeHtml(attrName)}</span>`;
    if (attrVal) {
      formatted += `=<span class="hl-string">${escapeHtml(attrVal)}</span>`;
    }
    lastIdx = attrRegex.lastIndex;
  }
  formatted += escapeHtml(attrs.slice(lastIdx));
  formatted += `<span class="hl-tag">${escapeHtml(close)}</span>`;

  return formatted;
}

function tokenizeRules(code, rules) {
  let pos = 0;
  let result = '';

  while (pos < code.length) {
    let matched = false;

    for (const rule of rules) {
      const sub = code.slice(pos);
      const m = sub.match(new RegExp('^' + rule.regex.source));

      if (m) {
        const text = m[0];
        if (rule.filter && !rule.filter(text)) {
          continue;
        }

        const className = rule.overrideType || rule.type;
        result += `<span class="${className}">${escapeHtml(text)}</span>`;
        pos += text.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      result += escapeHtml(code[pos]);
      pos++;
    }
  }

  return result;
}
