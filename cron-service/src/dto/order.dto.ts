import { OrderItemDTO } from './order-item.dto';
import { OrderModel } from '../models/order.model';

export class OrderDTO {
  id: string;
  date: Date;
  items: Array<OrderItemDTO>;

  constructor(order: OrderModel) {
    this.id = order.id;
    this.date = order.date;
    this.items = order.items;
  }
}
