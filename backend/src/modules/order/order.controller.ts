import { Request, Response } from 'express';
import { z } from 'zod';
import { OrderService } from '@/modules/order/order.service';
import { createOrderSchema, updateStatusSchema, listOrdersQuerySchema } from '@/modules/order/order.schema';
import { OrderSingleResponse, OrderListResponse } from './order';

const orderService = new OrderService();

export class OrderController {
  async create(req: Request, res: Response): Promise<void> {
    const result = createOrderSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ success: false, errors: z.flattenError(result.error).fieldErrors });
      return;
    }
    const order = await orderService.create(result.data);
    const response: OrderSingleResponse = { success: true, data: order };
    res.status(201).json(response);
  }

  async findAll(req: Request, res: Response): Promise<void> {
    const result = listOrdersQuerySchema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ success: false, errors: z.flattenError(result.error).fieldErrors });
      return;
    }
    const orders = await orderService.findAll(result.data);
    const response: OrderListResponse = { success: true, data: orders };
    res.status(200).json(response);
  }

  async findOne(req: Request, res: Response): Promise<void> {
    const order = await orderService.findOne(req.params.id as string);
    const response: OrderSingleResponse = { success: true, data: order };
    res.status(200).json(response);
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    const result = updateStatusSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ success: false, errors: z.flattenError(result.error).fieldErrors });
      return;
    }
    const order = await orderService.updateStatus(req.params.id as string, result.data);
    const response: OrderSingleResponse = { success: true, data: order };
    res.status(200).json(response);
  }

  async track(req: Request, res: Response): Promise<void> {
    const order = await orderService.trackByNumber(req.params.trackingNumber as string);
    const response: OrderSingleResponse = { success: true, data: order };
    res.status(200).json(response);
  }

  async cancel(req: Request, res: Response): Promise<void> {
    const order = await orderService.cancel(req.params.id as string);
    const response: OrderSingleResponse = { success: true, data: order };
    res.status(200).json(response);
  }
}
