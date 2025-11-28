import { PartialType } from '@nestjs/mapped-types';
import { CreateBarberAvailabilityDto } from './create-barber-availability.dto';

export class UpdateBarberAvailabilityDto extends PartialType(CreateBarberAvailabilityDto) {}
