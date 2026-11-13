import { CaseStudiesService } from '../../modules/case-studies/case-studies.service';
import { PortfolioCaseStudiesController } from './case-studies.controller';

describe('PortfolioCaseStudiesController', () => {
  let controller: PortfolioCaseStudiesController;
  let service: { findAll: jest.Mock; findById: jest.Mock };

  beforeEach(() => {
    service = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue({ id: '1' }),
    };
    controller = new PortfolioCaseStudiesController(service as unknown as CaseStudiesService);
  });

  it('lists every case study', async () => {
    service.findAll.mockResolvedValue([{ id: '1' }]);

    await expect(controller.findAll()).resolves.toEqual([{ id: '1' }]);
    expect(service.findAll).toHaveBeenCalledWith(undefined);
  });

  it('filters case studies by project', async () => {
    await controller.findAll('project-1');

    expect(service.findAll).toHaveBeenCalledWith('project-1');
  });

  it('returns a single case study in the data envelope', async () => {
    await expect(controller.findOne('case-1')).resolves.toEqual({ data: { id: '1' } });
    expect(service.findById).toHaveBeenCalledWith('case-1');
  });
});
