import { db } from "@/prisma/db";
import { headers } from "next/headers";
import { getSession } from "@/lib/session";

// We use string literals that match the Prisma enum AdminActionType
export type AdminActionTypeStr = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'SETTINGS_CHANGE'
  | 'OTHER';

interface LogAdminActionParams {
  action: AdminActionTypeStr;
  entity: string;
  entityId?: string;
  description: string;
}

export async function logAdminAction({
  action,
  entity,
  entityId,
  description
}: LogAdminActionParams) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return;
    
    const adminId = session.userId;
    
    // In Next.js App Router, headers() is asynchronous in newer versions, 
    // but synchronous in older ones. We'll await it to be safe.
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || null;
    const userAgent = headersList.get("user-agent") || null;

    await db.orm.public.AdminAuditLog.create({
      adminId: adminId as string,
      action: action as any,
      entity,
      entityId,
      description,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
    // We intentionally don't throw here so that audit logging failure doesn't break the main flow
  }
}
