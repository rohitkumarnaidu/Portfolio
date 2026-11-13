import { NotFoundException } from '@nestjs/common';
import { SectionsService } from '../../modules/sections/sections.service';
import { PortfolioSectionsController } from './sections.controller';

describe('PortfolioSectionsController', () => {
  let controller: PortfolioSectionsController;
  let service: { findAll: jest.Mock; findByIdOrKey: jest.Mock };

  beforeEach(() => {
    service = { findAll: jest.fn().mockResolvedValue([]), findByIdOrKey: jest.fn() };
    controller = new PortfolioSectionsController(service as unknown as SectionsService);
  });

  it('lists published sections', async () => {
    service.findAll.mockResolvedValue([{ id: '1' }]);

    await expect(controller.findAll()).resolves.toEqual([{ id: '1' }]);
    expect(service.findAll).toHaveBeenCalledWith(true, undefined);
  });

  it('filters sections by type', async () => {
    await controller.findAll('hero');

    expect(service.findAll).toHaveBeenCalledWith(true, 'hero');
  });

  it('returns a section by id or key', async () => {
    service.findByIdOrKey.mockResolvedValue({ id: '1', section_key: 'hero' });

    await expect(controller.findOne('hero')).resolves.toEqual({
      data: { id: '1', section_key: 'hero' },
    });
    expect(service.findByIdOrKey).toHaveBeenCalledWith('hero');
  });

  it('throws a NotFoundException for an unknown section', async () => {
    service.findByIdOrKey.mockResolvedValue(undefined);

    await expect(controller.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
