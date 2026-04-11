import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to connect to the database');
}

const client = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  connect_timeout: 10,
  max: 10,
});
export const db = drizzle(client, { schema });