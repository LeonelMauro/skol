import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { NotFoundError } from 'rxjs';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
  private readonly roleRepository: Repository<Role> 
  ){}
  
  async create(createRoleDto: CreateRoleDto) {
    const role=  this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  findAll() {
    return this.roleRepository.find();
  }

  async findOne(id: number) {
    const role= await this.roleRepository.findOne({
      where: {id}
    });
    if(!role){
      throw new NotFoundException('No se encontro el role')
    }

    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role= await this.roleRepository.findOne({
      where: {id}
    });
    if(!role){
      throw new NotFoundException('No se encontro ID del role')
    }
    if (dto.name !== undefined){
      role.name = dto.name
    }
    return this.roleRepository.save(role);
  }

  async remove(id: number) {
    const role=await this.roleRepository.findOne({
      where:{id}
    })
    if(!role){
      throw new NotFoundException('No se encotro el ID del rol')
    }
    return  this.roleRepository.remove(role);
  }
}
