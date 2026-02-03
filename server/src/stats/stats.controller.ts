import { Controller, Get, Query, UseGuards, Req, Param } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsQueryDto } from './dto/stats-query.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // BARBERO → sus propias estadísticas
  @Roles('barber')
  @Get('barber/me')
  getMyStats(
    @Req() req,
    @Query() query: StatsQueryDto,
  ) {
    return this.statsService.getBarberStats(
      req.user.id,
      query.period ?? 'day',
    );
  }

  // ADMIN → estadísticas globales
  @Roles('admin')
  @Get('admin/global')
  getGlobalStats(@Query() query: StatsQueryDto) {
    return this.statsService.getGlobalStats(query.period ?? 'month');
  }

  // ADMIN → estadísticas por barbero
  @Roles('admin')
  @Get('admin/barber/:barberId')
  getBarberStatsByAdmin(
    @Param('barberId') barberId: number,
    @Query() query: StatsQueryDto,
  ) {
    return this.statsService.getBarberStats(
      barberId,
      query.period ?? 'month',
    );
  }
}

