import { Test, TestingModule } from '@nestjs/testing';
import { BarberAvailabilityService } from './barber-availability.service';

describe('BarberAvailabilityService', () => {
  let service: BarberAvailabilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BarberAvailabilityService],
    }).compile();

    service = module.get<BarberAvailabilityService>(BarberAvailabilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
