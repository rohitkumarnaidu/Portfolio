import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { ChatService } from '../../modules/chat/chat.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Admin - Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/chat')
export class AdminChatController {
  constructor(private readonly chat: ChatService) {}

  @Get('conversations')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'List chat conversations (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  async listConversations(@Query('page') page?: string, @Query('perPage') perPage?: string) {
    return this.chat.listConversations({
      page: page ? +page : 1,
      perPage: perPage ? +perPage : 50,
    });
  }

  @Get(':id/messages')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get messages for a conversation (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  async getMessages(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    return this.chat.getMessages(id, { page: page ? +page : 1, perPage: perPage ? +perPage : 50 });
  }

  @Delete(':id')
  @Roles('admin')
  @Audit({ action: 'delete', resource: 'chat_conversation' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a conversation' })
  async deleteConversation(@Param('id') id: string) {
    await this.chat.deleteConversation(id);
  }
}
