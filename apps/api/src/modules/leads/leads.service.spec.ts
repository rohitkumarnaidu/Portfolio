import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { PrismaService } from '../../common/database/prisma.service';
import { NOTIFICATION_ADAPTER } from '../../common/notifications/notification.module';

const mockLead = {
  id: 'lead-1',
  name: 'John Doe',
  email: 'john@test.com',
  phone: null as string | null,
  company: null as string | null,
  subject: 'Test inquiry',
  message: 'Hello, interested in your services',
  source: 'contact_form',
  status: 'new',
  priority: 'normal',
  metadata: {} as Record<string, unknown>,
  ipAddress: null as string | null,
  deletedAt: null as Date | null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  lead: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
  leadNote: {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
  },
  leadActivity: {
    create: jest.fn(),
  },
};

const mockNotifier = {
  sendNewLeadNotification: jest.fn().mockResolvedValue(undefined),
  sendLeadStatusChanged: jest.fn().mockResolvedValue(undefined),
};

describe('LeadsService', () => {
  let service: LeadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NOTIFICATION_ADAPTER, useValue: mockNotifier },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a lead and fire notification', async () => {
      mockPrisma.lead.create.mockResolvedValue(mockLead);

      const result = await service.create({
        name: 'John Doe',
        email: 'john@test.com',
        message: 'Hello',
      });

      expect(result).toHaveProperty('id', 'lead-1');
      expect(result.status).toBe('new');
      expect(mockNotifier.sendNewLeadNotification).toHaveBeenCalled();
      expect(mockPrisma.lead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'new', priority: 'normal' }),
        }),
      );
    });

    it('should handle notification failure gracefully', async () => {
      mockPrisma.lead.create.mockResolvedValue(mockLead);
      mockNotifier.sendNewLeadNotification.mockRejectedValue(new Error('Email failed'));

      const result = await service.create({ name: 'X', email: 'x@x.com', message: 'x' });

      expect(result).toHaveProperty('id');
      expect(mockNotifier.sendNewLeadNotification).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated leads', async () => {
      const leads = [mockLead, { ...mockLead, id: 'lead-2' }];
      mockPrisma.lead.findMany.mockResolvedValue(leads);
      mockPrisma.lead.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, perPage: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should filter by status', async () => {
      mockPrisma.lead.findMany.mockResolvedValue([]);
      mockPrisma.lead.count.mockResolvedValue(0);

      await service.findAll({ status: 'new' });

      expect(mockPrisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'new', deletedAt: null }),
        }),
      );
    });

    it('should filter by search query', async () => {
      mockPrisma.lead.findMany.mockResolvedValue([]);
      mockPrisma.lead.count.mockResolvedValue(0);

      await service.findAll({ search: 'john' });

      const callArg = mockPrisma.lead.findMany.mock.calls[0][0];
      expect(callArg.where.OR).toBeDefined();
      expect(callArg.where.OR.length).toBe(3);
    });
  });

  describe('findById', () => {
    it('should return lead by id', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(mockLead);

      const result = await service.findById('lead-1');

      expect(result.id).toBe('lead-1');
    });

    it('should throw for deleted lead', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue({ ...mockLead, deletedAt: new Date() });

      await expect(service.findById('lead-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw for non-existent lead', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update lead and fire status change notification', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(mockLead);
      mockPrisma.lead.update.mockResolvedValue({ ...mockLead, status: 'in_progress' });

      const result = await service.update('lead-1', { status: 'in_progress' } as any);

      expect(result.status).toBe('in_progress');
      expect(mockNotifier.sendLeadStatusChanged).toHaveBeenCalledWith(
        'lead-1',
        'john@test.com',
        'John Doe',
        'in_progress',
      );
    });

    it('should not fire notification if status unchanged', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(mockLead);
      mockPrisma.lead.update.mockResolvedValue(mockLead);

      await service.update('lead-1', { subject: 'Updated' } as any);

      expect(mockNotifier.sendLeadStatusChanged).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should soft delete lead', async () => {
      mockPrisma.lead.update.mockResolvedValue({ ...mockLead, deletedAt: new Date() });

      await service.delete('lead-1');

      expect(mockPrisma.lead.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'lead-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });
  });

  describe('bulk operations', () => {
    it('should bulk soft delete', async () => {
      mockPrisma.lead.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkDelete(['lead-1', 'lead-2']);

      expect(result.deleted).toBe(2);
    });

    it('should bulk update', async () => {
      mockPrisma.lead.findMany.mockResolvedValue([mockLead, { ...mockLead, id: 'lead-2' }]);
      mockPrisma.lead.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.lead.findMany.mockResolvedValueOnce([mockLead, { ...mockLead, id: 'lead-2' }]);
      mockPrisma.lead.findMany.mockResolvedValueOnce([mockLead, { ...mockLead, id: 'lead-2' }]);

      const result = await service.bulkUpdate(['lead-1', 'lead-2'], { status: 'contacted' });

      expect(result).toHaveLength(2);
    });
  });

  describe('notes', () => {
    it('should get notes for a lead', async () => {
      mockPrisma.leadNote.findMany.mockResolvedValue([
        { id: 'n1', leadId: 'lead-1', content: 'Note 1', authorId: 'u1', createdAt: new Date() },
      ]);

      const notes = await service.getNotes('lead-1');

      expect(notes).toHaveLength(1);
      expect(notes[0].content).toBe('Note 1');
    });

    it('should add a note', async () => {
      mockPrisma.leadNote.create.mockResolvedValue({
        id: 'n2',
        leadId: 'lead-1',
        content: 'New note',
        authorId: 'u1',
        createdAt: new Date(),
      });

      const note = await service.addNote('lead-1', 'New note', 'u1');

      expect(note.content).toBe('New note');
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete', async () => {
      mockPrisma.lead.delete.mockResolvedValue(mockLead);

      await service.hardDelete('lead-1');

      expect(mockPrisma.lead.delete).toHaveBeenCalledWith({ where: { id: 'lead-1' } });
    });
  });
});
