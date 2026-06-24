import prisma from '../src/lib/prisma';
import { OrderStatus } from '../src/generated/prisma/enums';

const orders = [
  {
    trackingNumber: 'AWB0000001',
    senderName: 'Alice',
    recipientName: 'Bob',
    origin: 'JAKARTA',
    destination: 'SURABAYA',
    status: OrderStatus.PENDING,
  },
  {
    trackingNumber: 'AWB0000002',
    senderName: 'Carol',
    recipientName: 'Dave',
    origin: 'BANDUNG',
    destination: 'MEDAN',
    status: OrderStatus.IN_TRANSIT,
  },
  {
    trackingNumber: 'AWB0000003',
    senderName: 'Erin',
    recipientName: 'Frank',
    origin: 'SEMARANG',
    destination: 'MAKASSAR',
    status: OrderStatus.DELIVERED,
  },
];

async function main() {
  for (const order of orders) {
    const exists = await prisma.order.findUnique({ where: { trackingNumber: order.trackingNumber } });
    if (!exists) {
      await prisma.order.create({ data: order });
      console.log(`Created order: ${order.trackingNumber}`);
    } else {
      console.log(`Skipped order (exists): ${order.trackingNumber}`);
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
