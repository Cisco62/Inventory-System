import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Neon's free tier suspends when idle and can take a few seconds to wake.
    // Prisma's defaults (2s to start a transaction, 5s to finish) are too tight
    // for that, so give transactions room instead of failing the save.
    transactionOptions: {
      maxWait: 15_000,
      timeout: 20_000,
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
