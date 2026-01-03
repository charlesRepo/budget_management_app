import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Note: In production, you would create real users via Google OAuth
  // This seed is just for testing the database structure

  console.log('Database schema is ready!');
  console.log('Users will be created automatically when they sign in with Google OAuth.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
