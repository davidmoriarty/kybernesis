// packages/db/src/files.ts
import { desc, eq, relations } from "drizzle-orm";
import {
  bigint,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { db } from "./dbInstance";
import { projects } from "./projects";
import { users } from "./users";

export const files = pgTable(
  "files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    uploadedByUserId: uuid("uploaded_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    size: bigint("size", { mode: "number" }).notNull(),
    mimeType: text("mime_type").notNull(),
    storageKey: text("storage_key").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("files_project_id_created_at_idx").on(
      table.projectId,
      table.created_at,
    ),
  ],
);

export const filesRelations = relations(files, ({ one }) => ({
  project: one(projects, {
    fields: [files.projectId],
    references: [projects.id],
  }),
  uploadedBy: one(users, {
    fields: [files.uploadedByUserId],
    references: [users.id],
  }),
}));

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

export async function createFile(data: NewFile) {
  const [file] = await db.insert(files).values(data).returning();

  if (!file) {
    throw new Error("Failed to create file");
  }

  return file;
}

export async function getFilesByProjectId(projectId: string) {
  return db
    .select()
    .from(files)
    .where(eq(files.projectId, projectId))
    .orderBy(desc(files.created_at));
}

export async function getFileById(id: string) {
  const [file] = await db.select().from(files).where(eq(files.id, id)).limit(1);
  return file ?? null;
}
