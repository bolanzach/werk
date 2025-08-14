
/**
 * MCP (Model Context Protocol) Server
 * Entry point for the Deno MCP server implementation
 */

import { Server } from "npm:@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "npm:@modelcontextprotocol/sdk/types.js";
import {diffCommitTool} from "./tools/commit.ts";


// Initialize the server
const server = new Server(
  {
    name: "werk-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, () => {
  return {
    tools: [
      {
        name: "commit_message",
        description: "Get the current git diff and instructions for generating a commit message",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  switch (name) {
    case "commit_message": {
      try {
        const [branch, diff] = await diffCommitTool();
        return {
          content: [
            {
              type: "text",
              text: `Current branch: ${branch}\n\nHere is the current git diff:\n\n${diff}\n\n---\n\nGenerate a git commit message following this EXACT format:\n\n<type>: <subject>\n\n- <bullet point 1>\n- <bullet point 2>\n- <bullet point 3>\n\nRULES:\n1. Type must be one of: feat, fix, docs, style, refactor, test, chore\n2. Subject line should be max 50 characters\n3. Include 3-5 bullet points describing the main changes\n4. DO NOT include any explanatory text before or after the commit message\n5. DO NOT include "Generated with", "Co-Authored-By", or any AI-related metadata\n6. DO NOT use markdown code blocks or backticks\n7. DO NOT add any introductory phrases like "Based on the changes" or "Here's the commit message"\n8. ONLY output the commit message text itself, nothing else\n\nYour response should start directly with the type (feat/fix/etc) and end with the last bullet point.`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${err.message ?? "An unknown error occurred"}`,
            },
          ],
        }
      }
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();

  // Handle graceful shutdown
  const handleShutdown = () => {
    console.error("Shutting down MCP server...");
    Deno.exit(0);
  };

  Deno.addSignalListener("SIGINT", handleShutdown);
  Deno.addSignalListener("SIGTERM", handleShutdown);

  await server.connect(transport);
  console.error("MCP server running on stdio");
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    Deno.exit(1);
  });
}
