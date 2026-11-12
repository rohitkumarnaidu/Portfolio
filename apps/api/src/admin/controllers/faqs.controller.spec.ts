import { FaqsService } from '../../modules/faqs/faqs.service';
import { AdminFaqsController } from './faqs.controller';

describe('AdminFaqsController', () => {
  let controller: AdminFaqsController;
  let service: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    restore: jest.Mock;
    hardDelete: jest.Mock;
    bulkDelete: jest.Mock;
    bulkUpdate: jest.Mock;
  };

  beforeEach(() => {
    service = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue({ id: '1' }),
      create: jest.fn().mockResolvedValue({ id: '1' }),
      update: jest.fn().mockResolvedValue({ id: '1' }),
      delete: jest.fn().mockResolvedValue(undefined),
      restore: jest.fn().mockResolvedValue({ id: '1' }),
      hardDelete: jest.fn().mockResolvedValue(undefined),
      bulkDelete: jest.fn().mockResolvedValue({ count: 3 }),
      bulkUpdate: jest.fn().mockResolvedValue({ count: 3 }),
    };
    controller = new AdminFaqsController(service as unknown as FaqsService);
  });

  it('lists faqs with the default pagination', async () => {
    await controller.findAll();

    expect(service.findAll).toHaveBeenCalledWith(undefined, undefined, {
      page: 1,
      perPage: 50,
      search: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    });
  });

  it('passes the query filters through', async () => {
    await controller.findAll('2', '20', 'billing', 'question', 'asc');

    expect(service.findAll).toHaveBeenCalledWith(undefined, undefined, {
      page: 2,
      perPage: 20,
      search: 'billing',
      sortBy: 'question',
      sortOrder: 'asc',
    });
  });

  it('returns a faq by id', async () => {
    await expect(controller.findOne('faq-1')).resolves.toEqual({ data: { id: '1' } });
  });

  it('creates, updates and deletes a faq', async () => {
    await expect(controller.create({ question: 'Why?' } as never)).resolves.toEqual({
      data: { id: '1' },
    });
    await expect(controller.update('faq-1', { question: 'Why not?' } as never)).resolves.toEqual({
      data: { id: '1' },
    });
    await controller.delete('faq-1');

    expect(service.create).toHaveBeenCalled();
    expect(service.update).toHaveBeenCalledWith('faq-1', { question: 'Why not?' });
    expect(service.delete).toHaveBeenCalledWith('faq-1');
  });

  it('restores a soft deleted faq', async () => {
    await expect(controller.restore('faq-1')).resolves.toEqual({ data: { id: '1' } });
    expect(service.restore).toHaveBeenCalledWith('faq-1');
  });

  it('hard deletes a faq', async () => {
    await controller.hardDelete('faq-1');

    expect(service.hardDelete).toHaveBeenCalledWith('faq-1');
  });

  it('bulk deletes faqs', async () => {
    await expect(controller.bulkDelete(['a', 'b', 'c'])).resolves.toEqual({ count: 3 });
    expect(service.bulkDelete).toHaveBeenCalledWith(['a', 'b', 'c']);
  });

  it('bulk updates faqs', async () => {
    await expect(controller.bulkUpdate(['a'], { is_visible: false })).resolves.toEqual({
      data: { count: 3 },
    });
    expect(service.bulkUpdate).toHaveBeenCalledWith(['a'], { is_visible: false });
  });
});
