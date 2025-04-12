import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { MCPClient } from './mcp-client.service';
import { MessageDto } from './chat.dto';
import { MessageParam } from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import { createHash } from 'crypto';

interface Profile {
  createVaults: number,
  depositVault: number,
  totalVaults: number,
  joinedVault: number,
  yourDeposit: string,
  yourPnl: string,
  yourTotalPnl: string,
  allTimeTVL: string,
  detail: {
    id: string;
    name: string;
    address: string;
    chainType: string;
    role: string;
  }
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRedis() private readonly redis: any,
    private readonly mcpClient: MCPClient,
  ) {
    this.mcpClient.connectToServer(process.env.MCP_SERVER_SCRIPT_PATH);
  }


  parseBearerToken(authorizationHeader: string | undefined): string | null {
    if (!authorizationHeader) {
      return null;
    }

    const parts = authorizationHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1];
    }
    return null;
  }

  async processQuery(authorization: string, payload: MessageDto): Promise<any> {
    try {
      const accessToken = this.parseBearerToken(authorization);
      if (accessToken == null) {
        throw new UnauthorizedException("Missing accessToken")
      }

      const profileKey = this.createHash(accessToken);
      let profileCached = await this.redis.get(profileKey);
      var profile: Profile;

      if (!profileCached) {
        profile = await this.getProfileByAccessToken(accessToken);
        if (!profile) {
          throw new UnauthorizedException("Invalid accessToken")
        }
        await this.redis.set(profileKey, JSON.stringify(profile), 'EX', 300); // 5 minutes
      } else {
        profile = JSON.parse(profileCached);
      }

      // Get cached messages
      var messages: MessageParam[] = [];
      const redisKey = `messages_${profile.detail.id}`;
      const cachedMessages = await this.redis.get(redisKey)
      if (cachedMessages) { // messages not empty, merge into messages
        messages = JSON.parse(cachedMessages);
      } else {
        // Init first message
        messages = this.mcpClient.getInitMessages();
      }
      var content = payload.message;
      if(payload.vaultId) {
        content += `, vaultId = ${payload.vaultId}`
      }
      messages.push({
        role: "user",
        content: content,
      });
      const mcpResponse = await this.mcpClient.processQueryAnthropic(messages, accessToken, profile.detail.address);
      this.redis.set(redisKey, JSON.stringify(mcpResponse.messages), 'EX', 600); // 10 minutes for each chat sections

      return {
        errorCode: 0,
        message: 'Success',
        data: {
          content: mcpResponse.content,
          requireSignature: mcpResponse.requireSignature,
          dataToSign: mcpResponse?.dataToSign || '',
          contractAddress: mcpResponse?.contractAddress || '',
          action: mcpResponse?.action || '',
          customParams: mcpResponse?.customParams || {},
        }
      }
    } catch (error) {
      console.error(error);
      return {
        errorCode: -1,
        message: 'Error'
      }
    }

  }

  async getProfileByAccessToken(accessToken: string) {
    try {
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/user/profile`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${accessToken}`
          }
        },
      );

      const result = await response.json();
      if (result.statusCode == 200) {
        return result.data;
      }
      return false;
    } catch (error) {
      console.error("getProfileByAccessToken Error:", error);
      return false;
    }
  }
  createHash(data: string): string {
    const hash = createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  }
}
