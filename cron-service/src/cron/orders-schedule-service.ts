import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrdersService } from '../services/orders.service';
import { OrderDTO } from '../dto/order.dto';

@Injectable()
export class OrdersScheduleService {
  private readonly logger = new Logger(OrdersScheduleService.name);
  private processAPIRunning: boolean = false;

  constructor(private readonly ordersService: OrdersService) {}

  @Cron('30 * * * * *')
  async processAPI() {
    if (this.processAPIRunning) {
      this.logger.debug(
        'cron job: processAPI is currently running. skipping invocation',
      );
      return;
    }

    this.processAPIRunning = true;
    const pageLimit = 100;
    let currentPage = 0;

    this.logger.debug('start cron job: processAPI');

    while (true) {
      const orders = await this.ordersService.getOrdersFromAPI(
        currentPage,
        pageLimit,
      );
      if (orders.length < 1) {
        break;
      }
      for (const order of orders) {
        const dbEntry = await this.ordersService.findOne(order.id);
        if (!dbEntry) {
          await this.ordersService.newOrder(order);

          this.ordersService.sendOrderEvent(new OrderDTO(order));
        }
      }
      currentPage++;
    }

    this.processAPIRunning = false;
    this.logger.debug('finished cron job: processAPI');
  }
}
