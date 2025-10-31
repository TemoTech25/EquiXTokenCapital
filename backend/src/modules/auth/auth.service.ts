import { prisma } from "../../db/client";
import { verifyPassword } from "../../lib/hash";
import type { JwtPayload } from "../../lib/jwt";

export const authenticateUser = async (tenantId: string, email: string, password: string) => {
  const user = await prisma.user.findFirst({ where: { email, tenantId } });
  if (!user) return null;
  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok) return null;
  return user;
};

export const buildJwtPayload = (user: { id: string; tenantId: string; role: string; walletAddr: string | null }): JwtPayload => ({
  sub: user.id,
  tenantId: user.tenantId,
  role: user.role,
  accountId: user.walletAddr ?? undefined,
});

export const getUserById = async (id: string) => prisma.user.findUnique({ where: { id } });
