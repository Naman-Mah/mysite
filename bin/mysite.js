#!/usr/bin/env node
/**
 * mysite CLI entry point.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgv } from '../src/cli/argv.js';
import colors from '../src/cli/colors.js';
import { buildSite } from '../src/build/pipeline.js';
import { verifyZeroDep } from '../src/verify/zero-dep.js';
import { verifyReproducible } from '../src/verify/reproducible.js';
import { startServer } from '../src/server/static-server.js';
import { runLinter } from '../src/lint/a11y.js';

const { command, positional, flags } = parseArgv(process.argv.slice(2));

if (flags.help || flags.h || command === 'help') {
  printHelp();
  process.exit(0);
}

if (flags.version || flags.v || command === 'version') {
  console.log('mysite v1.0.0 (Zero Dependency SSG)');
  process.exit(0);
}

async function main() {
  switch (command) {
    case 'build': {
      console.log(colors.cyan(colors.bold('Building site...')));
      try {
        const result = buildSite(flags);
        console.log(
          colors.green(
            `✓ Built ${result.totalPages} pages and copied ${result.totalAssets} assets to ${result.outDir} in ${result.durationMs}ms`
          )
        );
      } catch (err) {
        console.error(colors.red(`Build failed: ${err.message}`));
        process.exit(1);
      }
      break;
    }

    case 'serve': {
      startServer(flags);
      break;
    }

    case 'new': {
      const siteName = positional[0] || 'mysite-project';
      scaffoldSite(siteName);
      break;
    }

    case 'lint': {
      runLinter(flags);
      break;
    }

    case 'verify-zero-dep': {
      verifyZeroDep();
      break;
    }

    case 'verify-reproducible': {
      await verifyReproducible(flags);
      break;
    }

    default: {
      if (!command) {
        printHelp();
      } else {
        console.error(colors.red(`Unknown command: "${command}"`));
        printHelp();
        process.exit(1);
      }
      break;
    }
  }
}

function scaffoldSite(name) {
  const targetDir = path.resolve(name);
  if (fs.existsSync(targetDir)) {
    console.error(colors.red(`Target directory already exists: ${targetDir}`));
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  fs.mkdirSync(path.join(targetDir, '_layouts'), { recursive: true });

  fs.writeFileSync(
    path.join(targetDir, 'mysite.config.json'),
    JSON.stringify({ title: name, description: 'Created with mysite', author: 'Author' }, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(targetDir, 'index.md'),
    `---
title: Welcome to ${name}
layout: default
---

# Welcome to ${name}!

This site was scaffolded with **mysite** — the zero-dependency static site generator.
`,
    'utf8'
  );

  console.log(colors.green(`✓ Scaffolded new site in ${targetDir}`));
}

function printHelp() {
  console.log(`
${colors.bold('mysite')} — Zero-Dependency Static Site Generator

${colors.bold('USAGE:')}
  mysite <command> [options]

${colors.bold('COMMANDS:')}
  build [--src <dir>] [--out <dir>] [--minify] [--drafts]   Build static site
  serve [--src <dir>] [--port <port>]                        Start dev server with live reload
  new <name>                                                Scaffold a new site folder
  lint [--src <dir>]                                        Run accessibility & broken link linter
  verify-zero-dep                                           Verify zero npm dependencies
  verify-reproducible                                       Verify build determinism

${colors.bold('OPTIONS:')}
  -h, --help                                                Show this help message
  -v, --version                                             Show version
`);
}

main().catch((err) => {
  console.error(colors.red(`Error: ${err.message}`));
  process.exit(1);
});
