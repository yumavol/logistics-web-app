import prisma from '../src/lib/prisma';
import { ItemStatus } from '../src/generated/prisma/enums';

const items = [
  { name: 'First item', description: 'Sample draft item', status: ItemStatus.DRAFT, priority: 0 },
  { name: 'Second item', description: 'Sample active item', status: ItemStatus.ACTIVE, priority: 1 },
  { name: 'Third item', description: 'Sample archived item', status: ItemStatus.ARCHIVED, priority: 2 },
];

async function main() {
  for (const item of items) {
    const exists = await prisma.item.findFirst({ where: { name: item.name } });
    if (!exists) {
      await prisma.item.create({ data: item });
      console.log(`Created item: ${item.name}`);
    } else {
      console.log(`Skipped item (exists): ${item.name}`);
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
