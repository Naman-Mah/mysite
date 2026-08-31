import test from 'node:test';
import assert from 'node:assert/strict';
import { renderTemplate } from '../src/template/engine.js';
import { PartialsRegistry } from '../src/template/partials.js';

test('Template: variable interpolation and escaping', () => {
  const tpl = '<h1>{{title}}</h1><p>{{{raw}}}</p>';
  const ctx = { title: '<Script>', raw: '<b>Bold</b>' };
  const res = renderTemplate(tpl, ctx);

  assert.equal(res, '<h1>&lt;Script&gt;</h1><p><b>Bold</b></p>');
});

test('Template: if/else conditionals', () => {
  const tpl = '{{#if isAwesome}}YES{{else}}NO{{/if}}';
  assert.equal(renderTemplate(tpl, { isAwesome: true }), 'YES');
  assert.equal(renderTemplate(tpl, { isAwesome: false }), 'NO');
});

test('Template: each loops', () => {
  const tpl = '<ul>{{#each items}}<li>{{@index}}: {{this}}</li>{{/each}}</ul>';
  const ctx = { items: ['Alpha', 'Beta'] };
  const res = renderTemplate(tpl, ctx);

  assert.equal(res, '<ul><li>0: Alpha</li><li>1: Beta</li></ul>');
});

test('Template: partials rendering', () => {
  const registry = new PartialsRegistry();
  registry.register('nav', '<nav><a href="/">Home</a></nav>');

  const tpl = '<header>{{> nav}}</header>';
  const res = renderTemplate(tpl, {}, registry);

  assert.equal(res, '<header><nav><a href="/">Home</a></nav></header>');
});
