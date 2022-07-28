import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = OrderModel & Document;

@Schema({})
export class OrderModel {
  @Prop({ index: true })
  id: string;

  @Prop({ index: true })
  date: Date;

  @Prop()
  products: string[];
}

export const OrderSchema = SchemaFactory.createForClass(OrderModel);
