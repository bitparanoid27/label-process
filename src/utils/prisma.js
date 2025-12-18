const { PrismaClient } = require('@prisma/client');

// Create one single instance of PrismaClient
// const prisma = new PrismaClient({ adapter: { url: process.env.DATABASE_URL } });

// const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

const prisma = new PrismaClient();

// Export that single instance
module.exports = prisma;
