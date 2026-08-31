/**
 * Zero-dependency demo site generator.
 * Creates 10 Markdown pages, layouts, partials, CSS, and binary images (PNG, JPEG, GIF, WebP).
 */
import fs from 'node:fs';
import path from 'node:path';

const demoDir = path.resolve('./examples/demo-site');

if (fs.existsSync(demoDir)) {
  fs.rmSync(demoDir, { recursive: true, force: true });
}

fs.mkdirSync(path.join(demoDir, '_layouts'), { recursive: true });
fs.mkdirSync(path.join(demoDir, '_partials'), { recursive: true });
fs.mkdirSync(path.join(demoDir, 'posts'), { recursive: true });
fs.mkdirSync(path.join(demoDir, 'docs'), { recursive: true });
fs.mkdirSync(path.join(demoDir, 'assets'), { recursive: true });

// 1. Write Config
fs.writeFileSync(
  path.join(demoDir, 'mysite.config.json'),
  JSON.stringify(
    {
      title: 'Zero-Dep Demo Site',
      description: 'A website generated with zero third-party npm dependencies using plain Node.js',
      author: 'Zero Dependency Hackathon',
      baseUrl: 'http://localhost:3000'
    },
    null,
    2
  ),
  'utf8'
);

// 2. Write Partials
fs.writeFileSync(
  path.join(demoDir, '_partials/header.html'),
  `<header class="site-header">
  <div class="brand"><a href="/"><strong>{{site.title}}</strong></a></div>
  <nav class="site-nav">
    <a href="/">Home</a>
    <a href="/posts/first-post.html">Blog</a>
    <a href="/docs/guide.html">Docs</a>
    <a href="/about.html">About</a>
  </nav>
  <div class="search-box">
    <input type="text" id="search-input" placeholder="Search site..." aria-label="Search site">
    <div id="search-results"></div>
  </div>
</header>`,
  'utf8'
);

fs.writeFileSync(
  path.join(demoDir, '_partials/footer.html'),
  `<footer class="site-footer">
  <p>&copy; {{site.author}} | Built with zero dependencies using <code>mysite</code></p>
  <p><a href="/rss.xml">RSS Feed</a> | <a href="/atom.xml">Atom Feed</a> | <a href="/sitemap.xml">Sitemap</a></p>
</footer>
<script src="/mysite-search.js"></script>`,
  'utf8'
);

// 3. Write Layout
fs.writeFileSync(
  path.join(demoDir, '_layouts/default.html'),
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{page.title}} | {{site.title}}</title>
  <meta name="description" content="{{page.description}}">
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
  {{> header}}
  <main class="container">
    <article>
      <h1>{{page.title}}</h1>
      {{{content}}}
    </article>
  </main>
  {{> footer}}
