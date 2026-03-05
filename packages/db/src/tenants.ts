// packages/db/src/tenants.ts
import { eq } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { db } from "./dbInstance";
import type { TenantRow } from "./types";
import { tenantMembers } from "./tenantMembers";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("tenants_created_at_idx").on(t.createdAt),
    uniqueIndex("tenants_slug_unique").on(t.slug),
  ],
);

export async function createTenant(input: {
  name: string;
  slug: string;
  creatorUserId: string;
}): Promise<TenantRow> {
  return db.transaction((tx) => createTenantTx(tx, input));
}

export async function createTenantTx(
  tx: Tx,
  input: { name: string; slug: string; creatorUserId: string },
): Promise<TenantRow> {
  const inserted = (
    await tx
      .insert(tenants)
      .values({ name: input.name, slug: input.slug, updatedAt: new Date() })
      .returning()
  )[0];

  if (!inserted) throw new Error("Failed to create tenant");

  await tx.insert(tenantMembers).values({
    tenantId: inserted.id,
    userId: input.creatorUserId,
    role: "owner",
  });

  return inserted;
}

export async function getTenantById(
  id: string,
): Promise<TenantRow | undefined> {
  return (
    await db.select().from(tenants).where(eq(tenants.id, id)).limit(1)
  )[0];
}

export async function getTenantBySlug(
  slug: string,
): Promise<TenantRow | undefined> {
  return (
    await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1)
  )[0];
}

export async function getTenantByName(
  name: string,
): Promise<TenantRow | undefined> {
  return (
    await db.select().from(tenants).where(eq(tenants.name, name)).limit(1)
  )[0];
}

export async function updateTenantName(
  tenantId: string,
  name: string,
): Promise<TenantRow | undefined> {
  return (
    await db
      .update(tenants)
      .set({ name, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId))
      .returning()
  )[0];
}
