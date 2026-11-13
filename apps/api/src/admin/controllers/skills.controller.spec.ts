import { SkillsService } from '../../modules/skills/skills.service';
import { AdminSkillsController } from './skills.controller';

describe('AdminSkillsController', () => {
  let controller: AdminSkillsController;
  let service: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    toggleFeatured: jest.Mock;
    bulkDelete: jest.Mock;
  };

  beforeEach(() => {
    service = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue({ id: '1' }),
      create: jest.fn().mockResolvedValue({ id: '1' }),
      update: jest.fn().mockResolvedValue({ id: '1' }),
      delete: jest.fn().mockResolvedValue(undefined),
      toggleFeatured: jest.fn().mockResolvedValue({ id: '1', is_featured: true }),
      bulkDelete: jest.fn().mockResolvedValue({ count: 1 }),
    };
    controller = new AdminSkillsController(service as unknown as SkillsService);
  });

  it('lists skills with the default pagination', async () => {
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
    await controller.findAll('3', '15', 'react', 'name', 'desc');

    expect(service.findAll).toHaveBeenCalledWith(undefined, {
      page: 3,
      perPage: 15,
      search: 'react',
      sortBy: 'name',
      sortOrder: 'desc',
    });
  });

  it('returns a skill by id', async () => {
    await expect(controller.findOne('skill-1')).resolves.toEqual({ data: { id: '1' } });
    expect(service.findById).toHaveBeenCalledWith('skill-1');
  });

  it('creates a skill', async () => {
    await expect(controller.create({ name: 'React' } as never)).resolves.toEqual({
      data: { id: '1' },
    });
    expect(service.create).toHaveBeenCalledWith({ name: 'React' });
  });

  it('updates a skill', async () => {
    await expect(controller.update('skill-1', { name: 'React 19' } as never)).resolves.toEqual({
      data: { id: '1' },
    });
    expect(service.update).toHaveBeenCalledWith('skill-1', { name: 'React 19' });
  });

  it('deletes a skill', async () => {
    await controller.delete('skill-1');

    expect(service.delete).toHaveBeenCalledWith('skill-1');
  });

  it('toggles the featured flag', async () => {
    await expect(controller.toggleFeatured('skill-1')).resolves.toEqual({
      data: { id: '1', is_featured: true },
    });
    expect(service.toggleFeatured).toHaveBeenCalledWith('skill-1');
  });

  it('bulk deletes skills', async () => {
    await expect(controller.bulkDelete(['a'])).resolves.toEqual({ count: 1 });
    expect(service.bulkDelete).toHaveBeenCalledWith(['a']);
  });
});
