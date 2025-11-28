import { Test, TestingModule } from '@nestjs/testing';
import { BarberAvailabilityController } from './barber-availability.controller';
import { BarberAvailabilityService } from './barber-availability.service';

describe('BarberAvailabilityController', () => {
  let controller: BarberAvailabilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarberAvailabilityController],
      providers: [BarberAvailabilityService],
    }).compile();

    controller = module.get<BarberAvailabilityController>(BarberAvailabilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
