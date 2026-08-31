# Standard Library Substitutions (`STDLIB.md`)

This document lists every npm package `mysite` would normally have depended on, and details the Node.js built-in standard library features used to hand-roll that functionality from scratch.

---

## 🎯 PACKAGE KILLER SPOTLIGHT: `chalk` → `node:process` + Raw ANSI Escape Sequences

> [!IMPORTANT]
> **Narrative Context:** In September 2025, popular CLI libraries including `chalk` and `debug` (which together account for over 2.6 billion weekly downloads) were compromised in a high-profile supply-chain attack. Single-line malicious updates were injected into deep dependency trees.
>
> `mysite` demonstrates that terminal coloring does not require third-party dependencies.

**What `chalk` normally does:** Provides a chainable API (`chalk.bold.red('msg')`) for styling terminal string output using ANSI escape codes.

**What we built instead:** We hand-rolled `src/cli/colors.js` using raw ANSI escape codes (`\x1b[31m`, `\x1b[32m`, `\x1b[1m`, `\x1b[0m`). It checks `process.env.NO_COLOR` and `process.stdout.isTTY` to automatically strip formatting in non-interactive CI environments.

**Trade-off / honest limitation:** Supports standard 8-color ANSI palettes and basic styles (bold, dim). TrueColor 24-bit RGB chaining and nested color stack recovery are omitted.

---

## Standard Library Substitutions Matrix

### 1. `markdown-it` / `marked` → `src/markdown/` (`node:buffer`, `node:string`)
**What it normally does:** Parses CommonMark and GitHub Flavored Markdown (GFM) text into AST tokens and renders HTML.
**What we built instead:** Hand-written 4-stage pipeline: line-by-line block tokenizer (`tokenizer.js`), nested list AST builder (`parser.js`), inline tokenizer (`inline.js`), and HTML renderer (`render.js`). Supports headings, GFM tables, blockquotes, code fences, link reference definitions, bold, italic, strikethrough, autolinks, and images.
**Trade-off / honest limitation:** Not 100% CommonMark spec compliant (e.g. loose list paragraph wrapping and HTML block raw pass-through have simplified rules).

### 2. `gray-matter` / `js-yaml` → `src/frontmatter/parse.js`
**What it normally does:** Extracts YAML frontmatter delimiters (`---`) and parses arbitrary YAML objects.
**What we built instead:** A hand-rolled YAML subset parser supporting key-value pairs, string/number/boolean scalars, nested objects via indentation stack matching, and top-level lists (`- item`).
**Trade-off / honest limitation:** Multi-line folded scalars (`|`, `>`), complex anchor aliases (`&`, `*`), and flow map syntax (`{ a: 1 }`) are not supported.

### 3. `handlebars` / `ejs` / `nunjucks` → `src/template/engine.js`
**What it normally does:** Compiles template files with control flow logic, partials, and layout inheritance.
**What we built instead:** A tokenizing string template engine supporting `{{variable}}`, `{{{rawVariable}}}`, `{{#if cond}}...{{else}}...{{/if}}`, `{{#each list}}...{{/each}}`, layout wrapping, and file partials (`{{> partialName}}`).
**Trade-off / honest limitation:** Does not support custom helper functions or complex expression evaluation inside `{{#if}}`.

### 4. `express` / `serve` → `node:http`, `node:fs`
**What it normally does:** Serves static directory assets over HTTP with MIME types, index resolution, and header handling.
**What we built instead:** `src/server/static-server.js` uses `node:http.createServer`, a hand-crafted 13-entry MIME lookup table, directory `index.html` resolution, and stream piping with `fs.createReadStream`.
**Trade-off / honest limitation:** No HTTP range requests or compression middleware out of the box.

### 5. `chokidar` / `browser-sync` / `live-server` → `node:fs`, `node:http`
**What it normally does:** Watches directory file changes recursively across platforms and triggers browser live reload.
**What we built instead:** `src/server/live-reload.js` uses native `node:fs.watch` to observe source changes, rebuilds the site in-memory, and pushes instant reload signals to connected browsers via a built-in Server-Sent Events (`text/event-stream`) endpoint (`/__livereload`).
**Trade-off / honest limitation:** `fs.watch` on some legacy OS versions can emit duplicate change events (mitigated with 150ms debouncing).

