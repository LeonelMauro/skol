import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>
  ){}
  async create(dto: CreateServiceDto) {
    const service=  this.serviceRepository.create(dto)
    return await this.serviceRepository.save(service) ;
  }

  findAll() {
    return this.serviceRepository.find();
  }

  async findOne(id: number) {
    const service= await this.serviceRepository.findOne({
      where: {id}
    })
    if(!service){
      throw new NotFoundException('Servicio no encontrado')
    }
    return service;
  }

  async update(id: number, dto: UpdateServiceDto) {
    const service = await this.serviceRepository.findOne({
      where: {id}
    })
    if(!service){
      throw new NotFoundException('Servicio no encontrado')
    }
    if(dto.name !== undefined){
      service.name= dto.name
    }
    
    if(dto.description !== undefined){ 
      service.description= dto.description}
    
      if(dto.price !== undefined){
      service.price= dto.price
    }

    if(dto.duration_minutes !== undefined){
      service.duration_minutes =dto.duration_minutes
    }
    return await this.serviceRepository.save(service)
  }

  async remove(id: number) {
    const service = await this.serviceRepository.findOne({
      where: {id}
    })
    if(!service){
      throw new NotFoundException('Servicio no encontrado')
    }
    return this.serviceRepository.remove(service);
  }
}
