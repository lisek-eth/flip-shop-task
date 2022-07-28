import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Model } from 'mongoose';
import {
  OrderProductModel,
  OrderProductDocument,
} from '../model/order-product.model';
import { InjectModel } from '@nestjs/mongoose';
import { OrderDocument, OrderModel } from '../model/order.model';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { EpService } from '../services/ep.service';

@Controller()
export class AppController {
  constructor(
    @Inject('CRON_SERVICE') private natsClient: ClientProxy,
    @InjectRedis() private readonly redis: Redis,
    @InjectModel(OrderModel.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderProductModel.name)
    private productModel: Model<OrderProductDocument>,
    private readonly epService: EpService,
  ) {}

  @Get('/top10-sales-value')
  async top10SalesValue(): Promise<any> {
    return await this.epService.getTop10Sales();
  }

  @Get('/top10-orders-count')
  async top10OrdersCount(): Promise<any> {
    return await this.epService.getTop10OrdersCount();
  }

  @Get('/top10-most-bought')
  async top10MostBought(): Promise<any> {
    return await this.epService.getTop10MostBoughtYesterday();
  }
}
