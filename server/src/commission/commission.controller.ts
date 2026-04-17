import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';

@Controller('commission')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Post()
  create(@Body() createCommissionDto: CreateCommissionDto) {
    return this.commissionService.create(createCommissionDto);
  }

  @Get()
  findAll() {
    return this.commissionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commissionService.findOne(+id);
  }
  @Get('barber/:barberId')
  findByBarberId(@Param('barberId') barberId: string) {
    return this.commissionService.findByBarberId(+barberId);
  }
  
 @Patch('barber/:barberId')
  update(
    @Param('barberId') barberId: string,
    @Body() dto: UpdateCommissionDto
  ) {
    return this.commissionService.update(+barberId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commissionService.remove(+id);
  }
}
