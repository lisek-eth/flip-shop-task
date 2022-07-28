import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from "./orders.service";
import { HttpModule } from "@nestjs/axios";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderModel, OrderSchema } from "../models/order.model";
import { DatabaseModule } from "../db/database.module";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from "../app.module";
import { connect, Connection } from "mongoose";
import { OrderDTO } from "../dto/order.dto";

describe('OrdersService', () => {
  let ordersService: OrdersService;
  let mongo: MongoMemoryServer;
  let mongoConnection: Connection;

  beforeEach(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    mongoConnection = (await connect(uri)).connection;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => {
            process.env.DB_NAME = 'orders';
            process.env.DB_URI = uri;

            return {
              uri: uri
            }
          }
        }),
        AppModule,
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
  });

  describe('API data', () => {
    it('get from API - add & find order', async () => {
      const orders = await ordersService.getOrdersFromAPI(0, 10);

      expect(orders.length).toEqual(10);
      await ordersService.newOrder(orders[0]);
      const dbOrder = await ordersService.findOne(orders[0].id);
      expect(dbOrder).not.toBe(null);

      expect(dbOrder.id).toEqual(orders[0].id);
    });
  });
});
