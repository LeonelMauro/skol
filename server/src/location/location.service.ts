import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

  ){}
  async create(dto: CreateLocationDto) {
    const location= await this.locationRepository.create({
      ...dto
    })
    
    return this.locationRepository.save(location);
  }

  findAll() {
    return this.locationRepository.find();
  }
  
  async getBarbers(locationId: number) {
  const location = await this.locationRepository.findOne({
    where: { id: locationId },
  });

  if (!location) {
    throw new NotFoundException('El local no existe');
  }

  return this.userRepository.find({
    where: {
      location: { id: locationId },
      role: { name: 'barber' },
      isActive: true,
    },
    relations: ['location'],
  });
  }


  async findOne(id: number) {
  const location = await this.locationRepository.findOne({ where: { id } });
  if (!location) {
    throw new NotFoundException('No se encontró el local');
  }
  return location;
  }


  async update(id: number, dto: UpdateLocationDto) {
    const location= await this.locationRepository.findOne({
      where:{id}
    })
    if(!location){
      throw new NotFoundException('No se encontro local')
    }
    if(dto.name !==undefined){
      location.name=dto.name
    }
    if(dto.address !==undefined){
      location.address=dto.address
    }
    if(dto.imageUrl !==undefined){
      location.imageUrl=dto.imageUrl
    }
    if(dto.phone !==undefined){
      location.phone=dto.phone
    }
    if(dto.department !==undefined){
      location.department=dto.department
    }
    return await this.locationRepository.save(location);
  }

  async remove(id: number) {
  const location = await this.locationRepository.delete(id);
  return location;
  }
}
