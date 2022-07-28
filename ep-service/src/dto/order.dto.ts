import { OrderItemDTO } from './order-item.dto';

export class OrderDTO {
  id: string;
  date: Date;
  items: Array<OrderItemDTO>;
}
