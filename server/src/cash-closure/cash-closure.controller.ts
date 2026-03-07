import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CashClosureService } from './cash-closure.service';
import { CreateCashClosureDto } from './dto/create-cash-closure.dto';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cash-closure')
export class CashClosureController {
  constructor(private readonly cashClosureService: CashClosureService) {}

  @Roles('admin')
  @Post()
  create(@Body() createCashClosureDto: CreateCashClosureDto) {
    return this.cashClosureService.create(createCashClosureDto);
  }

  @Roles('admin')
  @Get()
  findByDate(
    @Query('locationId') locationId: number,
    @Query('date') date: string,
  ) {
    return this.cashClosureService.findByDate(+locationId , date);
  }

  @Roles('admin')
  @Get('location/:id')
  findAllByLocation(@Param('id') id: number) {
    return this.cashClosureService.findAllByLocation(+id);
  }
  
  @Get('barber/history')
  findBarberHistory(
    @Req() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.cashClosureService.findBarberHistory(
      req.user.id,
      from,
      to,
    );
  }

 
}
