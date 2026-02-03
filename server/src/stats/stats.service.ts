import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class StatsService {
  constructor(private dataSource: DataSource) {}

  async getBarberStats(barberId: number, period: string) {
    const dateFilter = this.getDateFilter(period);

    const result = await this.dataSource.query(`
      SELECT
        COUNT(*) AS total_services,
        SUM(s.price) AS total_revenue
      FROM reservation r
      JOIN service s ON s.id = r."serviceId"
      WHERE r."barberId" = $1
        AND r.status = 'completed'
        AND ${dateFilter}
    `, [barberId]);

    return result[0];
  }

  async getGlobalStats(period: string) {
    const dateFilter = this.getDateFilter(period);

    const result = await this.dataSource.query(`
      SELECT
        COUNT(*) AS total_services,
        SUM(s.price) AS total_revenue
      FROM reservation r
      JOIN service s ON s.id = r."serviceId"
      WHERE r.status = 'completed'
        AND ${dateFilter}
    `);

    return result[0];
  }

  private getDateFilter(period: string) {
    switch (period) {
      case 'daily':
        return `r.date = CURRENT_DATE`;
      case 'weekly':
        return `r.date >= CURRENT_DATE - INTERVAL '7 days'`;
      case 'monthly':
        return `date_trunc('month', r.date) = date_trunc('month', CURRENT_DATE)`;
      default:
        return `true`;
    }
  }
}
