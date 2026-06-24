import { Request, Response } from 'express';
import { z } from 'zod';
import { ItemService } from '@/modules/item/item.service';
import { createItemSchema, updateItemSchema, listItemsQuerySchema } from '@/modules/item/item.schema';
import { ItemSingleResponse, ItemListResponse } from './item';

const itemService = new ItemService();

export class ItemController {
  async create(req: Request, res: Response): Promise<void> {
    const result = createItemSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ success: false, errors: z.flattenError(result.error).fieldErrors });
      return;
    }
    const item = await itemService.create(result.data);
    const response: ItemSingleResponse = { success: true, data: item };
    res.status(201).json(response);
  }

  async findAll(req: Request, res: Response): Promise<void> {
    const result = listItemsQuerySchema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ success: false, errors: z.flattenError(result.error).fieldErrors });
      return;
    }
    const items = await itemService.findAll(result.data);
    const response: ItemListResponse = { success: true, data: items };
    res.status(200).json(response);
  }

  async findOne(req: Request, res: Response): Promise<void> {
    const item = await itemService.findOne(req.params.id as string);
    const response: ItemSingleResponse = { success: true, data: item };
    res.status(200).json(response);
  }

  async update(req: Request, res: Response): Promise<void> {
    const result = updateItemSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ success: false, errors: z.flattenError(result.error).fieldErrors });
      return;
    }
    const item = await itemService.update(req.params.id as string, result.data);
    const response: ItemSingleResponse = { success: true, data: item };
    res.status(200).json(response);
  }

  async remove(req: Request, res: Response): Promise<void> {
    await itemService.remove(req.params.id as string);
    res.status(200).json({ success: true });
  }
}
