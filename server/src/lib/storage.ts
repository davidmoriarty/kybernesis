// server/src/lib/storage.ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_ROOT = path.resolve(process.cwd(), "data", "uploads");

function sanitizeFilename(filename: string) {
  return filename
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-");
}

export async function saveProjectFile({
  projectId,
  file,
}: {
  projectId: string;
  file: File;
}) {
  const safeFilename = sanitizeFilename(file.name || "upload");
  const storageKey = path.posix.join(
    "projects",
    projectId,
    `${crypto.randomUUID()}-${safeFilename}`,
  );

  const destinationPath = path.join(UPLOAD_ROOT, storageKey);
  const destinationDir = path.dirname(destinationPath);

  await mkdir(destinationDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(destinationPath, buffer);

  return storageKey;
}
