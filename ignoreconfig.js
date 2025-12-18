require('dotenv').config(); // Load env vars manually
import { defineConfig } from '@prisma/config';

// Verify it loaded (Optional, for your peace of mind)
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing');

// Use CommonJS export
export default defineConfig({
  // Point to your schema
  schema: 'prisma/schema.prisma',

  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
