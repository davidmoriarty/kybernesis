// server/src/lib/localStorageAdapter.ts
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter } from "./types";

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

export function getStoredFilePath(storageKey: string) {
  const filePath = path.resolve(UPLOAD_ROOT, storageKey);

  if (!filePath.startsWith(UPLOAD_ROOT)) {
    throw new Error("Invalid storage key");
  }

  return filePath;
}

export async function storedFileExists(storageKey: string) {
  try {
    const filePath = getStoredFilePath(storageKey);
    const fileStat = await stat(filePath);

    return fileStat.isFile();
  } catch {
    return false;
  }
}

export async function readStoredFile(storageKey: string) {
  const filePath = getStoredFilePath(storageKey);
  return readFile(filePath);
}

export async function readStoredTextFile(storageKey: string) {
  const buffer = await readStoredFile(storageKey);
  return buffer.toString("utf8");
}

export async function writeStoredTextFile(storageKey: string, content: string) {
  const filePath = getStoredFilePath(storageKey);
  await writeFile(filePath, content, "utf8");
}

export async function deleteStoredFile(storageKey: string) {
  try {
    const filePath = getStoredFilePath(storageKey);
    await unlink(filePath);
    return true;
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "ENOENT"
    ) {
      return false;
    }

    throw err;
  }
}

export const localStorageAdapter: StorageAdapter = {
  saveProjectFile,
  storedFileExists,
  readStoredFile,
  readStoredTextFile,
  writeStoredTextFile,
  deleteStoredFile,
};
