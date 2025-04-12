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

export const pancakeSwap: Tool = {
  name: "creator_swap_token_pancake",
  description: "Help creator of the vault execute swap action on pancakeswap",
  inputSchema: {
    type: "object",
    properties: {
      vaultId: {
        type: "string",
        description: "ID of vault for deposit, format UUID",
      },
      sourceToken: {
        type: "string",
        description: "source token to execute swap trading",
      },
      targetToken: {
        type: "string",
        description: "target token to execute swap trading",
      },
      amount: {
        type: "number",
        description: "Amount of source token to swap",
      },
    },
    required: ["vaultId", "sourceToken", "targetToken", "amount"],
  },
}

export const getUserInfo: Tool = {
  name: "partnr_get_my_info",
  description: "Help user get basic profile info, include wallet address and other info",
  inputSchema: {
    type: "object",
    properties: {},
  },
}

export const depositTool: Tool = {
  name: "partnr_deposit_vault",
  description: "Help user deposit into Vault",
  inputSchema: {
    type: "object",
    properties: {
      vaultId: {
        type: "string",
        description: "ID of vault for deposit, format UUID, get from id field of tool list all vaults",
      },
      amount: {
        type: "number",
        description: "Amount to deposit",
      },
    },
    required: ["vaultId", "amount"],
  },
}
export const withdrawTool: Tool = {
  name: "partnr_withdraw_vault",
  description: "Withdraw assets from Vault",
  inputSchema: {
    type: "object",
    properties: {
      vaultId: {
        type: "string",
        description: "ID of vault that need to withdraw, format UUID, get from id field of tool list all vaults",
      },
      amount: {
        type: "number",
        description: "Amount to withdraw",
      },
    },
    required: ["vaultId", "amount"],
  },
}
export const listDepositorsTool: Tool = {
  name: "partnr_list_depositors",
  description: "List depositors of a Vault",
  inputSchema: {
    type: "object",
    properties: {
      vaultId: {
        type: "string",
        description: "ID of vault that need list of depositor, format UUID, get from id field of tool list all vaults",
      },
      limit: {
        type: "number",
        description: "Limit items per page",
        default: 20
      },
      page: {
        type: "number",
        description: "page for pagination",
        default: 1
      }
    },
    required: ["vaultId"],
  },
}

export const getMyPnLTool: Tool = {
  name: "partnr_get_my_pnl",
  description: "Get user profit and loss",
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
      defaultProtocolId: {
        type: "string",
        description: "default protocolId of the Vault to create, format UUID, get from id field of tool list protocols, default is id of protocol pancake"
      },
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

export const creatorListVaultTransactionsTool: Tool = {
  name: "creator_list_vault_transactions",
  description: "List all transactions from a Vault on Partnr System",
  inputSchema: {
    type: "object",
    properties: {
      vaultId: {
        type: "string",
        description: "The ID of the vault to list transactions, format UUID, get from id field of tool list created vaults",
      },
      type: {
        type: "string",
        description: "type of requests, Available values : DEPOSIT, WITHDRAW",
        enum: ["DEPOSIT", "WITHDRAW"]
      },
      status: {
        type: "string",
        description: "Status of requests, Available values : PENDING, AWAITING, AWAITING_SUBMIT, CONFIRMED, WITHDRAWING, COMPLETED, FAILED",
        enum: ["PENDING", "AWAITING", "AWAITING_SUBMIT", "CONFIRMED", "WITHDRAWING", "COMPLETED", "FAILED"]
      },
      limit: {
        type: "number",
        description: "Limit for api call",
        default: 20,
      },
      page: {
        type: "number",
        description: "page for pagination",
        default: 1,
      },
    },
    required: ["vaultId"],
  },
};

export const listVaultActivitiesTool: Tool = {
  name: "creator_list_vault_activities",
  description: "List vault activities and trading history on Partnr System",
  inputSchema: {
    type: "object",
    properties: {
      vaultId: {
        type: "string",
        description: "The ID of the vault to get activities, format UUID, get from id field of tool list created vaults",
      },
      type: {
        type: "string",
        description: "Type of activity",
        enum: ["STAKING", "UNSTAKING", "BORROW", "REPAY", "TRADING", "SWAP", "BUY", "SELL"],
      },
      protocol: {
        type: "string",
        description: "Protocol of activity",
        enum: ["venus", "apex", "aave", "drift", "pancake"],
      },
      status: {
        type: "string",
        description: "Status of activity",
        enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "OPEN", "FILLED", "CANCELED", "EXPIRED", "UNTRIGGERED", "SUCCESS", "SUCCESS_L2_APPROVED"],
      },
      limit: {
        type: "number",
        description: "Limit for api call",
        default: 20,
      },
      page: {
        type: "number",
        description: "page for pagination",
        default: 1,
      },
    },
    required: ["vaultId"],
  },
};

export const listOpenPositionsTool: Tool = {
  name: "creator_list_open_positions",
  description: "List vault open long/short positions",
  inputSchema: {
    type: "object",
    properties: {
      vaultId: {
        type: "string",
        description: "The ID of the vault to get positions, format UUID, get from id field of tool list created vaults",
      },
      protocol: {
        type: "string",
        description: "Protocol of activity",
        enum: ["venus", "apex", "aave", "drift", "pancake"],
      },
      limit: {
        type: "number",
        description: "Limit for api call",
        default: 20,
      },
      page: {
        type: "number",
        description: "page for pagination",
        default: 1,
      },
    },
    required: ["vaultId"],
  },
};