import prisma from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
import type { CreateItemDto, UpdateItemDto, ListItemsQueryDto } from '@/modules/item/item.schema';

export class ItemService {
  async create(dto: CreateItemDto) {
    return prisma.item.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
      },
    });
  }

  async findAll(query: ListItemsQueryDto) {
    return prisma.item.findMany({
      where: {
        ...(query.status && { status: query.status }),
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      throw new ValidationError('Item not found', undefined, 404);
    }
    return item;
  }

  async update(id: string, dto: UpdateItemDto) {
    await this.findOne(id);
    return prisma.item.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return prisma.item.delete({ where: { id } });
  }
}
