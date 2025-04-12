import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ConfigModule } from '@nestjs/config';
import { MCPClient } from './mcp-client.service';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, MCPClient],
  exports: [ChatService],
})
export class ChatModule {}