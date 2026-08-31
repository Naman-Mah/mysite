/**
 * Zero-dependency Markdown HTML renderer.
 */
import { parseMarkdownToAst } from './parser.js';
import { parseInline, escapeHtml } from './inline.js';

export function renderMarkdown(markdown, options = {}) {
  const { ast, linkDefs } = parseMarkdownToAst(markdown);
  const highlightFn = options.highlight || null;

  return renderAst(ast, linkDefs, highlightFn);
}

export function renderAst(ast, linkDefs = {}, highlightFn = null) {
  let html = '';

  for (const node of ast) {
    switch (node.type) {
      case 'heading': {
        const inlineHtml = parseInline(node.text, linkDefs);
        const slug = slugify(node.text);
        html += `<h${node.level} id="${slug}">${inlineHtml}</h${node.level}>\n`;
        break;
      }

      case 'paragraph': {
        const inlineHtml = parseInline(node.text, linkDefs);
        html += `<p>${inlineHtml}</p>\n`;
        break;
      }

      case 'code': {
        const lang = node.lang ? node.lang.toLowerCase() : '';
        let codeHtml = '';
        if (highlightFn && lang) {
          codeHtml = highlightFn(node.text, lang);
        } else {
          codeHtml = escapeHtml(node.text);
        }
        const langClass = lang ? ` class="language-${escapeHtml(lang)}"` : '';
        html += `<pre><code${langClass}>${codeHtml}</code></pre>\n`;
        break;
      }

      case 'blockquote': {
        const innerAst = parseMarkdownToAst(node.text).ast;
        const innerHtml = renderAst(innerAst, linkDefs, highlightFn);
        html += `<blockquote>\n${innerHtml}</blockquote>\n`;
        break;
      }

      case 'hr': {
        html += `<hr />\n`;
        break;
      }

      case 'list': {
        html += renderList(node, linkDefs, highlightFn);
        break;
      }

      case 'table': {
        html += renderTable(node, linkDefs);
        break;
      }

      default:
        break;
    }
  }

  return html;
}

function renderList(listNode, linkDefs, highlightFn) {
  const tag = listNode.ordered ? 'ol' : 'ul';
  let html = `<${tag}>\n`;

  for (const item of listNode.items) {
    const textHtml = parseInline(item.text, linkDefs);
    let childListHtml = '';
    if (item.children && item.children.length > 0) {
      for (const child of item.children) {
        childListHtml += '\n' + renderList(child, linkDefs, highlightFn);
      }
    }
    html += `  <li>${textHtml}${childListHtml}</li>\n`;
  }

  html += `</${tag}>\n`;
  return html;
}

function renderTable(tableNode, linkDefs) {
  let html = '<table>\n  <thead>\n    <tr>\n';

  for (let i = 0; i < tableNode.headers.length; i++) {
    const header = tableNode.headers[i];
    const align = tableNode.align[i] || 'left';
    const alignAttr = align !== 'left' ? ` style="text-align: ${align};"` : '';
    html += `      <th${alignAttr}>${parseInline(header, linkDefs)}</th>\n`;
  }

  html += '    </tr>\n  </thead>\n  <tbody>\n';

  for (const row of tableNode.rows) {
    html += '    <tr>\n';
    for (let i = 0; i < tableNode.headers.length; i++) {
      const cell = row[i] || '';
      const align = tableNode.align[i] || 'left';
      const alignAttr = align !== 'left' ? ` style="text-align: ${align};"` : '';
      html += `      <td${alignAttr}>${parseInline(cell, linkDefs)}</td>\n`;
    }
    html += '    </tr>\n';
  }

  html += '  </tbody>\n</table>\n';
  return html;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
