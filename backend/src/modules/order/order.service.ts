import prisma from '@/lib/prisma';
import { OrderStatus } from '@/generated/prisma/enums';
import { ValidationError } from '@/lib/errors';
import type { CreateOrderDto, ListOrdersQueryDto, UpdateStatusDto } from '@/modules/order/order.schema';

export class OrderService {
  async create(dto: CreateOrderDto) {
    const trackingNumber = await OrderService.generateTrackingNumber();
    return prisma.order.create({
      data: {
        trackingNumber,
        senderName: dto.senderName,
        recipientName: dto.recipientName,
        origin: dto.origin,
        destination: dto.destination,
      },
    });
  }

  async findAll(query: ListOrdersQueryDto) {
    return prisma.order.findMany({
      where: {
        ...(query.status && { status: query.status }),
        ...(query.search && {
          OR: [
            { trackingNumber: { contains: query.search, mode: 'insensitive' } },
            { senderName: { contains: query.search, mode: 'insensitive' } },
            { recipientName: { contains: query.search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new ValidationError('Order not found', undefined, 404);
    }
    return order;
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    await this.findOne(id);
    return prisma.order.update({ where: { id }, data: { status: dto.status } });
  }

  async trackByNumber(trackingNumber: string) {
    const order = await prisma.order.findUnique({ where: { trackingNumber } });
    if (!order) {
      throw new ValidationError('Order not found', undefined, 404);
    }
    return order;
  }

  async cancel(id: string) {
    const order = await this.findOne(id);
    if (order.status !== OrderStatus.PENDING) {
      throw new ValidationError('Only pending orders can be canceled', undefined, 409);
    }
    return prisma.order.update({ where: { id }, data: { status: OrderStatus.CANCELED } });
  }

  static async generateTrackingNumber() {
    const PREFIX = 'AWB';
    const WIDTH = 7;
    const rows = await prisma.$queryRaw<{ nextval: bigint }[]>`SELECT nextval('awb_seq') AS nextval`;
    const seq = Number(rows[0].nextval);
    return `${PREFIX}${seq.toString(36).toUpperCase().padStart(WIDTH, '0')}`;
  }
}
