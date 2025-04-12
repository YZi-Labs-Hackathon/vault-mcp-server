// Tool definitions
import {
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

export const clearConversation: Tool = {
  name: "partnr_clear_conversation",
  description: "Clear all cached messages for current user",
  inputSchema: {
    type: "object",
    properties: {},
  },
}

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

export const createVaultTool: Tool = {
  name: "creator_create_vault",
  description: "Create new Vault. Name, symbol, tokenId, defaultProtocolId input by user, tokenId and defaultProtocolId format UUID",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the Vault to create, required",
      },
      logo: {
        type: "string",
        description: "Logo of the Vault to create, image url, optional",
      },
      description: {
        type: "string",
        description: "Description of the Vault to create, optional, can auto generate",
      },
      symbol: {
        type: "string",
        description: "Optional, 4 characters, should auto generate base on name of vault",
      },
      tokenId: {
        type: "string",
        description: "tokenId of the Vault to create, format UUID, get from id field of tool list tokens, optional",
      },
      // protocolIds: {
      //   type: "array",
      //   items: { type: "string" },
      //   description: "List protocolIds of the Vault to create, can select multiple protocols, default include if of protocol pancake and venus"
      // },
      // defaultProtocolId: {
      //   type: "string",
      //   description: "default protocolId of the Vault to create, format UUID, get from id field of tool list protocols, default is id of protocol pancake"
      // },
      depositMin: {
        type: "number",
        description: "Minimum deposit to Vault, without token decimals, optional, default 0",
        default: 0,
      },
      depositMax: {
        type: "number",
        description: "Maximum deposit to Vault, without token decimals, optional, default 1000",
        default: 1000
      },
      performanceFee: {
        type: "number",
        description: "performance fee, optional, default 5",
        default: 5,
        minimum: 5
      },
      exitFee: {
        type: "number",
        description: "exit fee, optional, default 0",
        default: 0
      },
      withdrawLockUpPeriod: {
        type: "number",
        description: "Withdraw lock period after deposit, second unit, optional, default 0",
        default: 0
      },
      withdrawDelay: {
        type: "number",
        description: "Withdraw delay time, second unit, optional default 0",
        default: 0
      },
      initDeposit: {
        type: "number",
        description: "Init deposit amount for Vault, optional, default 1",
        default: 1
      }
    },
    required: ["name"],
  },
};

export const creatorListCreatedVaultsTool: Tool = {
  name: "creator_list_created_vaults",
  description: "List your created vaults on Partnr Backend",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        description: "Status of vaults to list",
        enum: ["ACTIVE", "PAUSE", "CLOSE"]
      }
    },
  },
};

export const listVaultsTool: Tool = {
  name: "partnr_list_vaults",
  description: "List all vaults",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        description: "Status of vaults to list",
        enum: ["ACTIVE", "PAUSE", "CLOSE"]
      }
    },
    required: ["status"],
  },
};

export const vaultDetailTool: Tool = {
  name: "partnr_vault_detail",
  description: "Get detail of Vault by vaultId",
  inputSchema: {
    type: "object",
    properties: {
      vaultId: {
        type: "string",
        description: "The ID of the vault to get detail, format UUID. Get from id field of tool list all vaults",
      },
    },
    required: ["vaultId"],
  },
};

export const vaultUpdateTool: Tool = {
  name: "creator_update_vault",
  description: "Update exist Vault on Partnr System",
  inputSchema: {
    type: "object",
    properties: {
      vaultId: {
        type: "string",
        description: "Id of the Vault to update, format UUID, get from id field of tool list created vaults",
      },
      logo: {
        type: "string",
        description: "Logo of the Vault to update, image url",
      },
      description: {
        type: "string",
        description: "Description of the Vault to update",
      },
      withdrawLockUpPeriod: {
        type: "number",
        description: "Withdraw lock-up period of the Vault to update",
      },
      withdrawDelay: {
        type: "number",
        description: "Withdraw delay of the Vault to update",
      },
      performanceFee: {
        type: "number",
        description: "performance fee",
        minimum: 5
      },
      feeRecipientAddress: {
        type: "string",
        description: "wallet address to receive fee"
      },
      depositMin: {
        type: "number",
        description: "Minimal deposit of the Vault",
      },
      depositMax: {
        type: "number",
        description: "Maximum deposit of the Vault",
      },
      protocolIds: {
        type: "array",
        items: { type: "string" },
        description: "List protocolIds of the Vault to create, can select multiple protocols"
      },
    },
    required: ["vaultId"],
  },
};