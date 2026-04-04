import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  BadRequestException,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateBarberDto } from './dto/create-barber.dto';
import { UpdateBarberLocationDto } from './dto/update-barber-location.dto';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname , join} from 'path';
import { Request } from 'express';
import * as fs from 'fs';

interface AuthRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
    avatar:  string | null;
  };
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /* =======================
     REGISTRO PÚBLICO
     ======================= */
  @Post('register')
  createClient(@Body() dto: CreateClientDto) {
    return this.userService.createClient(dto);
  }
  @Get('search')
  async searchClients(@Query('q') q: string) {
    return this.userService.findAllClient(q);
  }
  @Get(':id/working-days')
  getBarberWorkingDays(@Param('id') id: number) {
    return this.userService.getBarberWorkingDays(id);
  }

  /* =======================
     RUTAS PROTEGIDAS
     ======================= */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('barbers')
  findAllBarbers() {
    return this.userService.findAllBarbers();
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')   
  @Post('create-barbers')
  createBarber(@Body() dto: CreateBarberDto) {
    return this.userService.createBarber(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @Req() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(req.user.id, updateUserDto);
  }
  // Perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: AuthRequest) {
    return this.userService.findOne(req.user.id);
  }

  // Crear usuario — solo admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // Obtener todos los usuarios — admin y barber
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'barber')
  @Get()
  findAll(@Req() req) {
  const q = req.query.q as string;
  return this.userService.findAll(q);
}


  // Obtener usuario por ID — admin y barber
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'barber')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  // Editar usuario — admin, barber, client
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'barber', 'client')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() dto: UpdateUserDto,
  ) {
    if (req.user.role !== 'admin' && req.user.id !== +id) {
      throw new ForbiddenException('No autorizado');
    }
    return this.userService.update(+id, dto);
  }

  // Cambiar contraseña — cualquier usuario logueado
  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(+id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/location')
  updateBarberLocation(
    @Param('id') id: number,
    @Body() dto: UpdateBarberLocationDto,
  ) {
    return this.userService.updateBarberLocation(id, dto.locationId);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'barber', 'client')
@Delete('delete-avatar')
async deleteAvatar(@Req() req: AuthRequest) {
  return this.userService.deleteAvatar(req.user.id);
}

  // Eliminar usuario — solo admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log("REMOVE USER");
    return this.userService.remove(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deactivate(id);
  }
  

  @Post('avatar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'barber', 'client')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({

        destination: (req, file, callback) => {
          const uploadPath = join(process.cwd(), 'uploads', 'avatars');

          // crear carpeta si no existe
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }

          callback(null, uploadPath);
        },

        filename: (req, file, callback) => {
          const request = req as AuthRequest;

          const extension = extname(file.originalname);

          const filename = `user_${request.user.id}${extension}`;

          callback(null, filename);
        },

      }),

      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },

      fileFilter: (req, file, callback) => {
        const allowedTypes = /jpg|jpeg|png/;

        const ext = allowedTypes.test(extname(file.originalname).toLowerCase());
        const mime = allowedTypes.test(file.mimetype);

        if (ext && mime) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('Solo se permiten imágenes JPG o PNG'),
            false,
          );
        }
      },

    }),
  )
  uploadAvatar(
    @Req() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('FILE:', file);
    if (!file) {
      throw new BadRequestException('No se envió ninguna imagen');
    }

    return this.userService.updateAvatar(req.user.id, file);
  }
   

 
}