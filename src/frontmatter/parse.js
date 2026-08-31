/**
 * Zero-dependency YAML subset parser & Frontmatter extractor (Replaces gray-matter / js-yaml).
 */

/**
 * Parse frontmatter from raw markdown string.
 * @param {string} text
 * @returns {{ data: Record<string, any>, content: string }}
 */
export function parseFrontmatter(text) {
  if (typeof text !== 'string') {
    return { data: {}, content: '' };
  }

  const normalized = text.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n') && normalized !== '---') {
    return { data: {}, content: text };
  }

  const endIdx = normalized.indexOf('\n---\n', 4);
  if (endIdx === -1) {
    if (normalized.endsWith('\n---')) {
      const yamlStr = normalized.slice(4, normalized.length - 4);
      return { data: parseYamlSubset(yamlStr), content: '' };
    }
    return { data: {}, content: text };
  }

  const yamlStr = normalized.slice(4, endIdx);
  const content = normalized.slice(endIdx + 5);
  const data = parseYamlSubset(yamlStr);

  return { data, content };
}

/**
 * Parse YAML subset string into JS Object.
 * Supports scalar values (strings, numbers, booleans), lists (- item), and indented nested objects.
 * @param {string} yamlStr
 * @returns {Record<string, any>}
 */
export function parseYamlSubset(yamlStr) {
  if (!yamlStr || !yamlStr.trim()) return {};

  const lines = yamlStr.split('\n');
  const root = {};
  const stack = [{ indent: -1, obj: root, key: null }];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    // Ignore full-line comments and empty lines
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;

    const indent = rawLine.search(/\S/);
    const line = rawLine.trim();

    // Pop stack until we match current indent level
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const currentParent = stack[stack.length - 1].obj;

    // Handle list item "- item"
    if (line.startsWith('- ')) {
      const itemVal = parseScalar(line.slice(2).trim());
      const parentKey = stack[stack.length - 1].key;
      
      if (Array.isArray(currentParent)) {
        currentParent.push(itemVal);
      } else if (parentKey && Array.isArray(stack[stack.length - 2]?.obj[parentKey])) {
        stack[stack.length - 2].obj[parentKey].push(itemVal);
      }
      continue;
    }

    // Handle "key: value" or "key:"
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      const rawVal = line.slice(colonIdx + 1).trim();

      if (rawVal === '') {
        // Look ahead to check if next non-empty line is a list or object
        let nextIsList = false;
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim() && !lines[j].trim().startsWith('#')) {
            if (lines[j].trim().startsWith('- ')) {
              nextIsList = true;
            }
            break;
          }
        }

        if (nextIsList) {
          currentParent[key] = [];
        } else {
          currentParent[key] = {};
        }
        stack.push({ indent, obj: currentParent[key], key });
      } else {
        currentParent[key] = parseScalar(rawVal);
      }
    }
  }

  return root;
}

function parseScalar(val) {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === 'null' || val === '~') return null;

  // Quoted string
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }

  // Number
  if (!isNaN(val) && val.trim() !== '') {
    return Number(val);
  }

  return val;
}
