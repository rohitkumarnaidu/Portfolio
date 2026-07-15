import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockConversation = {
  id: 'conv-1',
  sessionId: 'sess-1',
  visitorId: 'vis-1',
  pageContext: '/home',
  messageCount: 0,
  deletedAt: null,
  lastActivityAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMessage = {
  id: 'msg-1',
  conversationId: 'conv-1',
  role: 'user',
  content: 'Hello',
  tokensUsed: 0,
  responseTimeMs: 0,
  metadata: {},
  createdAt: new Date(),
};

const mockPrisma = {
  chatConversation: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  chatMessage: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

const mockConfig = {
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'app.AI_API_URL') return 'http://localhost:8000';
    return 'test';
  }),
};

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    jest.clearAllMocks();
  });

  describe('getOrCreateConversation', () => {
    it('should return existing conversation', async () => {
      mockPrisma.chatConversation.findUnique.mockResolvedValue(mockConversation);

      const result = await service.getOrCreateConversation('sess-1');

      expect(result).toEqual(mockConversation);
      expect(mockPrisma.chatConversation.create).not.toHaveBeenCalled();
    });

    it('should create new conversation if not existing', async () => {
      mockPrisma.chatConversation.findUnique.mockResolvedValue(null);
      mockPrisma.chatConversation.create.mockResolvedValue(mockConversation);

      const result = await service.getOrCreateConversation('sess-2', 'vis-2', '/about');

      expect(result).toEqual(mockConversation);
      expect(mockPrisma.chatConversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sessionId: 'sess-2',
            visitorId: 'vis-2',
            pageContext: '/about',
          }),
        }),
      );
    });
  });

  describe('addMessage', () => {
    it('should add a message and update conversation', async () => {
      mockPrisma.chatMessage.create.mockResolvedValue(mockMessage);
      mockPrisma.chatConversation.update.mockResolvedValue({
        ...mockConversation,
        messageCount: 1,
      });

      const result = await service.addMessage('conv-1', 'user', 'Hello');

      expect(result).toEqual(mockMessage);
      expect(mockPrisma.chatConversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'conv-1' },
          data: expect.objectContaining({
            messageCount: { increment: 1 },
          }),
        }),
      );
    });

    it('should accept optional token usage and metadata', async () => {
      mockPrisma.chatMessage.create.mockResolvedValue({
        ...mockMessage,
        tokensUsed: 150,
        responseTimeMs: 200,
      });

      await service.addMessage('conv-1', 'assistant', 'Response', 150, 200, { model: 'gpt-4' });

      expect(mockPrisma.chatMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tokensUsed: 150,
            responseTimeMs: 200,
            metadata: { model: 'gpt-4' },
          }),
        }),
      );
    });
  });

  describe('getConversation', () => {
    it('should return conversation by id', async () => {
      mockPrisma.chatConversation.findUnique.mockResolvedValue(mockConversation);

      const result = await service.getConversation('conv-1');

      expect(result).toEqual(mockConversation);
    });

    it('should throw for non-existent conversation', async () => {
      mockPrisma.chatConversation.findUnique.mockResolvedValue(null);

      await expect(service.getConversation('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMessages', () => {
    it('should return paginated messages', async () => {
      mockPrisma.chatMessage.findMany.mockResolvedValue([mockMessage]);
      mockPrisma.chatMessage.count.mockResolvedValue(1);

      const result = await service.getMessages('conv-1');

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should return empty for conversation with no messages', async () => {
      mockPrisma.chatMessage.findMany.mockResolvedValue([]);
      mockPrisma.chatMessage.count.mockResolvedValue(0);

      const result = await service.getMessages('conv-1');

      expect(result.data).toHaveLength(0);
    });
  });

  describe('listConversations', () => {
    it('should return paginated conversations', async () => {
      mockPrisma.chatConversation.findMany.mockResolvedValue([mockConversation]);
      mockPrisma.chatConversation.count.mockResolvedValue(1);

      const result = await service.listConversations();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should exclude deleted conversations', async () => {
      mockPrisma.chatConversation.findMany.mockResolvedValue([]);
      mockPrisma.chatConversation.count.mockResolvedValue(0);

      await service.listConversations();

      expect(mockPrisma.chatConversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });
  });

  describe('deleteConversation', () => {
    it('should soft delete a conversation', async () => {
      mockPrisma.chatConversation.findUnique.mockResolvedValue(mockConversation);
      mockPrisma.chatConversation.update.mockResolvedValue({
        ...mockConversation,
        deletedAt: new Date(),
      });

      await service.deleteConversation('conv-1');

      expect(mockPrisma.chatConversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'conv-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('should throw for non-existent conversation', async () => {
      mockPrisma.chatConversation.findUnique.mockResolvedValue(null);

      await expect(service.deleteConversation('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
