import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDocument, OrderModel } from '../model/order.model';
import {
  OrderProductModel,
  OrderProductDocument,
} from '../model/order-product.model';
import { EpService } from '../services/ep.service';
import { OrderDTO } from '../dto/order.dto';
import { EVENT_ORDER } from '../common/events';

@Controller()
export class EventsController {
  constructor(
    @Inject('CRON_SERVICE') private natsClient: ClientProxy,
    @InjectRedis() private readonly redis: Redis,
    @InjectModel(OrderModel.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderProductModel.name)
    private productModel: Model<OrderProductDocument>,
    private readonly epService: EpService,
  ) {}

  @EventPattern(EVENT_ORDER)
  async handleEventOrder(order: OrderDTO): Promise<boolean> {
    const orderExist = await this.orderModel.findOne({ id: { $eq: order.id } });
    if (orderExist) {
      return;
    }

    const products = await this.epService.updateProductSalesValueAndOrdersCount(
      order.id,
      order.items,
    );
    await this.epService.updateDailyProductsInOrders(order.date, order.items);
    await this.epService.addOrder(order, products);

    let results = await this.epService.findTop10Sales();
    this.epService.redisSetTop10Sales(JSON.stringify(results));

    results = await this.epService.findTop10OrdersCount();
    this.epService.redisSetTop10OrdersCount(JSON.stringify(results));

    return true;
  }
}
