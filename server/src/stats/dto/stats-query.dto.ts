import { IsEnum, IsOptional } from 'class-validator';

export enum StatsPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class StatsQueryDto {
  @IsOptional()
  @IsEnum(StatsPeriod)
  period?: StatsPeriod;
}
