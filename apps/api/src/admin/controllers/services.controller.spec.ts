import { ServicesService } from '../../modules/services/services.service';
import { AdminServicesController } from './services.controller';

describe('AdminServicesController', () => {
  let controller: AdminServicesController;
  let service: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    bulkDelete: jest.Mock;
  };

  beforeEach(() => {
    service = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue({ id: '1' }),
      create: jest.fn().mockResolvedValue({ id: '1' }),
      update: jest.fn().mockResolvedValue({ id: '1' }),
      delete: jest.fn().mockResolvedValue(undefined),
      bulkDelete: jest.fn().mockResolvedValue({ count: 2 }),
    };
    controller = new AdminServicesController(service as unknown as ServicesService);
  });

  it('lists services with the default pagination', async () => {
    await controller.findAll();

    expect(service.findAll).toHaveBeenCalledWith({
      page: 1,
      perPage: 50,
      search: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    });
  });

  it('passes the query filters through', async () => {
    await controller.findAll('2', '10', 'design', 'title', 'asc');

    expect(service.findAll).toHaveBeenCalledWith({
      page: 2,
      perPage: 10,
      search: 'design',
      sortBy: 'title',
      sortOrder: 'asc',
    });
  });

  it('returns a service by id', async () => {
    await expect(controller.findOne('service-1')).resolves.toEqual({ data: { id: '1' } });
    expect(service.findById).toHaveBeenCalledWith('service-1');
  });

  it('creates a service', async () => {
    await expect(controller.create({ title: 'New' } as never)).resolves.toEqual({
      data: { id: '1' },
    });
    expect(service.create).toHaveBeenCalledWith({ title: 'New' });
  });

  it('updates a service', async () => {
    await expect(controller.update('service-1', { title: 'Updated' } as never)).resolves.toEqual({
      data: { id: '1' },
    });
    expect(service.update).toHaveBeenCalledWith('service-1', { title: 'Updated' });
  });

  it('deletes a service', async () => {
    await controller.delete('service-1');

    expect(service.delete).toHaveBeenCalledWith('service-1');
  });

  it('bulk deletes services', async () => {
    await expect(controller.bulkDelete(['a', 'b'])).resolves.toEqual({ count: 2 });
    expect(service.bulkDelete).toHaveBeenCalledWith(['a', 'b']);
  });
});
