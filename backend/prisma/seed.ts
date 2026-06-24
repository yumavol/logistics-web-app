import prisma from '../src/lib/prisma';
import { OrderStatus } from '../src/generated/prisma/enums';
import { OrderService } from '../src/modules/order/order.service';

const orders = [
  {
    senderName: 'Alice',
    recipientName: 'Bob',
    origin: 'JAKARTA',
    destination: 'SURABAYA',
    status: OrderStatus.PENDING,
  },
  {
    senderName: 'Carol',
    recipientName: 'Dave',
    origin: 'BANDUNG',
    destination: 'MEDAN',
    status: OrderStatus.IN_TRANSIT,
  },
  {
    senderName: 'Erin',
    recipientName: 'Frank',
    origin: 'SEMARANG',
    destination: 'MAKASSAR',
    status: OrderStatus.DELIVERED,
  },
];

async function main() {
  for (const order of orders) {
    const exists = await prisma.order.findFirst({
      where: { senderName: order.senderName, recipientName: order.recipientName },
    });
    if (!exists) {
      const trackingNumber = await OrderService.generateTrackingNumber();
      await prisma.order.create({ data: { ...order, trackingNumber } });
      console.log(`Created order: ${trackingNumber}`);
    } else {
      console.log(`Skipped order (exists): ${exists.trackingNumber}`);
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
