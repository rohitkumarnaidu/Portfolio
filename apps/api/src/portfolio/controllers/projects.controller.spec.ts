import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from '../../modules/projects/projects.service';
import { PortfolioProjectsController } from './projects.controller';

describe('PortfolioProjectsController', () => {
  let controller: PortfolioProjectsController;
  let service: { findAll: jest.Mock; findBySlugOrId: jest.Mock };

  beforeEach(() => {
    service = { findAll: jest.fn().mockResolvedValue([]), findBySlugOrId: jest.fn() };
    controller = new PortfolioProjectsController(service as unknown as ProjectsService);
  });

  it('lists projects with the default pagination', async () => {
    service.findAll.mockResolvedValue([{ id: '1' }]);

    await expect(controller.findAll()).resolves.toEqual([{ id: '1' }]);
    expect(service.findAll).toHaveBeenCalledWith({
      category: undefined,
      featured: false,
      page: 1,
      perPage: 20,
    });
  });

  it('passes the query filters through', async () => {
    await controller.findAll('ai', 'true', '3', '5');

    expect(service.findAll).toHaveBeenCalledWith({
      category: 'ai',
      featured: true,
      page: 3,
      perPage: 5,
    });
  });

  it('returns a project by slug or id', async () => {
    service.findBySlugOrId.mockResolvedValue({ id: '1', title: 'Project' });

    await expect(controller.findOne('project-slug')).resolves.toEqual({
      data: { id: '1', title: 'Project' },
    });
    expect(service.findBySlugOrId).toHaveBeenCalledWith('project-slug');
  });

  it('throws a NotFoundException for an unknown project', async () => {
    service.findBySlugOrId.mockResolvedValue(undefined);

    await expect(controller.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
