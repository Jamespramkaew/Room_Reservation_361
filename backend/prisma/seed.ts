import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL as string;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // Clear existing data
  await prisma.example.deleteMany();

  // Seed Example data
  const example1 = await prisma.example.create({
    data: {
      author: 'Alice',
      comment: 'Hello from Alice!',
    },
  });

  const example2 = await prisma.example.create({
    data: {
      author: 'Bob',
      comment: 'Hello from Bob!',
    },
  });

  const example3 = await prisma.example.create({
    data: {
      author: 'Charlie',
      comment: 'Hello from Charlie!',
    },
  });

  console.log('Seeding finished.');
  console.log({ example1, example2, example3 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
