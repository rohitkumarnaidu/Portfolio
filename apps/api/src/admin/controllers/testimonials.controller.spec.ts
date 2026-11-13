import { TestimonialsService } from '../../modules/testimonials/testimonials.service';
import { AdminTestimonialsController } from './testimonials.controller';

describe('AdminTestimonialsController', () => {
  let controller: AdminTestimonialsController;
  let service: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    toggleVisibility: jest.Mock;
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
      toggleVisibility: jest.fn().mockResolvedValue({ id: '1', isVisible: false }),
      bulkDelete: jest.fn().mockResolvedValue({ count: 1 }),
      bulkUpdate: jest.fn().mockResolvedValue({ count: 1 }),
    };
    controller = new AdminTestimonialsController(service as unknown as TestimonialsService);
  });

  it('lists testimonials with the default pagination', async () => {
    await controller.findAll();

    expect(service.findAll).toHaveBeenCalledWith(undefined, {
      page: 1,
      perPage: 50,
      search: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    });
  });

  it('passes the query filters through', async () => {
    await controller.findAll('1', '25', 'ada', 'name', 'desc');

    expect(service.findAll).toHaveBeenCalledWith(undefined, {
      page: 1,
      perPage: 25,
      search: 'ada',
      sortBy: 'name',
      sortOrder: 'desc',
    });
  });

  it('returns a testimonial by id', async () => {
    await expect(controller.findOne('t-1')).resolves.toEqual({ data: { id: '1' } });
  });

  it('creates and updates a testimonial', async () => {
    await expect(controller.create({ name: 'Ada' } as never)).resolves.toEqual({
      data: { id: '1' },
    });
    await expect(controller.update('t-1', { name: 'Ada L' } as never)).resolves.toEqual({
      data: { id: '1' },
    });

    expect(service.create).toHaveBeenCalledWith({ name: 'Ada' });
    expect(service.update).toHaveBeenCalledWith('t-1', { name: 'Ada L' });
  });

  it('deletes a testimonial', async () => {
    await controller.delete('t-1');

    expect(service.delete).toHaveBeenCalledWith('t-1');
  });

  it('toggles visibility', async () => {
    await expect(controller.toggleVisibility('t-1')).resolves.toEqual({
      data: { id: '1', isVisible: false },
    });
    expect(service.toggleVisibility).toHaveBeenCalledWith('t-1');
  });

  it('bulk deletes testimonials', async () => {
    await expect(controller.bulkDelete(['a'])).resolves.toEqual({ count: 1 });
    expect(service.bulkDelete).toHaveBeenCalledWith(['a']);
  });

  it('bulk updates testimonials', async () => {
    await expect(controller.bulkUpdate(['a'], { isVisible: false })).resolves.toEqual({
      data: { count: 1 },
    });
    expect(service.bulkUpdate).toHaveBeenCalledWith(['a'], { isVisible: false });
  });
});
