import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, UploadedFiles, UseInterceptors
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
    return cb(new Error('Solo se permiten imágenes JPG, JPEG o PNG'), false);
  }
  cb(null, true);
};

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'images', maxCount: 3 }],
      {
        storage: diskStorage({
          destination: './uploads/location',
          filename: (req, file, cb) => {
            const uniqueName = Date.now() + '-' + file.originalname;
            cb(null, uniqueName);
          },
        }),
        fileFilter: imageFileFilter,
        limits: {
          fileSize: 2 * 1024 * 1024, // 🔥 2MB máximo
        },
      },
    ),
  )
  create(
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Body() dto: CreateLocationDto,
  ) {
    const imagePaths = files.images?.map(f => f.filename) || [];
    return this.locationService.create(dto, imagePaths);
  }

  // 🔥 UPDATE CON IMÁGENES (IMPORTANTE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'images', maxCount: 3 }],
      {
        storage: diskStorage({
          destination: './uploads/location',
          filename: (req, file, cb) => {
            const uniqueName = Date.now() + '-' + file.originalname;
            cb(null, uniqueName);
          },
        }),
        fileFilter: imageFileFilter,
        limits: {
          fileSize: 2 * 1024 * 1024,
        },
      },
    ),
  )
  update(
    @Param('id') id: string,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Body() dto: UpdateLocationDto,
  ) {
    const imagePaths = files.images?.map(f => f.filename) || [];
    return this.locationService.update(+id, dto, imagePaths);
  }

  @Get()
  findAll() {
    return this.locationService.findAll();
  }
  @Get(':id/barbers')
  getBarbersByLocation(@Param('id') id: string) {
    return this.locationService.getBarbersByLocation(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationService.remove(+id);
  }
}