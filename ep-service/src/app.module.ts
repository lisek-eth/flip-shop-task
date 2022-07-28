import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OrderProductModel,
  OrderProductSchema,
} from './model/order-product.model';
import { OrderModel, OrderSchema } from './model/order.model';
import { RedisModule } from '@nestjs-modules/ioredis';
import { EpService } from './services/ep.service';
import { EventsController } from './controllers/events.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { EpScheduleService } from './cron/ep-schedule-service';
import {
  DailyProductsInOrdersModel,
  DailyProductsInOrdersSchema,
} from './model/daily-products-in-orders.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'CRON_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URI],
        },
      },
    ]),
    DatabaseModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: OrderModel.name,
        schema: OrderSchema,
        collection: 'orders',
      },
      {
        name: OrderProductModel.name,
        schema: OrderProductSchema,
        collection: 'products',
      },
      {
        name: DailyProductsInOrdersModel.name,
        schema: DailyProductsInOrdersSchema,
        collection: 'daily-products-in-orders',
      },
    ]),
    RedisModule.forRoot({
      config: {
        url: process.env.REDIS_URI,
      },
    }),
  ],
  controllers: [AppController, EventsController],
  providers: [EpService, EpScheduleService],
})
export class AppModule {}
