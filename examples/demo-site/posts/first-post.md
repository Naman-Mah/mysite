---
title: Building a Zero-Dep SSG in 72 Hours
date: 2026-08-31
layout: default
description: How we built every subsystem using pure Node.js stdlib modules.
---

# Building a Zero-Dep SSG in 72 Hours

Static site generators don't need massive dependency trees.

## Code Example: JavaScript

```js
import http from 'node:http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from zero-dep server!');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

Read more in our [Architecture Guide](/docs/architecture.html).
