import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type OrderProductDocument = OrderProductModel & Document;

@Schema({ minimize: false })
export class OrderProductModel {
  @Prop({ index: true })
  id: string;

  @Prop()
  name: string;

  @Prop()
  sales: number[];

  @Prop({ default: 0, index: true })
  sales_value: number;

  @Prop()
  orders: string[];

  @Prop({ default: 0, index: true })
  orders_count: number;
}

export const OrderProductSchema =
  SchemaFactory.createForClass(OrderProductModel);
