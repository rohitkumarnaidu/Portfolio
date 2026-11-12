import { LeadsService } from '../../modules/leads/leads.service';
import { PortfolioLeadsController } from './leads.controller';

describe('PortfolioLeadsController', () => {
  let controller: PortfolioLeadsController;
  let service: { create: jest.Mock };

  beforeEach(() => {
    service = { create: jest.fn().mockResolvedValue({ id: 'lead-1' }) };
    controller = new PortfolioLeadsController(service as unknown as LeadsService);
  });

  it('creates a lead and wraps it in the data envelope', async () => {
    const dto = { name: 'Ada', email: 'ada@example.com', message: 'Hello there friend' };

    await expect(controller.create(dto)).resolves.toEqual({ data: { id: 'lead-1' } });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('propagates a rejected create', async () => {
    service.create.mockRejectedValue(new Error('invalid'));

    await expect(controller.create({} as never)).rejects.toThrow('invalid');
  });
});
