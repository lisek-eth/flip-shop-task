import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OrderItemDTO } from '../dto/order-item.dto';
import { CustomerDTO } from '../dto/customer.dto';

export type OrderDocument = OrderModel & Document;

@Schema({})
export class OrderModel {
  @Prop({ index: true })
  id: string;

  @Prop({ index: true })
  date: Date;

  @Prop()
  customer: CustomerDTO;

  @Prop()
  items: Array<OrderItemDTO>;
}

export const OrderSchema = SchemaFactory.createForClass(OrderModel);
