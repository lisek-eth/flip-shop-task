import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DailyProductsInOrdersDocument = DailyProductsInOrdersModel &
  Document;

@Schema({ minimize: false })
export class DailyProductsInOrdersModel {
  @Prop({ index: true })
  product_id: string;

  @Prop()
  name: string;

  @Prop({ index: true })
  date: string;

  @Prop({ index: true })
  orders_count: number;
}

export const DailyProductsInOrdersSchema = SchemaFactory.createForClass(
  DailyProductsInOrdersModel,
);
