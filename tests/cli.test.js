import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArgv } from '../src/cli/argv.js';
import colors from '../src/cli/colors.js';

test('CLI: argv parser handles commands and flags', () => {
  const input = ['build', '--src', './content', '--out', './dist', '--minify', '--port=8080'];
  const parsed = parseArgv(input);

  assert.equal(parsed.command, 'build');
  assert.equal(parsed.flags.src, './content');
  assert.equal(parsed.flags.out, './dist');
  assert.equal(parsed.flags.minify, true);
  assert.equal(parsed.flags.port, 8080);
});

test('CLI: colors utility formats text correctly', () => {
  const formatted = colors.green('PASS');
  assert.ok(formatted.includes('PASS'));
});
