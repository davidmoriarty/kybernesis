// server/src/lib/storage/index.ts
import { localStorageAdapter } from "./localStorageAdapter";
import { r2StorageAdapter } from "./r2StorageAdapter";

const STORAGE_DRIVER = process.env.STORAGE_DRIVER ?? "local";

export const storage =
  STORAGE_DRIVER === "r2" ? r2StorageAdapter : localStorageAdapter;

export const {
  saveProjectFile,
  storedFileExists,
  writeStoredTextFile,
  deleteStoredFile,
  getStoredFilePath,
} = storage;
