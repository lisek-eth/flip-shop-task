import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EpService } from '../services/ep.service';

@Injectable()
export class EpScheduleService {
  private readonly logger = new Logger(EpScheduleService.name);

  constructor(private readonly epService: EpService) {}

  @Cron('0 0 0 * * *')
  async processTop10BoughtYesterday() {
    this.logger.debug('start cron job: processTop10BoughtYesterday');

    const results = await this.epService.findTop10BoughtYesterday();
    this.epService.redisSetTop10BoughtYesterday(JSON.stringify(results));

    this.logger.debug('finished cron job: processTop10BoughtYesterday');
  }
}
