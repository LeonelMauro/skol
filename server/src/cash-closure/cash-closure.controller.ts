import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CashClosureService } from './cash-closure.service';
import { CreateCashClosureDto } from './dto/create-cash-closure.dto';
import { UpdateCashClosureDto } from './dto/update-cash-closure.dto';

@Controller('cash-closure')
export class CashClosureController {
  constructor(private readonly cashClosureService: CashClosureService) {}

  @Post()
  create(@Body() createCashClosureDto: CreateCashClosureDto) {
    return this.cashClosureService.create(createCashClosureDto);
  }

  @Get()
  findByDate(
    @Query('locationId') locationId: number,
    @Query('date') date: string,
  ) {
    return this.cashClosureService.findByDate(+locationId , date);
  }

  @Get('location/:id')
  findAllByLocation(@Param('id') id: number) {
    return this.cashClosureService.findAllByLocation(+id);
  }
 
}
