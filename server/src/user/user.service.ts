import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { Repository, Unique } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { ILike } from 'typeorm';
import { CreateBarberDto } from './dto/create-barber.dto';
import { Location } from 'src/location/entities/location.entity';
import * as fs from 'fs';
import { join } from 'path';



@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository <Role>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>
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

  async createClient(dto: CreateClientDto) {
  const role = await this.roleRepository.findOne({
    where: { id: 3 }, // CLIENTE
  });

  if (!role) {
    throw new NotFoundException('Rol cliente no encontrado');
  }
  const existingUser = await this.userRepository.findOne({
    where: { email: dto.email },
  });

  if (existingUser) {
    throw new ConflictException('El email ya está registrado');
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const user = this.userRepository.create({
    ...dto,
    password: hashedPassword,
    role,
  });

  return this.userRepository.save(user);
}

async createBarber(dto: CreateBarberDto){
  const role = await this.roleRepository.findOne({
    where: { name: 'barber'}
  })
  if(!role){
    throw new NotFoundException('No se encontro el rol')
  }

  const existingUser = await this.userRepository.findOne({
    where: { email: dto.email },
  });

  if (existingUser) {
    throw new ConflictException('El email ya está registrado');
  }

  const location = await this.locationRepository.findOne({
    where: { id: dto.locationId },
  });

  if (!location) {
    throw new NotFoundException('Local no encontrado');
  }
  const hashedPassword= await bcrypt.hash(dto.password,10) 

  const user = await this.userRepository.create({
    ...dto,
    password: hashedPassword,
    role,
    location,
  })
  return this.userRepository.save(user)
 };


  async findAll(q?: string) {
    if (q) {
      return this.userRepository.find({
        where: [
          { name: ILike(`%${q}%`) },
          { email: ILike(`%${q}%`) },
        ],
        relations: ['role'],
      });
    }

    return this.userRepository.find({
      relations: ['role'],
    });
  }
  async findAllBarbers() {
    return this.userRepository.find({
      where: {
        role: { name: 'barber' },
        isActive: true,
      },
      relations: ['location', 'availabilities'],
      order: {
        name: 'ASC',
      },
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
  
  async updateBarberLocation(barberId: number, locationId: number) {
  const barber = await this.userRepository.findOne({
    where: { id: barberId },
    relations: ['location'],
  });

  if (!barber) {
    throw new NotFoundException('Barbero no encontrado');
  }

  const location = await this.locationRepository.findOne({
    where: { id: locationId },
  });

  if (!location) {
    throw new NotFoundException('Local no encontrado');
  }

  barber.location = location;
  return this.userRepository.save(barber);
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
    where: { id },
    relations: [
      'reservationsAsClient',
      'reservationsAsBarber',
    ],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const hasReservations =
      user.reservationsAsClient.length > 0 ||
      user.reservationsAsBarber.length > 0;

    if (hasReservations) {
      user.isActive = false;
      return this.userRepository.save(user);
    }

    return this.userRepository.remove(user);
  }
  async getBarberWorkingDays(barberId: number) {
  const barber = await this.userRepository.findOne({
    where: {
      id: barberId,
      role: { name: 'barber' },
      isActive: true,
    },
    relations: ['availabilities'],
  });

  if (!barber) {
    throw new NotFoundException('Barbero no encontrado');
  }

  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const workingDays = barber.availabilities
    .filter(a => a.is_active)
    .map(a => dayMap[a.day_of_week]);

  return { workingDays };
}
async findAllClient(q?: string) {
  const where = q
    ? [
        { name: ILike(`%${q}%`), role: { id: 3 } }, 
        { email: ILike(`%${q}%`), role: { id: 3 } },
      ]
    : { role: { id: 3 } };

  return this.userRepository.find({
    where,
    relations: ['role'],
  });
}

async updateAvatar(userId: number, file: Express.Multer.File) {
  const user = await this.userRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  // borrar avatar anterior
  if (user.avatar) {
    const oldPath = join(process.cwd(), user.avatar);

    if (fs.existsSync(oldPath) && oldPath !== file.path) {
      fs.unlinkSync(oldPath);
    }
  }

  user.avatar = `/uploads/avatars/${file.filename}`;

  await this.userRepository.save(user);

  return {
    avatar: user.avatar,
  };
}

}
