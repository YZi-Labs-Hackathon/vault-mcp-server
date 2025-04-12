import {
  Controller,
  Post,
  Body,
  Headers,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags } from '@nestjs/swagger';
import { MessageDto } from './chat.dto';
import { SuccessResponse } from '@modules/shared/shared.types';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('messages')
  async messages(@Headers('Authorization') authorization: string, @Body() payload: MessageDto): Promise<SuccessResponse> {
    return await this.chatService.processQuery(authorization, payload)
  }
}
