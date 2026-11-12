import { BlogService } from '../../modules/blog/blog.service';
import { PortfolioBlogController } from './blog.controller';
import { NotFoundException } from '@nestjs/common';

describe('PortfolioBlogController', () => {
  let controller: PortfolioBlogController;
  let service: { findAll: jest.Mock; findBySlugOrId: jest.Mock };

  beforeEach(() => {
    service = { findAll: jest.fn().mockResolvedValue([]), findBySlugOrId: jest.fn() };
    controller = new PortfolioBlogController(service as unknown as BlogService);
  });

  it('lists published posts with the default pagination', async () => {
    service.findAll.mockResolvedValue([{ id: '1' }]);

    await expect(controller.findAll()).resolves.toEqual([{ id: '1' }]);
    expect(service.findAll).toHaveBeenCalledWith({
      published: true,
      category: undefined,
      page: 1,
      perPage: 20,
    });
  });

  it('passes the query filters through', async () => {
    await controller.findAll('engineering', '2', '10');

    expect(service.findAll).toHaveBeenCalledWith({
      published: true,
      category: 'engineering',
      page: 2,
      perPage: 10,
    });
  });

  it('returns a post by slug or id', async () => {
    service.findBySlugOrId.mockResolvedValue({ id: '1', title: 'Post' });

    await expect(controller.findOne('post-slug')).resolves.toEqual({
      data: { id: '1', title: 'Post' },
    });
  });

  it('throws a NotFoundException for an unknown post', async () => {
    service.findBySlugOrId.mockResolvedValue(undefined);

    await expect(controller.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
