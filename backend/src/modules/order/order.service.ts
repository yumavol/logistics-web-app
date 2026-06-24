import prisma from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
import type { CreateOrderDto, ListOrdersQueryDto } from '@/modules/order/order.schema';

export class OrderService {
  async create(dto: CreateOrderDto) {
    const trackingNumber = await this.generateTrackingNumber();
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

  private async generateTrackingNumber() {
    const PREFIX = 'AWB';
    const WIDTH = 7;
    const rows = await prisma.$queryRaw<{ nextval: bigint }[]>`SELECT nextval('awb_seq') AS nextval`;
    const seq = Number(rows[0].nextval);
    return `${PREFIX}${seq.toString(36).toUpperCase().padStart(WIDTH, '0')}`;
  }
}
