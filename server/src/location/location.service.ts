import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

  ){}
  async create(dto: CreateLocationDto, images: string[]) {
    const location = this.locationRepository.create({
      ...dto,
      images,
    });

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


  async update(id: number, dto: UpdateLocationDto, newImages: string[]) {
    const location = await this.locationRepository.findOne({ where: { id } });

    if (!location) {
      throw new NotFoundException('No se encontró el local');
    }

    // 🔥 SOLO si vienen imágenes nuevas
    if (newImages && newImages.length > 0) {
      const oldImages = location.images || [];

      const imagesToDelete = oldImages.filter(img => !newImages.includes(img));

      imagesToDelete.forEach(img => {
        const filePath = join(process.cwd(), 'uploads/location', img);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      location.images = newImages;
    }

    // actualizar otros campos
    Object.assign(location, dto);

    return this.locationRepository.save(location);
  }

  async remove(id: number) {
    const location = await this.locationRepository.findOne({ where: { id } });

    if (!location) {
      throw new NotFoundException('No se encontró el local');
    }

    // 🔥 eliminar imágenes del disco
    const images = location.images || [];

    images.forEach(img => {
      const filePath = join(process.cwd(), 'uploads/location', img);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await this.locationRepository.delete(id);

    return { message: 'Local eliminado correctamente' };
  }
}
