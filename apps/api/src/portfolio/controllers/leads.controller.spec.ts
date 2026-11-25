import 'reflect-metadata';
import { LeadsService } from '../../modules/leads/leads.service';
import { PortfolioLeadsController } from './leads.controller';
import type { CreateLeadDto } from '../../modules/leads/dto';

const dto: CreateLeadDto = {
  name: 'Ada',
  email: 'ada@example.com',
  message: 'Hello there friend',
};

describe('PortfolioLeadsController', () => {
  let controller: PortfolioLeadsController;
  let service: { create: jest.Mock };

  beforeEach(() => {
    service = { create: jest.fn().mockResolvedValue({ id: 'lead-1' }) };
    controller = new PortfolioLeadsController(service as unknown as LeadsService);
  });

  it('creates a lead with the server-derived IP and wraps it in the data envelope', async () => {
    await expect(controller.create(dto, '203.0.113.7')).resolves.toEqual({
      data: { id: 'lead-1' },
    });
    expect(service.create).toHaveBeenCalledWith(dto, '203.0.113.7');
  });

  it('propagates a rejected create', async () => {
    service.create.mockRejectedValue(new Error('invalid'));

    await expect(controller.create({} as never, '203.0.113.7')).rejects.toThrow('invalid');
  });

  it('discards a honeypot hit without calling the service', async () => {
    const spam = { ...dto, website: 'https://spam.example' };

    await expect(controller.create(spam, '203.0.113.7')).resolves.toEqual({
      data: { id: 'discarded' },
    });
    expect(service.create).not.toHaveBeenCalled();
  });

  it('throttles submissions to three per hour', () => {
    const handler = PortfolioLeadsController.prototype.create;

    expect(Reflect.getMetadata('THROTTLER:LIMITdefault', handler)).toBe(3);
    expect(Reflect.getMetadata('THROTTLER:TTLdefault', handler)).toBe(3600000);
  });
});
