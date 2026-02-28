// packages/db/src/types/tx.ts
import type { db } from "../dbInstance";

export type Tx = Parameters<typeof db.transaction>[0] extends (
  tx: infer T,
) => unknown
  ? T
  : never;
