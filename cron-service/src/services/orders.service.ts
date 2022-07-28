import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { EVENT_ORDER } from '../common/events';
import { OrderDocument, OrderModel } from '../models/order.model';
import { OrderDTO } from '../dto/order.dto';

const API_ENDPOINT = 'https://recruitment-api.dev.flipfit.io/orders?';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject('CRON_SERVICE') private natsClient: ClientProxy,
    @InjectModel(OrderModel.name) private orderModel: Model<OrderDocument>,
  ) {}

  async getOrdersFromAPI(
    page: number,
    limit: number,
  ): Promise<Array<OrderModel>> {
    const orders = await lastValueFrom(
      this.httpService.get(API_ENDPOINT + '_page=' + page + '&_limit=' + limit),
    );

    if (orders.data.length > 0) {
      return orders.data;
    }

    return [];
  }

  async findOne(id: string): Promise<OrderModel> {
    return this.orderModel.findOne({ id: { $eq: id } });
  }

  async newOrder(order: OrderModel) {
    const newOrderEntry = new this.orderModel(order);
    await newOrderEntry.save();
  }

  sendOrderEvent(order: OrderDTO): void {
    this.natsClient.emit(EVENT_ORDER, order);
  }
}
