# Werk

My personal workflows, tools, and utilities.

## Development

This is a deno project.

Deno `2.3.3`

### MCP Server

This project includes a minimal MCP server for development purposes. To run it, use the following command:

```bash
deno task dev-mcp # development
deno task run-mcp # production
```

Configure your MCP Client to connect to the server.

**Warp**
```json
{
  "werk-mcp": {
    "command": "deno",
    "args": [
      "task",
      "run-mcp"
    ],
    "env": {},
    "working_directory": "/path/to/werk"
  }
}
```

**Claude Code**
```shell
claude mcp add werk-mcp deno task run-mcp /path/to/werk/src/mcp.ts
```
