import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async overview() {
    return this.analyticsService.overview();
  }

  @Get('deals')
  async deals() {
    return this.analyticsService.dealsReport();
  }

  @Get('users')
  async users() {
    return this.analyticsService.usersReport();
  }
}
