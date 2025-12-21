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

  findOne(id: number) {
    return `This action returns a #${id} location`;
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
    return await this.locationRepository.save(location);
  }

  remove(id: number) {
    return `This action removes a #${id} location`;
  }
}
