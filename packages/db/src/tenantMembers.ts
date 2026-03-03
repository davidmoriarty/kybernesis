// packages/db/src/tenantMembers.ts (helper excerpt)
import { and, eq } from "drizzle-orm";
import { db } from "./dbInstance";
import { index, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import type { TenantMemberRow } from "./types";
import { tenants } from "./tenants";
import { users } from "./users";

export const tenantMembers = pgTable(
  "tenant_members",
  {
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").$type<"tenant" | "admin" | "member">().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.tenantId, t.userId] }),
    index("tenant_members_tenant_id_idx").on(t.tenantId),
    index("tenant_members_user_id_idx").on(t.userId),
  ],
);

export async function getTenantRoleForUser(
  tenantId: string,
  userId: string,
): Promise<TenantMemberRow["role"] | undefined> {
  return (
    await db
      .select({ role: tenantMembers.role })
      .from(tenantMembers)
      .where(
        and(
          eq(tenantMembers.tenantId, tenantId),
          eq(tenantMembers.userId, userId),
        ),
      )
      .limit(1)
  )[0]?.role;
}
