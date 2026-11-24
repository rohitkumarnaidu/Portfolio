import { AvailabilityStatusService } from '../../modules/availability-status/availability-status.service';
import { PortfolioAvailabilityStatusController } from './availability-status.controller';

const status = {
  id: 'availability-1',
  isAvailable: true,
  statusLabel: 'Available for new opportunities',
  availableUntil: null,
  preferredContact: 'email',
  updatedAt: '2026-11-24T00:00:00.000Z',
};

describe('PortfolioAvailabilityStatusController', () => {
  let controller: PortfolioAvailabilityStatusController;
  let service: { getStatus: jest.Mock };

  beforeEach(() => {
    service = { getStatus: jest.fn().mockResolvedValue(status) };
    controller = new PortfolioAvailabilityStatusController(
      service as unknown as AvailabilityStatusService,
    );
  });

  it('returns the availability status in the data envelope', async () => {
    await expect(controller.find()).resolves.toEqual({ data: status });
  });

  it('delegates to AvailabilityStatusService.getStatus', async () => {
    await controller.find();

    expect(service.getStatus).toHaveBeenCalledTimes(1);
  });
});
