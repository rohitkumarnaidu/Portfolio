/* eslint-disable no-console -- CLI seed script reports progress to the terminal */
/**
 * Database seed.
 *
 * Creates the canonical RBAC roles and one administrator account. Safe to run
 * repeatedly: roles and the admin user are upserted, never duplicated.
 *
 * Usage (from apps/api): `npm run prisma:seed`
 *
 * Environment is resolved the same way as the API: shell variables win, then
 * `config/.env` at the repository root, then `apps/api/.env`.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const ENV_FILES = [
  path.resolve(__dirname, '../../../config/.env'),
  path.resolve(__dirname, '../../../.env.local'),
  path.resolve(__dirname, '../.env'),
];

for (const file of ENV_FILES) {
  if (fs.existsSync(file)) {
    dotenv.config({ path: file });
  }
}

const BCRYPT_ROUNDS = 12;

const ROLES = [
  { name: 'admin', description: 'Full administrative access' },
  { name: 'editor', description: 'Can manage portfolio content' },
  { name: 'viewer', description: 'Read-only access' },
] as const;

async function main() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be set to at least 8 characters before seeding');
  }
  const email = (process.env.ADMIN_EMAIL || 'admin@portfolio.com').trim().toLowerCase();
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/portfolio?schema=public';

  const pool = new pg.Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    for (const role of ROLES) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: { description: role.description },
        create: role,
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const admin = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, isActive: true },
      create: {
        email,
        displayName: 'Portfolio Admin',
        passwordHash,
        isActive: true,
      },
    });

    const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'admin' } });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
      update: {},
      create: { userId: admin.id, roleId: adminRole.id },
    });

    console.log(`Seeded roles: ${ROLES.map((role) => role.name).join(', ')}`);
    console.log(`Seeded admin user: ${email} (${admin.id})`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
