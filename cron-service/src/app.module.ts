import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { OrdersScheduleService } from './cron/orders-schedule-service';
import { OrdersService } from './services/orders.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderModel, OrderSchema } from './models/order.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    ClientsModule.register([
      {
        name: 'CRON_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URI],
        },
      },
    ]),
    ScheduleModule.forRoot(),
    DatabaseModule,
    MongooseModule.forFeature([
      {
        name: OrderModel.name,
        schema: OrderSchema,
        collection: 'orders',
      },
    ]),
  ],
  controllers: [],
  providers: [OrdersService, OrdersScheduleService],
})
export class AppModule {}
