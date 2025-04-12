import { Injectable } from '@nestjs/common';
import { Anthropic } from "@anthropic-ai/sdk";
import {
    MessageParam,
    Tool,
} from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { OpenAI } from "openai";


@Injectable()
export class MCPClient {
    private mcp: Client;
    private anthropic: Anthropic;
    private openai: OpenAI;
    private transport: StdioClientTransport | null = null;
    private tools: Tool[] = [];
    private openaiTools = [];
    private modelAnthropic = "claude-3-5-sonnet-20241022"; //'claude-3-5-haiku-20241022, claude-3-5-sonnet-20241022'
    private modelOpenAI = "gpt-4";
    private maxToken = 500;
    private availableTools = [];
    private initMessages = [
        {
            role: "assistant",
            content: "Greetings! I am your assistant to help you manage vaults on Partnr Ecosystem. Please provide your vault-related questions or tasks, and I will assist you.",
        },
        {
            role: "user",
            content: "Only response usefull data to show for users, id fields should hidden",
        },
        {
            role: "user",
            content: "for action create vault, symbol should be auto generated and do not asking for input, and if tokenId not set, using tokenId = 4bf4cb78-7572-40df-8232-4582af1aef7b (USDT token)",
        }
    ];

    constructor() {
        console.log(`Init MCPClient`);
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            dangerouslyAllowBrowser: true,
        });
        this.initMessages = []

        this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
    }

    getInitMessages() {
        return this.initMessages;
    }
    async connectToServer(serverScriptPath: string) {
        try {
            const isJs = serverScriptPath.endsWith(".js");
            const isPy = serverScriptPath.endsWith(".py");
            if (!isJs && !isPy) {
                throw new Error("Server script must be a .js or .py file");
            }
            const command = isPy
                ? process.platform === "win32"
                    ? "python"
                    : "python3"
                : process.execPath;

            this.transport = new StdioClientTransport({
                command,
                args: [serverScriptPath],
            });
            this.mcp.connect(this.transport);

            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => {
                this.openaiTools.push({
                    type: 'function',
                    function: {
                        name: tool.name,
                        description: tool.description,
                        parameters: tool.inputSchema
                    }
                });
                this.availableTools[tool.name] = tool.name;
                return {
                    name: tool.name,
                    description: tool.description,
                    input_schema: tool.inputSchema,
                };
            });
            console.log(
                "Connected to server with tools:",
                this.tools.map(({ name }) => name)
            );
        } catch (e) {
            console.log("Failed to connect to MCP server: ", e);
            throw e;
        }
    }

    async processQueryAnthropic(messages: MessageParam[], accessToken: string, address: string): Promise<any> {
        //console.log("messages", messages);
        var res = {
            content: [],
            requireSignature: false,
            action: '',
            dataToSign: "",
            contractAddress: "",
            messages: messages,
            customParams: {}
        };
        const finalText = [];
        //for (let i = 0; i < 10; i++) {
        const response = await this.anthropic.messages.create({
            model: this.modelAnthropic,
            max_tokens: this.maxToken,
            messages,
            tools: this.tools,
        });
        for (const content of response.content) {
            if (content.type === "text") {
                finalText.push(content.text);
                messages.push({
                    role: "assistant",
                    content: content.text,
                });
            } else if (content.type === "tool_use") {
                const toolName = content.name;
                if (toolName == 'partnr_clear_conversation') {
                    res.messages = this.initMessages;
                    finalText.push("The conversation history was cleared successfully.");
                    res.content = finalText;
                    return res;
                }
                var toolArgs = content.input as { [x: string]: unknown } | undefined;
                if (toolArgs == undefined) {
                    toolArgs = {
                        accessToken: accessToken,
                        userAddress: address,
                        baseUrl: process.env.BACKEND_URL,
                    }
                } else {
                    toolArgs.accessToken = accessToken;
                    toolArgs.userAddress = address;
                    toolArgs.baseUrl = process.env.BACKEND_URL;
                }

                var result = await this.mcp.callTool({
                    name: toolName,
                    arguments: toolArgs,
                });
                console.error(result);
                delete toolArgs.accessToken;
                delete toolArgs.userAddress;
                delete toolArgs.baseUrl;

                // finalText.push(
                //     //`[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`
                //     //`[Calling tool ${toolName}]`
                // );
                // Process if require signature
                if (result.content && Array.isArray(result.content) && typeof result.content[0]?.text === 'string') {
                    messages.push({
                        role: "assistant",
                        content: result.content[0].text,
                    });
                    const toolResponse = JSON.parse(result.content[0].text);
                    if (toolResponse.requireSignature === true) {
                        if (toolResponse.message) {
                            finalText.push(toolResponse.message);
                        }
                        res.requireSignature = true;
                        res.action = toolResponse.action;
                        res.dataToSign = toolResponse.dataToSign;
                        res.contractAddress = toolResponse.contractAddress;
                        res.content = finalText;
                        res.messages = messages;
                        res.customParams['vaultId'] = toolArgs?.vaultId || '';
                        res.customParams['vaultContract'] = toolResponse?.vaultContract || '';
                        return res;
                    }
                }

                const response = await this.anthropic.messages.create({
                    model: this.modelAnthropic,
                    max_tokens: this.maxToken,
                    messages,
                });
                console.error(response);

                const assistantMessage = response.content[0].type === "text" ? response.content[0].text : "";
                if (assistantMessage != '') {
                    messages.push({
                        role: "assistant",
                        content: assistantMessage,
                    });
                    finalText.push(assistantMessage);
                }
            }
        }
        //}
        res.messages = messages;
        res.content = finalText;
        return res;
    }

    async processQueryOpenAI(messages: MessageParam[], accessToken: string, address: string): Promise<any> {
        //console.log("messages", messages);
        var res = {
            content: [],
            requireSignature: false,
            action: '',
            dataToSign: "",
            contractAddress: "",
            messages: messages,
            customParams: {}
        };

        const finalText = [];
        for (let i = 0; i < 10; i++) {
            const response = await this.openai.chat.completions.create({
                model: this.modelOpenAI,
                max_tokens: this.maxToken,
                messages: messages,
                tools: this.openaiTools,
            });
            const { finish_reason, message } = response.choices[0];
            console.error({
                finish_reason,
                message
            });
            if (finish_reason === "tool_calls" && message.tool_calls) {
                const functionName = message.tool_calls[0].function.name;
                if (functionName == 'partnr_clear_conversation') {
                    res.messages = this.initMessages;
                    res.content = ["The conversation history was cleared successfully."];
                    return res;
                }

                const functionToCall = this.availableTools[functionName];
                console.error({ functionToCall })
                var functionArgs = JSON.parse(message.tool_calls[0].function.arguments);
                //const functionArgsArr = Object.values(functionArgs);
                //const functionResponse = await functionToCall.apply(null, functionArgsArr);

                if (functionArgs == undefined) {
                    functionArgs = {
                        accessToken: accessToken,
                        userAddress: address,
                        baseUrl: process.env.BACKEND_URL,
                    }
                } else {
                    functionArgs.accessToken = accessToken;
                    functionArgs.userAddress = address;
                    functionArgs.baseUrl = process.env.BACKEND_URL;
                }
                var functionResponse = await this.mcp.callTool({
                    name: functionName,
                    arguments: functionArgs,
                });
                console.error(functionResponse);
                delete functionArgs.accessToken;
                delete functionArgs.userAddress;
                delete functionArgs.baseUrl;

                //const assistantMessage = `[Calling tool ${functionName} with args ${JSON.stringify(functionArgs)}]`;
                const assistantMessage = `[Calling tool ${functionName}]`;
                finalText.push(assistantMessage);
                // messages.push({
                //     role: "assistant",
                //     content: assistantMessage,
                // });
                messages.push({
                    role: "function",
                    name: functionName,
                    content: `
                    The result of the last function was this: ${JSON.stringify(
                        functionResponse
                    )}
                    `,
                });

                // Process if require signature
                if (functionResponse.content && Array.isArray(functionResponse.content) && typeof functionResponse.content[0]?.text === 'string') {
                    // messages.push({
                    //     role: "assistant",
                    //     content: functionResponse.content[0].text,
                    // });
                    const toolResponse = JSON.parse(functionResponse.content[0].text);
                    if (toolResponse.requireSignature === true) {
                        if (toolResponse.message) {
                            finalText.push(toolResponse.message);
                        }
                        res.requireSignature = true;
                        res.action = toolResponse.action;
                        res.dataToSign = toolResponse.dataToSign;
                        res.contractAddress = toolResponse.contractAddress;
                        res.content = finalText;
                        res.messages = messages;
                        res.customParams['vaultId'] = functionArgs?.vaultId || '';
                        res.customParams['vaultContract'] = toolResponse?.vaultContract || '';
                        return res;
                    }
                }
                //finalText.push(functionResponse.content[0].text); // will cause json data

            } else if (finish_reason === "stop") {
                messages.push(message);
                if (!this.isJsonString(message.content)) {
                    finalText.push(message.content);
                }
                res.content = finalText;
                res.messages = messages;
                return res;
            }
        }
        res.messages = messages;
        res.content = ["The maximum number of iterations has been met without a suitable answer. Please try again with a more specific input."];
        return res;
    }
    async cleanup() {
        await this.mcp.close();
    }

    isJsonString(str: string): boolean {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
}