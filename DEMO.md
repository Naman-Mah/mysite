# Demo Video Script — `mysite` Zero-Dependency SSG

This document provides a numbered, timestamped 5-minute video script for filming the hackathon submission demonstration.

---

## ⏱️ Timeline & Shot List (Total Duration: 05:00)

### 1. Zero-Dependency Proof (00:00 - 00:45)
- **Action:** Open terminal in project root.
- **Command:** `cat package.json`
- **Voiceover:** *"Welcome! This is `mysite`, a static site generator built for the Zero Dependency hackathon. As you can see in package.json, dependencies and devDependencies are both literal empty objects `{}`."*
- **Command:** `node bin/mysite.js verify-zero-dep`
- **Voiceover:** *"Running our verifier scans every source file to confirm zero external npm imports exist. All checks pass instantly and generate `deps-proof.txt`."*

### 2. High-Speed Static Site Build (00:45 - 01:30)
- **Command:** `node bin/mysite.js build --src examples/demo-site --out dist --minify`
- **Voiceover:** *"Let's build our demo site containing 10 Markdown pages, nested folders, code snippets, and custom templates. In under 50 milliseconds, `mysite` parses Markdown, frontmatter YAML, probes binary images, builds TF-IDF search indexes, RSS feeds, and minifies the output into `dist/`."*

### 3. Rich Content & Search Widget (01:30 - 02:30)
- **Action:** Open generated `dist/index.html` in browser.
- **Voiceover:** *"Here is the generated site. Notice the syntax-highlighted code blocks hand-rolled for JS, Python, Go, and HTML. Notice the `<img>` tags — our binary image header parser extracted exact width and height dimensions directly from PNG, JPEG, GIF, and WebP byte headers to prevent CLS layout shift."*
- **Action:** Type "Python" in the top search bar.
- **Voiceover:** *"The top search bar uses our zero-dep TF-IDF client widget. It searches `search-index.json` instantly in-browser without any server round-trips."*

### 4. Dev Server & Live Reload (02:30 - 03:30)
- **Command:** `node bin/mysite.js serve --src examples/demo-site --port 3000`
- **Voiceover:** *"Now we launch `mysite serve`. It starts a `node:http` server and attaches an SSE Live Reload observer using native `node:fs.watch`."*
- **Action:** Split screen with browser (`http://localhost:3000`) and text editor opening `examples/demo-site/index.md`. Change title to `# Welcome to mysite Live Reload!`. Save file.
- **Voiceover:** *"The moment we save the Markdown file, the site rebuilds in under 15ms and the browser reloads automatically via Server-Sent Events."*

### 5. Quality Tooling & Accessibility Linter (03:30 - 04:15)
- **Command:** `node bin/mysite.js lint --src examples/demo-site`
- **Voiceover:** *"Quality tooling is built-in. Running `mysite lint` scans output HTML for accessibility issues and broken links. Notice it caught a non-descriptive link text 'click here' and an `<img>` tag missing alt text in our planted test page."*

### 6. Reproducible Build Verification & Package Killer (04:15 - 05:00)
- **Command:** `node bin/mysite.js verify-reproducible`
- **Voiceover:** *"Determinism is paramount. Running `verify-reproducible` builds the site twice into isolated temp directories and compares full directory SHA-256 hashes. The hashes match byte-for-byte."*
- **Action:** Scroll through `STDLIB.md` highlighting the **`chalk` Package Killer** section.
- **Voiceover:** *"Finally, `STDLIB.md` documents every replaced package — highlighted by our `chalk` Package Killer entry proving terminal formatting requires zero third-party code. Thank you!"*
