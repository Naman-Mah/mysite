/**
 * Zero-dependency Markdown block tokenizer.
 */

export function tokenizeBlocks(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const tokens = [];
  const linkDefs = {};

  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Link reference definition: [ref]: url "title"
    const linkDefMatch = line.match(/^\[([^\]]+)\]:\s*(\S+)(?:\s+["'(]([^"'(]+)["')])?\s*$/);
    if (linkDefMatch) {
      linkDefs[linkDefMatch[1].toLowerCase()] = {
        href: linkDefMatch[2],
        title: linkDefMatch[3] || ''
      };
      i++;
      continue;
    }

    // Fenced Code Block
    const codeMatch = line.match(/^(\s*)(`{3,}|~{3,})\s*([\w-]*)/);
    if (codeMatch) {
      const fence = codeMatch[2];
      const lang = codeMatch[3] || '';
      const codeLines = [];
      i++;

      while (i < lines.length) {
        if (lines[i].trim().startsWith(fence.slice(0, 3))) {
          i++;
          break;
        }
        codeLines.push(lines[i]);
        i++;
      }

      tokens.push({
        type: 'code',
        lang,
        text: codeLines.join('\n')
      });
      continue;
    }

    // Heading (# to ######)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      tokens.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2].trim()
      });
      i++;
      continue;
    }

    // Horizontal Rule (---, ***, ___)
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
      tokens.push({ type: 'hr' });
      i++;
      continue;
    }

    // GFM Table
    if (line.includes('|') && i + 1 < lines.length && /^[|\s:-]+$/.test(lines[i + 1])) {
      const headerCells = parseTableRow(line);
      const alignCells = parseTableRow(lines[i + 1]).map(parseAlign);
      i += 2;
      const rows = [];

      while (i < lines.length && lines[i].includes('|')) {
        rows.push(parseTableRow(lines[i]));
        i++;
      }

      tokens.push({
        type: 'table',
        headers: headerCells,
        align: alignCells,
        rows
      });
      continue;
    }

    // Blockquote
    if (line.trim().startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      tokens.push({
        type: 'blockquote',
        text: quoteLines.join('\n')
      });
      continue;
    }

    // Lists (unordered -/*, ordered 1.)
    const listMatch = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const listTokens = [];
      const baseIndent = listMatch[1].length;

      while (i < lines.length) {
        const curr = lines[i];
        const match = curr.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        
        if (match) {
          const indent = match[1].length;
          const ordered = /^\d+\./.test(match[2]);
          const itemText = [match[3]];
          i++;

          // Continuation lines
          while (i < lines.length) {
            const nextLine = lines[i];
            if (nextLine.trim() === '') break;
            const nextMatch = nextLine.match(/^(\s*)([-*]|\d+\.)\s+/);
            if (nextMatch && nextMatch[1].length <= indent) break;
            itemText.push(nextLine.trim());
            i++;
          }

          listTokens.push({
            indent,
            ordered,
            text: itemText.join('\n')
          });
        } else {
          break;
        }
      }

      tokens.push({
        type: 'list',
        items: listTokens
      });
      continue;
    }

    // Paragraph
    const paraLines = [line.trim()];
    i++;
    while (i < lines.length) {
      const nextLine = lines[i];
      if (
        nextLine.trim() === '' ||
        nextLine.match(/^(#{1,6})\s+/) ||
        nextLine.match(/^(`{3,}|~{3,})/) ||
        nextLine.match(/^(\*{3,}|-{3,}|_{3,})\s*$/) ||
        nextLine.trim().startsWith('>') ||
        nextLine.match(/^(\s*)([-*]|\d+\.)\s+/) ||
        nextLine.match(/^\[([^\]]+)\]:\s*(\S+)/)
      ) {
        break;
      }
      paraLines.push(nextLine.trim());
      i++;
    }

    tokens.push({
      type: 'paragraph',
      text: paraLines.join(' ')
    });
  }

  return { tokens, linkDefs };
}

function parseTableRow(rowStr) {
  return rowStr
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim());
}

function parseAlign(str) {
  const s = str.trim();
  if (s.startsWith(':') && s.endsWith(':')) return 'center';
  if (s.endsWith(':')) return 'right';
  if (s.startsWith(':')) return 'left';
  return 'left';
}
