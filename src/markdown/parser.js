/**
 * Zero-dependency Markdown block parser (Tokens -> AST).
 */
import { tokenizeBlocks } from './tokenizer.js';

export function parseMarkdownToAst(markdown) {
  const { tokens, linkDefs } = tokenizeBlocks(markdown);
  const ast = [];

  for (const token of tokens) {
    if (token.type === 'list') {
      ast.push(buildListAst(token.items));
    } else {
      ast.push(token);
    }
  }

  return { ast, linkDefs };
}

function buildListAst(items) {
  if (!items || items.length === 0) return { type: 'list', ordered: false, items: [] };

  const rootOrdered = items[0].ordered;
  const rootIndent = items[0].indent;
  const resultItems = [];

  let i = 0;
  while (i < items.length) {
    const item = items[i];
    const subItems = [];
    i++;

    while (i < items.length && items[i].indent > rootIndent) {
      subItems.push(items[i]);
      i++;
    }

    const itemNode = {
      type: 'list_item',
      text: item.text
    };

    if (subItems.length > 0) {
      itemNode.children = [buildListAst(subItems)];
    }

    resultItems.push(itemNode);
  }

  return {
    type: 'list',
    ordered: rootOrdered,
    items: resultItems
  };
}
