import { Injectable } from '@nestjs/common';
import { CreateBarberAvailabilityDto } from './dto/create-barber-availability.dto';
import { UpdateBarberAvailabilityDto } from './dto/update-barber-availability.dto';

@Injectable()
export class BarberAvailabilityService {
  create(createBarberAvailabilityDto: CreateBarberAvailabilityDto) {
    return 'This action adds a new barberAvailability';
  }

  findAll() {
    return `This action returns all barberAvailability`;
  }

  findOne(id: number) {
    return `This action returns a #${id} barberAvailability`;
  }

  update(id: number, updateBarberAvailabilityDto: UpdateBarberAvailabilityDto) {
    return `This action updates a #${id} barberAvailability`;
  }

  remove(id: number) {
    return `This action removes a #${id} barberAvailability`;
  }
}
