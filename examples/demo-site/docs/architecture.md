---
title: Architecture & Subsystems
layout: default
description: Detailed technical design of the zero-dependency engine.
---

# Architecture & Subsystems

`mysite` consists of 15 hand-crafted subsystems using `node:` built-in modules:

- `src/markdown/`: Tokenizer & AST renderer
- `src/frontmatter/`: Indentation-based YAML parser
- `src/template/`: Layout & partial string engine
- `src/search/`: TF-IDF index builder
- `src/media/`: Binary image header parser

JSON Configuration snippet:

```json
{
  "name": "mysite",
  "track": "A",
  "dependencies": {}
}
```