### 6. `highlight.js` / `prismjs` → `src/highlight/tokenizer.js`
**What it normally does:** Parses source code grammars into syntax-highlighted HTML spans.
**What we built instead:** Regex/state-machine tokenizer matching keywords, strings, comments, numbers, functions, and HTML tags across 6 core languages (JS, Python, Go, JSON, Bash, HTML).
**Trade-off / honest limitation:** Token-class based matching rather than full AST language grammar parsing.

### 7. `lunr` / `flexsearch` → `src/search/`
**What it normally does:** Builds client-side or server-side inverted search indexes for full-text lookup.
**What we built instead:** `index-builder.js` builds a TF-IDF (Term Frequency-Inverse Document Frequency) inverted index at compile time, outputting `search-index.json`. `client-widget.js` is a 50-line vanilla JS script performing client-side ranking with zero external fetches.
**Trade-off / honest limitation:** No fuzzy string distance (Levenshtein) matching; exact token prefix TF-IDF lookup only.

### 8. `feed` / `sitemap` → `src/feed/`
**What it normally does:** Constructs RSS 2.0, Atom 1.0, and sitemap.xml feeds.
**What we built instead:** Pure string XML builders (`rss.js`, `atom.js`, `sitemap.js`) with hand-crafted XML entity escaping (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`).
**Trade-off / honest limitation:** RSS enclosure media tags and image sitemaps must be manually added to templates if needed.

### 9. `terser` / `csso` / `html-minifier-terser` → `src/minify/`
**What it normally does:** Minifies and mangles HTML, CSS, and JavaScript.
**What we built instead:** Safely collapses HTML whitespace while preserving `<pre>`/`<code>` blocks (`html.js`), strips CSS comments and delimiter spaces (`css.js`), and strips JS single/multi-line comments and whitespace (`js.js`).
**Trade-off / honest limitation:** Does NOT perform AST-based JS symbol mangling or scope flattening to prevent breaking variable bindings.

### 10. `image-size` / `probe-image-size` → `src/media/image-probe.js` (`node:buffer`)
**What it normally does:** Reads binary headers of PNG, JPEG, GIF, and WebP images to extract dimensions.
**What we built instead:** Hand-written binary header parser using `Buffer` methods (`readUInt32BE`, `readUInt16LE`, byte bitmasking). Reads IHDR (PNG), SOF markers (JPEG), screen descriptor (GIF), and VP8/VP8L/VP8X chunks (WebP). Auto-injects `width` and `height` attributes on HTML `<img>` tags.
**Trade-off / honest limitation:** Does not decode EXIF orientation metadata for JPEG auto-rotation.

### 11. `broken-link-checker` → `node:http`, `node:https`
**What it normally does:** Validates internal page anchors and issues HTTP requests to external URLs.
**What we built instead:** `src/lint/link-checker.js` verifies internal relative/absolute paths against output HTML files and issues `HEAD` requests using built-in `node:http` and `node:https` with strict timeouts.
**Trade-off / honest limitation:** Does not bypass anti-bot Cloudflare/CAPTCHA protection on certain external websites.

### 12. `commander` / `yargs` / `minimist` → `src/cli/argv.js`
**What it normally does:** Parses `process.argv` flags, options, and commands.
**What we built instead:** A zero-dependency flag parser (`parseArgv`) supporting positional commands, boolean flags (`--minify`), key-value options (`--port 3000`, `--src=./content`), and numerical coercion.
**Trade-off / honest limitation:** Does not support automatic `--help` generation per sub-command; help text is cleanly centralized in `bin/mysite.js`.

### 13. `cosmiconfig` → `src/config/load.js` (`node:fs`, `node:path`)
**What it normally does:** Searches for and loads project configuration files in JSON, YAML, or JS format.
**What we built instead:** Loads `mysite.config.json` directly from the source directory using `node:fs` and `JSON.parse` with sane default fallbacks.
**Trade-off / honest limitation:** Supports JSON configuration files only (no `.js` config module execution).

### 14. `jest` / `mocha` / `vitest` → `node:test`, `node:assert/strict`
**What it normally does:** Provides test runner framework, assertion libraries, and runner CLI.
**What we built instead:** Replaced completely by Node.js built-in test runner (`node --test`) and `node:assert/strict`. No test framework dependency required at all.
**Trade-off / honest limitation:** None — `node:test` is built into Node 18+ and provides native parallel execution and TAP/spec reporters out of the box.
