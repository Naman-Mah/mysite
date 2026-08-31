# `mysite` — Zero-Dependency Markdown Static Site Generator

> A complete, hand-rolled static site generator built exclusively using **Node.js built-in (`node:`) modules**. Zero npm packages. Zero external runtime dependencies.

---

## What It Does

`mysite` converts a directory of Markdown files into a full-featured website. It includes a hand-written Markdown parser, YAML frontmatter parser, template string engine, dev server with SSE live reload, syntax highlighter, TF-IDF search index generator with client-side widget, RSS/Atom/sitemap builders, HTML/CSS/JS minifiers, binary image dimension prober, and accessibility linter — replacing 15+ popular npm packages with pure Node.js stdlib code.

---

## Why Zero Dependencies? (The Supply-Chain Narrative)

In September 2025, malicious updates compromised major npm packages including `chalk` and `debug` (which together drive over 2.6 billion weekly downloads), demonstrating how vulnerable modern build pipelines are to single-point supply-chain failures.

`mysite` targets **Track A (Developer Tools & CLI)** for the **Zero Dependency Hackathon** to prove that powerful developer tools can be constructed entirely from first principles using standard platform primitives, without importing thousands of unvetted third-party transitive packages.

---

## Quick Start

### 1. Clone & Build Artifact
```bash
git clone https://github.com/user/mysite.git
cd mysite
npm run build
```

### 2. Run Dev Server
```bash
npm run serve
# Server running at http://localhost:3000
```

---

## Command Reference

| Command | Description |
| :--- | :--- |
| `mysite build [--src <dir>] [--out <dir>] [--minify] [--drafts]` | Build static site into output directory |
| `mysite serve [--src <dir>] [--port 3000]` | Launch HTTP static server with SSE live reload |
| `mysite new <name>` | Scaffold a new site directory |
| `mysite lint [--src <dir>]` | Run WCAG accessibility & broken link linter |
| `mysite verify-zero-dep` | Scan source files & manifest; generate `deps-proof.txt` |
| `mysite verify-reproducible` | Execute double build & diff SHA-256 hashes; write `repro-hashes.txt` |

---

## Architecture Overview

All implementation code lives in `src/` and runs directly under Node.js (`type: "module"`):

- `src/cli/`: Hand-rolled argument parser (`argv.js`) and ANSI escape formatter (`colors.js` — **Replaces `chalk`**).
- `src/markdown/`: Line-by-line block tokenizer (`tokenizer.js`), AST list builder (`parser.js`), inline renderer (`inline.js`), HTML compiler (`render.js`).
- `src/frontmatter/`: Indentation-stack YAML subset parser (`parse.js`).
- `src/template/`: Parsed template engine (`engine.js`) & partial loader (`partials.js`).
- `src/highlight/`: Token-class state machine syntax highlighter for JS, Python, Go, JSON, Bash, HTML (`tokenizer.js`).
- `src/media/`: Binary image header parser (`image-probe.js`) extracting dimensions from PNG, JPEG, GIF, and WebP buffers.
- `src/search/`: Build-time TF-IDF inverted index builder (`index-builder.js`) & vanilla JS client widget (`client-widget.js`).
- `src/feed/`: Hand-built XML generators for RSS 2.0 (`rss.js`), Atom 1.0 (`atom.js`), and sitemap (`sitemap.js`).
- `src/minify/`: Safe HTML (`html.js`), CSS (`css.js`), and JS (`js.js`) minifiers.
- `src/lint/`: Accessibility rules (`a11y.js`) and `node:http`/`node:https` broken link checker (`link-checker.js`).
- `src/server/`: HTTP static file server (`static-server.js`) & SSE live reload observer (`live-reload.js`).
- `src/verify/`: Zero-dependency verifier (`zero-dep.js`) and build determinism verifier (`reproducible.js`).

See [STDLIB.md](STDLIB.md) for full details on all 15+ standard library substitutions.

---

## Honest Limitations

We prioritize engineering transparency over hiding corners:

1. **Markdown Parser:** Supports common GFM elements (headings, tables, blockquotes, lists, code fences, emphasis, autolinks, reference links). Gaps: loose vs. tight list paragraph wrapping rules and complex raw HTML block state transitions are simplified.
2. **YAML Parser:** Supports `key: value`, indentation-based maps, numbers, booleans, strings, and `- item` lists. Gaps: folded multi-line scalars (`|`, `>`) and flow mapping (`{a: 1}`) are not implemented.
3. **Syntax Highlighter:** Uses token-class regex matching rather than full language AST grammars.
4. **JS Minifier:** Strips comments and unnecessary line whitespace; does NOT attempt symbol mangling to avoid scope-binding errors.
5. **Search Engine:** TF-IDF token matching; does not include Levenshtein fuzzy spelling correction.

---

## Testing

All tests use Node.js's built-in test runner (`node:test`) and strict assertions (`node:assert/strict`):

```bash
npm test
```

---

## Verification

### Verify Zero Dependencies
```bash
npm run verify-zero-dep
```
Output is committed directly to [deps-proof.txt](deps-proof.txt).

### Verify Reproducible Build Determinism
```bash
npm run verify-reproducible
```
Output is committed directly to [repro-hashes.txt](repro-hashes.txt).

---

## License

[MIT License](LICENSE) &copy; 2026
