#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { PartnrClient, Fee, WithdrawTerm, DepositRule, ActivityStatus, VaultStatus } from "./PartnrClient";
import { parseUnits } from "ethers";
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

          case "creator_create_vault": {
            const args = request.params.arguments as unknown as Interfaces.CreateVaultArgs;
            if (!args.name) {
              throw new Error(
                "Missing required arguments: name",
              );
            }
            if (!args.tokenId) {
              args.tokenId = '4bf4cb78-7572-40df-8232-4582af1aef7b'; // default USDT
            }
            if (!args.defaultProtocolId) {
              args.defaultProtocolId = '0135856e-f6ba-49c0-82e5-f1050e85396b'; // pancake
            }
            const tokenDetail = await partnrClient.getTokenDetail(args.tokenId);
            if(tokenDetail.statusCode != 200) {
                throw new Error(
                  "invalid tokenId",
                );
            }
            const initDeposit = args?.initDeposit || 1;
            const initDepositAmount = parseUnits(initDeposit.toString(), parseInt(tokenDetail.data.decimals));

            console.error("CreateVaultArgs", args);
            const depositRule: DepositRule = {
              min: args.depositMin || 0,
              max: args.depositMax || 10000,
            }
            const fee: Fee = {
              performanceFee: 5,
              recipientAddress: initArgs.userAddress,
              exitFee: 0,
            }
            const withdrawTerm: WithdrawTerm = {
              lockUpPeriod: 0,
              delay: 0,
              isMultiSig: false,
            }

            var response = await partnrClient.createVault(
              args.name,
              args.logo || '',
              args.description || '',
              args.symbol || args.name,
              args.tokenId,
              [args.defaultProtocolId], // pancake
              args.defaultProtocolId, // pancake
              depositRule, fee, withdrawTerm,
              initDepositAmount
            );
            return {
              content: [{
                type: "text", text: JSON.stringify(response)
              }],
            };
          }

          case "creator_list_created_vaults": {
            const args = request.params.arguments as unknown as Interfaces.ListVaultArgs;
            if (!args.status) {
              args.status = VaultStatus.ACTIVE;
            }
            const response = await partnrClient.listCreatorVaults(args.status);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "partnr_list_vaults": {
            const args = request.params.arguments as unknown as Interfaces.ListVaultArgs;
            if (!args.status) {
              args.status = VaultStatus.ACTIVE;
            }
            const response = await partnrClient.listVaults(args.status);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "partnr_vault_detail": {
            const args = request.params.arguments as unknown as Interfaces.VaultDetailArgs;
            if (!args.vaultId) {
              throw new Error(
                "Missing required arguments: vaultId",
              );
            }
            const response = await partnrClient.getVaultDetail(args.vaultId);
            const mcpResponse = {
              statusCode: response.statusCode,
              message: response.message,
              data: {
                name: response.data.name,
                logo: response.data.logo,
                description: response.data.description,
                symbol: response.data.symbol,
                chainName: response.data.chain.name,
                tokenName: response.data.token.name,
                creatorAddress: response.data.creator.address,
                depositRule: response.data.depositRule,
                withdrawTerm: response.data.withdrawTerm,
                fee: response.data.fee,
                contractAddress: response.data.contractAddress,
                shareTokenAddress: response.data.shareTokenAddress,
                status: response.data.status,

                totalLock: response.data.totalLock,
                yourDeposit: response.data.yourDeposit,
                apy: response.data.apy,
                yourPnl: response.data.yourPnl,
                allTimePnl: response.data.allTimePnl,
                age: response.data.age,
                profitShare: response.data.profitShare,
                maxDrawDown: response.data.maxDrawDown,
                yourPnl24h: response.data.yourPnl24h
              }
            }
            return {
              content: [{ type: "text", text: JSON.stringify(mcpResponse) }],
            };
          }
          case "creator_update_vault": {
            const args = request.params.arguments as unknown as Interfaces.VaultUpdateArgs;
            if (!args.vaultId) {
              throw new Error(
                "Missing required arguments: vaultId",
              );
            }

            const vaultDetail = await partnrClient.getVaultDetail(args.vaultId);
            console.error(vaultDetail.data);
            const depositRule: DepositRule = {
              min: args.depositMin || vaultDetail.data.depositRule.min,
              max: args.depositMax || vaultDetail.data.depositRule.max,
            }
            const fee: Fee = {
              performanceFee: args.performanceFee || vaultDetail.data.fee.performanceFee,
              recipientAddress: args.feeRecipientAddress || vaultDetail.data.fee.recipientAddress,
              exitFee: vaultDetail.data.fee.exitFee,
            }
            const withdrawTerm: WithdrawTerm = {
              lockUpPeriod: args.withdrawLockUpPeriod || vaultDetail.data.withdrawTerm.lockUpPeriod,
              delay: args.withdrawDelay || vaultDetail.data.withdrawTerm.delay,
              isMultiSig: vaultDetail.data.withdrawTerm.isMultiSig,
            }

            const response = await partnrClient.updateVault(
              args.vaultId,
              args.logo || vaultDetail.data.logo,
              args.description || vaultDetail.data.description,
              depositRule, fee, withdrawTerm,
              args.protocolIds || []
            );
            if (response.statusCode == 200) {
              return {
                content: [{ type: "text", text: JSON.stringify(response) }],
              };
            }
          }

          // Withdraw
          case "creator_list_vault_transactions": {
            const args = request.params.arguments as unknown as Interfaces.ListTransactionArgs;
            if (!args.vaultId) {
              throw new Error(
                "Missing required arguments: vaultId",
              );
            }
            let query = {
              limit: args.limit?.toString() || "20",
              page: args.page?.toString() || "1"
            };
            if (args.type) {
              query["type"] = args.type;
            }
            if (args.status) {
              query["status"] = args.status;
            }
            const response = await partnrClient.creatorListVaultTransactions(args.vaultId, query);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "creator_list_vault_activities": {
            const args = request.params.arguments as unknown as Interfaces.ListVaultActivitiesArgs;
            if (!args.vaultId) {
              throw new Error(
                "Missing required arguments: vaultId",
              );
            }
            let query = {
              limit: args.limit || "20",
              page: args.page || "1"
            };
            if (args.type) {
              query["type"] = args.type;
            }
            if (args.protocol) {
              query["protocol"] = args.protocol;
            }

            const response = await partnrClient.listVaultActivities(args.vaultId, query);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "creator_list_open_positions": {
            const args = request.params.arguments as unknown as Interfaces.ListOpenPositionsArgs;
            if (!args.vaultId) {
              throw new Error(
                "Missing required arguments: vaultId",
              );
            }
            let query = {
              status: ActivityStatus.SUCCESS, // Open positions
              limit: args.limit || "20",
              page: args.page || "1"
            };
            if (args.protocol) {
              query["protocol"] = args.protocol;
            }
            console.error(query);
            const response = await partnrClient.listVaultActivities(args.vaultId, query);
            console.error(response);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "partnr_list_depositors": {
            const args = request.params.arguments as unknown as Interfaces.ListDepositorArgs;
            if (!args.vaultId) {
              throw new Error(
                "Missing required arguments: vaultId",
              );
            }
            let query = {
              limit: args.limit?.toString() || "20",
              page: args.page?.toString() || "1"
            };

            const response = await partnrClient.listVaultDepositors(args.vaultId, query);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "partnr_get_my_pnl": {
            const response = await partnrClient.getMyPnL();
            console.error(response);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "partnr_deposit_vault": {
            const args = request.params.arguments as unknown as Interfaces.DepositArgs;
            if (!args.vaultId || !args.amount) {
              throw new Error(
                "Missing required arguments: vaultId and amount",
              );
            }

            const response = await partnrClient.depositVault(args.vaultId, args.amount);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "partnr_withdraw_vault": {
            const args = request.params.arguments as unknown as Interfaces.WithdrawArgs;
            if (!args.vaultId || !args.amount) {
              throw new Error(
                "Missing required arguments: vaultId and amount",
              );
            }

            const response = await partnrClient.withdrawVault(args.vaultId, args.amount);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "partnr_clear_conversation": {
            return {
              content: [{ type: "text", text: JSON.stringify({message: 'Success'}) }],
            };
          }
          case "creator_swap_token_pancake": {
            const args = request.params.arguments as unknown as Interfaces.SwapPancakeArgs;
            if (!args.vaultId || !args.amount || !args.fromToken || !args.toToken) {
              throw new Error(
                "Missing required arguments: vaultId, fromToken, toToken, amount",
              );
            }

            const response = await partnrClient.swapTokenPancake(args.vaultId, args.fromToken, args.amount, args.toToken);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case 'partnr_get_my_info': {
            const response = await partnrClient.getProfileByAccessToken();
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
          Tools.clearConversation,
          Tools.listChainsTool,
          Tools.listProtocolsTool,
          Tools.listTokensTool,
          Tools.createVaultTool,
          Tools.creatorListCreatedVaultsTool,
          Tools.listVaultsTool,
          Tools.vaultDetailTool,
          Tools.vaultUpdateTool,
          Tools.listVaultActivitiesTool,
          Tools.listOpenPositionsTool,

          Tools.depositTool,
          Tools.withdrawTool,
          //Tools.listDepositedVaultsTool,
          Tools.listDepositorsTool,
          Tools.getMyPnLTool,
          Tools.getUserInfo,
          //Tools.pancakeSwap,
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