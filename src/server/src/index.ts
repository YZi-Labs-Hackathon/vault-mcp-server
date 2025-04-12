#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { PartnrClient } from "./PartnrClient";
import * as Interfaces from './interfaces';
import * as Tools from './tools';

async function main() {
  console.error("Starting Partnr MCP Server...");
  const server = new Server(
    {
      name: "Partnr MCP Server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  
  const partnrClient = new PartnrClient();
  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      console.error("Received CallToolRequest:", request);
      try {
        if (!request.params.arguments) {
          throw new Error("No arguments provided");
        }
        var initArgs = request.params.arguments as unknown as Interfaces.InitArgs;
        if (!initArgs.accessToken || !initArgs.userAddress || !initArgs.baseUrl) {
          throw new Error(
            "Missing required arguments: accessToken, userAddress or baseUrl",
          );
        }

        
        await partnrClient.connect(initArgs.accessToken, initArgs.userAddress, initArgs.baseUrl);
        switch (request.params.name) {
          case "partnr_list_chains": {
            const response = await partnrClient.listChains();
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "partnr_list_protocols": {
            const response = await partnrClient.listProtocols();
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "partnr_list_tokens": {
            const args = request.params.arguments as unknown as Interfaces.ListTokenArgs;
            if (!args.chainId) {
              throw new Error(
                "Missing required arguments: chainId",
              );
            }
            const response = await partnrClient.listTokens(args.chainId);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        console.error("Error executing tool:", error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
              }),
            },
          ],
        };
      }
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("Received ListToolsRequest");
      return {
        tools: [
          Tools.listChainsTool,
          Tools.listProtocolsTool,
          Tools.listTokensTool,
        ],
      };

  });

  const transport = new StdioServerTransport();
  console.error("Connecting server to transport...");
  await server.connect(transport);
  console.error("Partnr MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});