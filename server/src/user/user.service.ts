import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { Repository, Unique } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository <Role>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}
  async create(Dto: CreateUserDto) {
    const role = await this.roleRepository.findOne({
      where: {id: Dto.roleId}
    })

    if(!role){
      throw new NotFoundException(' No se encontro el rol de usuario')
    };
    const hashedPassword = await bcrypt.hash(Dto.password, 10);

    const user=  this.userRepository.create({
      ...Dto,
      password: hashedPassword,
      role:role
    })

    return await this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find({
      relations: ['role']
    });
  }

  async findOne(id: number):Promise<User> {
    const user= await this.userRepository.findOne({
      where: {id},
      relations:['role']
    })
    if(!user){
      throw new NotFoundException('Usuario no encontrado')
    }
    return user ;
  }

  async update(id: number, Dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: {id}
    })
    if (!user){
      throw new NotFoundException('Usuario no encontrado')
    }
    if (Dto.roleId !== undefined) {
      const role = await this.roleRepository.findOne({
        where: { id: Dto.roleId },
      });

      if (!role) {
        throw new NotFoundException('Rol no encontrado');
      }
      
      user.role = role; 
    }
    if(Dto.name !== undefined){
      user.name= Dto.name
    }
    if(Dto.email !== undefined){
      user.email= Dto.email
    }
    
    if(Dto.birthDate !== undefined){
      user.birthDate= Dto.birthDate
    }
     
    return await this.userRepository.save(user);
  }

  async changePassword( id : number , dto : ChangePasswordDto){
    const user= await this.userRepository.findOne({ where: {id}
    })
    if(!user){
      throw new NotFoundException('Usurio no encontrado')
    };
    
    const passwordCorrect = await bcrypt.compare(
      dto.currentPassword,   // contraseña escrita por el usuario
      user.password          // hash almacenado
    )
    if(!passwordCorrect){
      throw new NotFoundException('La contraseña actual no es correcta')
    };

    const newHasd = await bcrypt.hash(dto.newPassword, 10);
    
    user.password = newHasd;

    return this.userRepository.save(user);
  
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({
      where: {id}
    })
    if(!user){
      throw new NotFoundException('Usuario no encontrado')
    }
    return this.userRepository.remove(user);
  }
}
