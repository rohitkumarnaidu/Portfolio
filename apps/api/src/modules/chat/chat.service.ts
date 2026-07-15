import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { PrismaService } from '../../common/database/prisma.service';
import { paginateQuery } from '../../common/database/pagination.helper';
import { MessageRole } from '../../../generated/prisma/client';
import type { SendMessageDto } from './dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getOrCreateConversation(sessionId: string, visitorId?: string, pageContext?: string) {
    let conversation = await this.prisma.chatConversation.findUnique({ where: { sessionId } });
    if (!conversation) {
      conversation = await this.prisma.chatConversation.create({
        data: { sessionId, visitorId, pageContext },
      });
    }
    return conversation;
  }

  async addMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
    tokensUsed?: number,
    responseTimeMs?: number,
    metadata?: Record<string, unknown>,
  ) {
    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId,
        role,
        content,
        tokensUsed: tokensUsed ?? 0,
        responseTimeMs: responseTimeMs ?? 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      (args) =>
        this.prisma.chatMessage.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' },
          ...args,
        }),
      () => this.prisma.chatMessage.count({ where: { conversationId } }),
      opts,
    );
  }

  async listConversations(opts?: { page?: number; perPage?: number }) {
    return paginateQuery(
      (args) =>
        this.prisma.chatConversation.findMany({
          where: { deletedAt: null },
          orderBy: { lastActivityAt: 'desc' },
          ...args,
        }),
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

  async streamChat(dto: SendMessageDto, res: Response) {
    const conversation = await this.getOrCreateConversation(
      dto.sessionId,
      undefined,
      dto.pageContext,
    );
    await this.addMessage(conversation.id, MessageRole.user, dto.content);

    // Fetch previous messages for AI context
    const previousMessages = await this.prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
    });
    const history = previousMessages.map((m) => ({ role: m.role, content: m.content }));

    const aiUrl = this.configService.get<string>('app.AI_API_URL') || 'http://localhost:8000';

    try {
      const aiResponse = await fetch(`${aiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: conversation.id,
          message: dto.content,
          page_context: dto.pageContext || '',
          history,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI service error: ${aiResponse.statusText}`);
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (!aiResponse.body) {
        res.end();
        return;
      }

      const reader = aiResponse.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';

      /* eslint-disable no-constant-condition */
      while (true) {
        /* eslint-enable no-constant-condition */
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const message = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          for (const line of message.split('\n')) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                await this.addMessage(conversation.id, MessageRole.assistant, fullResponse);
                res.write('data: [DONE]\n\n');
                res.end();
                return;
              }
              fullResponse += data;
              res.write(`data: ${data}\n\n`);
            }
          }
        }
      }

      // Process any remaining data after stream ends
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6);
        if (data && data !== '[DONE]') {
          fullResponse += data;
          res.write(`data: ${data}\n\n`);
        }
      }

      if (fullResponse) {
        await this.addMessage(conversation.id, MessageRole.assistant, fullResponse);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      this.logger.error('Error proxying chat stream:', err);
      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.write('data: {"type":"error","content":"Internal error"}\n\n');
        res.end();
      }
    }
  }
}
