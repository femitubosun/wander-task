import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export default async () => {
  await prisma.$transaction([prisma.weatherCache.deleteMany()]);
};
