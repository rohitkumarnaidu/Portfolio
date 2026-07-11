import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { paginateQuery } from '../../common/database/pagination.helper';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateConversation(sessionId: string, visitorId?: string, pageContext?: string) {
    let conversation = await this.prisma.chatConversation.findUnique({ where: { sessionId } });
    if (!conversation) {
      conversation = await this.prisma.chatConversation.create({
        data: { sessionId, visitorId, pageContext },
      });
    }
    return conversation;
  }

  async addMessage(conversationId: string, role: string, content: string, tokensUsed?: number, responseTimeMs?: number, metadata?: Record<string, any>) {
    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId,
        role,
        content,
        tokensUsed: tokensUsed ?? 0,
        responseTimeMs: responseTimeMs ?? 0,
        metadata: (metadata ?? {}) as any,
      },
    });
    await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { messageCount: { increment: 1 }, lastActivityAt: new Date() },
    });
    return message;
  }

  async getConversation(id: string) {
    const conversation = await this.prisma.chatConversation.findUnique({ where: { id } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async getMessages(conversationId: string, opts?: { page?: number; perPage?: number }) {
    return paginateQuery(
      (args) => this.prisma.chatMessage.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' }, ...args }),
      () => this.prisma.chatMessage.count({ where: { conversationId } }),
      opts,
    );
  }

  async listConversations(opts?: { page?: number; perPage?: number }) {
    return paginateQuery(
      (args) => this.prisma.chatConversation.findMany({ where: { deletedAt: null }, orderBy: { lastActivityAt: 'desc' }, ...args }),
      () => this.prisma.chatConversation.count({ where: { deletedAt: null } }),
      opts,
    );
  }

  async deleteConversation(id: string) {
    const existing = await this.prisma.chatConversation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Conversation not found');
    await this.prisma.chatConversation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
  async streamChat(dto: any, res: any) {
    const conversation = await this.getOrCreateConversation(dto.sessionId, undefined, dto.pageContext);
    await this.addMessage(conversation.id, 'user', dto.content);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          message: dto.content,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (!response.body) {
        res.end();
        return;
      }

      // stream response from fastAPI AI
      for await (const chunk of response.body as any) {
        res.write(chunk);
      }
      res.end();
    } catch (err) {
      this.logger.error('Error proxying chat stream:', err);
      res.status(500).end();
    }
  }
}
