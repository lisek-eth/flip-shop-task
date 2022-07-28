import { Injectable } from '@nestjs/common';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { InjectModel } from '@nestjs/mongoose';
import { OrderDocument, OrderModel } from '../model/order.model';
import { Model } from 'mongoose';
import {
  OrderProductDocument,
  OrderProductModel,
} from '../model/order-product.model';
import {
  DailyProductsInOrdersDocument,
  DailyProductsInOrdersModel,
} from '../model/daily-products-in-orders.model';
import { OrderItemDTO } from '../dto/order-item.dto';
import { OrderDTO } from '../dto/order.dto';

const REDIS_TOP10_SALES = 'top10-sales';
const REDIS_TOP10_ORDERS_COUNT = 'top10-orders-count';
const REDIS_TOP10_BOUGHT_YESTERDAY = 'top10-bought-yesterday';

@Injectable()
export class EpService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectModel(OrderModel.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderProductModel.name)
    private productModel: Model<OrderProductDocument>,
    @InjectModel(DailyProductsInOrdersModel.name)
    private dailyProductsModel: Model<DailyProductsInOrdersDocument>,
  ) {}

  async getTop10Sales(): Promise<any> {
    const redisTop10 = await this.redis.get(REDIS_TOP10_SALES);

    if (!redisTop10) {
      const results = await this.findTop10Sales();
      this.redisSetTop10Sales(JSON.stringify(results));

      return results;
    }
    return JSON.parse(redisTop10);
  }

  async getTop10OrdersCount(): Promise<any> {
    const redisTop10 = await this.redis.get(REDIS_TOP10_ORDERS_COUNT);

    if (!redisTop10) {
      const results = await this.findTop10OrdersCount();
      this.redisSetTop10OrdersCount(JSON.stringify(results));

      return results;
    }
    return JSON.parse(redisTop10);
  }

  async getTop10MostBoughtYesterday(): Promise<any> {
    const redisTop10 = await this.redis.get(REDIS_TOP10_BOUGHT_YESTERDAY);
    if (!redisTop10) {
      const results = await this.findTop10BoughtYesterday();
      this.redisSetTop10BoughtYesterday(JSON.stringify(results));

      return results;
    }
    return JSON.parse(redisTop10);
  }

  redisSetTop10Sales(value: string): void {
    this.redis.set(REDIS_TOP10_SALES, value);
  }

  redisSetTop10OrdersCount(value: string): void {
    this.redis.set(REDIS_TOP10_ORDERS_COUNT, value);
  }

  redisSetTop10BoughtYesterday(value: string): void {
    this.redis.set(REDIS_TOP10_BOUGHT_YESTERDAY, value);
  }

  async findTop10Sales(): Promise<any> {
    return this.productModel
      .find({})
      .select(['id', 'name', 'sales_value'])
      .sort({ sales_value: -1 })
      .skip(0)
      .limit(10)
      .exec();
  }

  async findTop10OrdersCount(): Promise<any> {
    return this.productModel
      .find({})
      .select(['id', 'name', 'orders_count'])
      .sort({ orders_count: -1 })
      .skip(0)
      .limit(10);
  }

  async updateProductSalesValueAndOrdersCount(
    orderID: string,
    orderProducts: OrderItemDTO[],
  ): Promise<string[]> {
    const products = [];
    for (const orderItem of orderProducts) {
      products.push(orderItem.product.id);

      const productSaleValue = orderItem.quantity * orderItem.product.price;

      await this.productModel.findOneAndUpdate(
        { id: { $eq: orderItem.product.id } },
        {
          name: orderItem.product.name,
          $push: { sales: productSaleValue, orders: orderID },
          $inc: { sales_value: productSaleValue, orders_count: 1 },
        },
        { upsert: true },
      );
    }

    return products;
  }

  async addOrder(order: OrderDTO, products: string[]): Promise<any> {
    const newOrder = new this.orderModel({
      id: order.id,
      date: order.date,
      products,
    });
    return newOrder.save();
  }

  async updateDailyProductsInOrders(
    orderDate: Date,
    orderProducts: OrderItemDTO[],
  ): Promise<void> {
    orderDate = new Date(orderDate);
    const date =
      orderDate.getUTCFullYear() +
      '-' +
      ('0' + (orderDate.getUTCMonth() + 1)).slice(-2) +
      '-' +
      ('0' + orderDate.getUTCDate()).slice(-2);

    for (const item of orderProducts) {
      await this.dailyProductsModel.findOneAndUpdate(
        { product_id: { $eq: item.product.id }, date: { $eq: date } },
        { name: item.product.name, date: date, $inc: { orders_count: 1 } },
        { upsert: true },
      );
    }

    return null;
  }

  async findTop10BoughtYesterday(): Promise<any> {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getDate() - 1);

    const dateYesterday =
      yesterday.getUTCFullYear() +
      '-' +
      ('0' + (yesterday.getUTCMonth() + 1)).slice(-2) +
      '-' +
      ('0' + yesterday.getUTCDate()).slice(-2);
    return this.dailyProductsModel
      .find({ date: dateYesterday }, {}, { sort: { orders_count: -1 } })
      .skip(0)
      .limit(10);
  }
}
