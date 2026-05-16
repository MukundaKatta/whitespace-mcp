import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { normalize } from '../src/server.js';

test('trim outer whitespace', () => {
  assert.equal(normalize('  hello  ', { trim: true }), 'hello');
});

test('collapse_inline merges spaces and tabs', () => {
  assert.equal(normalize('hello \t  world', { collapse_inline: true }), 'hello world');
});

test('collapse_inline preserves newlines', () => {
  assert.equal(normalize('a  b\nc  d', { collapse_inline: true }), 'a b\nc d');
});

test('strip_empty_lines drops blank lines', () => {
  assert.equal(
    normalize('a\n\n\nb\n   \nc', { strip_empty_lines: true }),
    'a\nb\nc',
  );
});

test('expand_tabs replaces tabs', () => {
  assert.equal(normalize('a\tb', { expand_tabs: 4 }), 'a    b');
});

test('unify_newlines handles CRLF', () => {
  assert.equal(normalize('a\r\nb\r\nc'), 'a\nb\nc');
});

test('default does very little', () => {
  // Only unify_newlines (default true) — no trimming/collapsing.
  assert.equal(normalize('  a  b  '), '  a  b  ');
});
