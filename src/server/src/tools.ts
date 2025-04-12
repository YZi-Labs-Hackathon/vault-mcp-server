// Tool definitions
import {
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

export const listChainsTool: Tool = {
  name: "partnr_list_chains",
  description: "List supported chains on Partnr Backend",
  inputSchema: {
    type: "object",
    properties: {
      chainType: {
        type: "string",
        description: "Chain type EVM, SOLANA, APTOS, TON",
        default: "EVM",
      },
    },
  },
};

export const listProtocolsTool: Tool = {
  name: "partnr_list_protocols",
  description: "List supported protocols on Partnr Backend",
  inputSchema: {
    type: "object",
    properties: {

    },
  },
};

export const listTokensTool: Tool = {
  name: "partnr_list_tokens",
  description: "List supported tokens on Partnr Backend by chainId",
  inputSchema: {
    type: "object",
    properties: {
      chainId: {
        type: "string",
        description: "The ID of the chain to list",
        default: 56
      },
    },
    required: ["chainId"],
  },
};