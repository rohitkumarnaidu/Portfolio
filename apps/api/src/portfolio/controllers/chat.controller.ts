import { Controller, Post, Get, Param, Body, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ChatService } from '../../modules/chat/chat.service';
import { SendMessageDto } from '../../modules/chat/dto';

@ApiTags('Portfolio - Chat')
@Controller('portfolio/chat')
export class PortfolioChatController {
  constructor(private readonly chat: ChatService) {}

  @Post('messages')
  @ApiOperation({ summary: 'Send a chat message (public)' })
  async sendMessage(@Body() dto: SendMessageDto, @Res() res: Response) {
    return this.chat.streamChat(dto, res);
  }

  @Get(':sessionId/messages')
  @ApiOperation({ summary: 'Get messages for a session (public)' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'perPage', required: false })
  async getMessages(@Param('sessionId') sessionId: string, @Query('page') page?: string, @Query('perPage') perPage?: string) {
    const conversation = await this.chat.getOrCreateConversation(sessionId);
    return this.chat.getMessages(conversation.id, { page: page ? +page : 1, perPage: perPage ? +perPage : 50 });
  }
}
