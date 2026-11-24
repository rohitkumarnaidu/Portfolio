import { AvailabilityStatusService } from '../../modules/availability-status/availability-status.service';
import { PortfolioAvailabilityStatusController } from './availability-status.controller';

// The service returns the whole Prisma row; `id` and `createdAt` must never
// reach this public endpoint.
const storedStatus = {
  id: 'availability-1',
  isAvailable: true,
  statusLabel: 'Available for new opportunities',
  availableUntil: null,
  preferredContact: 'email',
  createdAt: '2026-11-20T00:00:00.000Z',
  updatedAt: '2026-11-24T00:00:00.000Z',
};

const publicStatus = {
  isAvailable: storedStatus.isAvailable,
  statusLabel: storedStatus.statusLabel,
  availableUntil: storedStatus.availableUntil,
  preferredContact: storedStatus.preferredContact,
  updatedAt: storedStatus.updatedAt,
};

describe('PortfolioAvailabilityStatusController', () => {
  let controller: PortfolioAvailabilityStatusController;
  let service: { getStatus: jest.Mock };

  beforeEach(() => {
    service = { getStatus: jest.fn().mockResolvedValue(storedStatus) };
    controller = new PortfolioAvailabilityStatusController(
      service as unknown as AvailabilityStatusService,
    );
  });

  it('returns the availability status in the data envelope', async () => {
    await expect(controller.find()).resolves.toEqual({ data: publicStatus });
  });

  it('returns exactly the declared public fields', async () => {
    const result = await controller.find();

    expect(Object.keys(result.data).sort()).toEqual([
      'availableUntil',
      'isAvailable',
      'preferredContact',
      'statusLabel',
      'updatedAt',
    ]);
    expect(result.data).not.toHaveProperty('id');
    expect(result.data).not.toHaveProperty('createdAt');
  });

  it('delegates to AvailabilityStatusService.getStatus', async () => {
    await controller.find();

    expect(service.getStatus).toHaveBeenCalledTimes(1);
  });
});
