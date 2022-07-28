import { EpService } from "./ep.service";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connect, Connection } from "mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { MongooseModule } from "@nestjs/mongoose";
import { AppModule } from "../app.module";
import { OrderDTO } from "../dto/order.dto";
import { OrderItemDTO } from "../dto/order-item.dto";
import { OrderProductDTO } from "../dto/order-product.dto";


describe('EpService', () => {
  let epService: EpService;
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

    epService = module.get<EpService>(EpService);
  });

  it('test adding to db and updating', async () => {
    const order: OrderDTO = {
      id: "43bfe5a4e3885ea99d1deda9",
      date: new Date("2021-07-28T10:20:27.468Z"),
      items: [{
        quantity: 2,
        product: { id: "cd9db1ebd25d7ed0bcf7d67f", name: "test name", price: 10.00 } as OrderProductDTO
      } as OrderItemDTO]
    };

    const products = await epService.updateProductSalesValueAndOrdersCount(
      order.id,
      order.items,
    );
    await epService.updateDailyProductsInOrders(order.date, order.items);
    await epService.addOrder(order, products);

    const resSales = await epService.findTop10Sales();
    const resCount = await epService.findTop10OrdersCount();

    expect(resSales.length).toEqual(1);
    expect(resSales[0].name).toEqual('test name');
    expect(resSales[0].sales_value).toEqual(20);

    expect(resCount.length).toEqual(1);
    expect(resCount[0].name).toEqual('test name');
    expect(resCount[0].orders_count).toEqual(1);
  });
});
