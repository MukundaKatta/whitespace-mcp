# whitespace-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/whitespace-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/whitespace-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)

MCP server: normalize whitespace in text. Independent toggles for trimming,
collapsing internal runs, stripping empty lines, expanding tabs, and
unifying CRLF to LF.

## Tool

### `normalize`

```json
{
  "text": "  hello \t world  \n\n\n  ",
  "trim": true,
  "collapse_inline": true,
  "strip_empty_lines": true
}
```

→ `"hello world"`

## Configure

```json
{ "mcpServers": { "whitespace": { "command": "npx", "args": ["-y", "@mukundakatta/whitespace-mcp"] } } }
```

## License

MIT.
