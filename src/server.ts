#!/usr/bin/env node
/**
 * whitespace MCP server. One tool: `normalize`.
 *
 * Normalize whitespace in text. Independent toggles: trim outer whitespace,
 * collapse internal runs to a single space, strip empty lines, and replace
 * tabs with N spaces. Useful for cleaning model-generated text or scraped
 * HTML output.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const VERSION = '0.1.0';

export interface NormalizeOpts {
  trim?: boolean;
  collapse_inline?: boolean;
  strip_empty_lines?: boolean;
  expand_tabs?: number;
  unify_newlines?: boolean;
}

export function normalize(text: string, opts: NormalizeOpts = {}): string {
  let s = text;
  if (opts.unify_newlines !== false) s = s.replace(/\r\n?/g, '\n');
  if (opts.expand_tabs && opts.expand_tabs > 0) {
    s = s.replace(/\t/g, ' '.repeat(opts.expand_tabs));
  }
  if (opts.collapse_inline) {
    // Collapse runs of spaces/tabs to a single space, but preserve newlines.
    s = s.replace(/[ \t]+/g, ' ');
  }
  if (opts.strip_empty_lines) {
    s = s
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .join('\n');
  }
  if (opts.trim) s = s.trim();
  return s;
}

const server = new Server({ name: 'whitespace', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'normalize',
    description:
      'Normalize whitespace in text. Independent toggles for trim / collapse_inline / strip_empty_lines / expand_tabs / unify_newlines.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        trim: { type: 'boolean', default: false },
        collapse_inline: { type: 'boolean', default: false },
        strip_empty_lines: { type: 'boolean', default: false },
        expand_tabs: { type: 'integer', description: 'Replace tab with N spaces. 0 = leave alone.', default: 0 },
        unify_newlines: { type: 'boolean', default: true, description: 'CRLF → LF.' },
      },
      required: ['text'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name !== 'normalize') return errorResult('unknown tool: ' + name);
    const a = args as unknown as { text: string } & NormalizeOpts;
    return textResult(normalize(a.text, a));
  } catch (err) {
    return errorResult('whitespace failed: ' + (err as Error).message);
  }
});

function textResult(text: string) {
  return { content: [{ type: 'text', text }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`whitespace MCP server v${VERSION} ready on stdio\n`);
}