</body>
</html>`,
  'utf8'
);

// 4. Write CSS
fs.writeFileSync(
  path.join(demoDir, 'assets/style.css'),
  `/* Zero-dep Demo Site Stylesheet */
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; color: #222; background: #f8f9fa; }
.container { max-width: 800px; margin: 2rem auto; padding: 0 1rem; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.site-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; background: #1a1a1a; color: #fff; }
.site-header a { color: #fff; text-decoration: none; margin-right: 1rem; }
.site-footer { text-align: center; padding: 2rem; background: #eee; font-size: 0.9rem; margin-top: 3rem; }
code { font-family: Consolas, Monaco, monospace; background: #f1f3f5; padding: 0.2em 0.4em; border-radius: 3px; }
pre { background: #282c34; color: #abb2bf; padding: 1rem; border-radius: 6px; overflow-x: auto; }
.hl-keyword { color: #c678dd; font-weight: bold; }
.hl-string { color: #98c379; }
.hl-comment { color: #5c6370; font-style: italic; }
.hl-number { color: #d19a66; }
.hl-function { color: #61afef; }
.hl-tag { color: #e06c75; }
.hl-attr { color: #d19a66; }
table { border-collapse: collapse; width: 100%; margin: 1.5rem 0; }
th, td { border: 1px solid #dee2e6; padding: 0.75rem; text-align: left; }
th { background: #e9ecef; }
blockquote { border-left: 4px solid #4c6ef5; margin: 0; padding-left: 1rem; color: #495057; font-style: italic; }
#search-input { padding: 0.4rem 0.8rem; border-radius: 4px; border: 1px solid #ccc; }
#search-results { position: absolute; background: #fff; color: #333; width: 300px; max-height: 250px; overflow-y: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 4px; z-index: 100; }
.search-results-list { list-style: none; padding: 0; margin: 0; }
.search-results-list li { padding: 0.5rem; border-bottom: 1px solid #eee; }
.search-results-list a { color: #1c7ed6; text-decoration: none; }
`,
  'utf8'
);

// 5. Generate Programmatic Binary Images (PNG, JPEG, GIF, WebP)
// PNG (300x150)
const pngBuf = Buffer.alloc(40);
pngBuf.write('\x89PNG\r\n\x1a\n', 0, 'binary');
pngBuf.writeUInt32BE(300, 16);
pngBuf.writeUInt32BE(150, 20);
fs.writeFileSync(path.join(demoDir, 'assets/sample.png'), pngBuf);

// GIF (200x100)
const gifBuf = Buffer.alloc(12);
gifBuf.write('GIF89a', 0, 'ascii');
gifBuf.writeUInt16LE(200, 6);
gifBuf.writeUInt16LE(100, 8);
fs.writeFileSync(path.join(demoDir, 'assets/sample.gif'), gifBuf);

// JPEG (400x200)
const jpegBuf = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
  0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0xc8, 0x01, 0x90, 0x03, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01
]); // 0x00 0xc8 = 200 height, 0x01 0x90 = 400 width
fs.writeFileSync(path.join(demoDir, 'assets/sample.jpg'), jpegBuf);

// WebP (500x250)
const webpBuf = Buffer.alloc(32);
webpBuf.write('RIFF', 0, 'ascii');
webpBuf.write('WEBP', 8, 'ascii');
webpBuf.write('VP8X', 12, 'ascii');
webpBuf[24] = 0xf3; // 499 (500-1)
webpBuf[25] = 0x01;
webpBuf[26] = 0x00;
webpBuf[27] = 0xf9; // 249 (250-1)
webpBuf[28] = 0x00;
webpBuf[29] = 0x00;
fs.writeFileSync(path.join(demoDir, 'assets/sample.webp'), webpBuf);

// 6. Write 10 Markdown Pages

// Page 1: index.md
fs.writeFileSync(
  path.join(demoDir, 'index.md'),
  `---
title: Home Page
layout: default
description: Welcome to the zero-dependency static site generator demo.
---

# Welcome to mysite!

**mysite** is a fast static site generator built with **zero third-party npm dependencies**.

## Features

- **Hand-written Markdown parser** supporting GFM tables, nested lists, and code fences
- **YAML frontmatter parser** supporting nested objects and lists
- **Syntax highlighter** for JS, Python, Go, JSON, Bash, and HTML
- **Binary Image Probe** auto-injecting image dimensions
- **Built-in TF-IDF Search Engine** with client-side widget
- **Dev server** with live reload via Server-Sent Events

Check out our sample image below:

![Sample Banner](/assets/sample.png)

Visit our [Documentation](/docs/guide.html) or [First Blog Post](/posts/first-post.html).
`,
  'utf8'
);

// Page 2: about.md
fs.writeFileSync(
  path.join(demoDir, 'about.md'),
  `---
title: About mysite
layout: default
description: The story behind the zero-dependency Markdown generator.
---

# About mysite

` + '`mysite`' + ` was created for the **Zero Dependency Hackathon**.

## Philosophy

Modern web development often pulls in hundreds of transitive npm dependencies for basic static site generation. We hand-rolled:

1. Markdown & YAML parsers
2. Template string renderer
3. ANSI terminal color library
4. Live-reload HTTP server

Here is a JPEG sample:

![Sample JPEG](/assets/sample.jpg)
`,
  'utf8'
);

// Page 3: posts/first-post.md
fs.writeFileSync(
  path.join(demoDir, 'posts/first-post.md'),
  `---
title: Building a Zero-Dep SSG in 72 Hours
date: 2026-08-31
layout: default
description: How we built every subsystem using pure Node.js stdlib modules.
---

# Building a Zero-Dep SSG in 72 Hours

Static site generators don't need massive dependency trees.

## Code Example: JavaScript

` + '```js' + `
import http from 'node:http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from zero-dep server!');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
` + '```' + `

Read more in our [Architecture Guide](/docs/architecture.html).
`,
  'utf8'
);

// Page 4: posts/second-post.md
fs.writeFileSync(
  path.join(demoDir, 'posts/second-post.md'),
  `---
title: Exploring Python and Go Syntax Highlighting
date: 2026-08-31
layout: default
description: Benchmarking syntax tokenizers across languages.
---

# Syntax Highlighting Across Languages

We hand-rolled regex/state-machine tokenizers for multiple languages.

## Python Example

` + '```py' + `
def calculate_factorial(n):
    # Calculate factorial recursively
    if n <= 1:
        return 1
    return n * calculate_factorial(n - 1)

print(calculate_factorial(5))
` + '```' + `

## Go Example

` + '```go' + `
package main

import "fmt"

func main() {
    fmt.Println("Hello from Go!")
}
` + '```' + `

Here is an animated GIF sample:

![Sample GIF](/assets/sample.gif)
`,
  'utf8'
);

// Page 5: posts/third-post.md
fs.writeFileSync(
  path.join(demoDir, 'posts/third-post.md'),
  `---
title: GFM Tables and Strikethrough
date: 2026-08-31
layout: default
description: Markdown table rendering performance benchmark.
---

# GFM Tables and Strikethrough

Markdown tables are converted into clean HTML ` + '`<table>`' + ` structures.

| Component | Status | npm Replaced |
|:---|:---:|---:|
| Markdown | Done | marked / markdown-it |
| Colors | Done | chalk |
| Server | Done | express |
| Search | Done | lunr |

Strikethrough text example: ~~old feature~~ **new feature**.
`,
  'utf8'
);

// Page 6: docs/guide.md
fs.writeFileSync(
  path.join(demoDir, 'docs/guide.md'),
  `---
title: Quickstart Guide
layout: default
description: How to get started with mysite static site generator.
---

# Quickstart Guide

Get up and running with ` + '`mysite`' + ` in seconds.

## Commands

` + '```bash' + `
# Build your static site
mysite build --src ./content --out ./dist

# Start dev server with live reload
mysite serve --port 3000

# Run accessibility and link linter
mysite lint
` + '```' + `

WebP image sample:

![Sample WebP](/assets/sample.webp)
`,
  'utf8'
);

// Page 7: docs/architecture.md
fs.writeFileSync(
  path.join(demoDir, 'docs/architecture.md'),
  `---
title: Architecture & Subsystems
layout: default
description: Detailed technical design of the zero-dependency engine.
---

# Architecture & Subsystems

` + '`mysite`' + ` consists of 15 hand-crafted subsystems using ` + '`node:`' + ` built-in modules:

- ` + '`src/markdown/`' + `: Tokenizer & AST renderer
- ` + '`src/frontmatter/`' + `: Indentation-based YAML parser
- ` + '`src/template/`' + `: Layout & partial string engine
- ` + '`src/search/`' + `: TF-IDF index builder
- ` + '`src/media/`' + `: Binary image header parser

JSON Configuration snippet:

` + '```json' + `
{
  "name": "mysite",
  "track": "A",
  "dependencies": {}
}
` + '```' + `
`,
  'utf8'
);

// Page 8: docs/accessibility.md (Includes deliberate accessibility warning & non-descriptive link text for linter demo)
fs.writeFileSync(
  path.join(demoDir, 'docs/accessibility.md'),
  `---
title: Accessibility Standards
layout: default
description: Ensuring web accessibility compliance.
---

# Accessibility Standards

We provide built-in linter rules for WCAG compliance.

## Planted Linter Issue Demo

To learn more about accessibility, [click here](/docs/guide.html).

<img src="/assets/sample.png" />
`,
  'utf8'
);

// Page 9: draft-post.md (Draft page)
fs.writeFileSync(
  path.join(demoDir, 'posts/draft-post.md'),
  `---
title: Secret Draft Post
draft: true
layout: default
description: This post should only appear when --drafts flag is enabled.
---

# Secret Draft Post

This is a draft post.
`,
  'utf8'
);

// Page 10: 404.md (Custom 404 error page)
fs.writeFileSync(
  path.join(demoDir, '404.md'),
  `---
title: Page Not Found
layout: default
description: 404 Error page.
---

# 404 — Page Not Found

The page you were looking for does not exist.

[Return to Home Page](/)
`,
  'utf8'
);

console.log('✓ Generated demo site content with 10 Markdown pages, layouts, CSS, and binary images.');
