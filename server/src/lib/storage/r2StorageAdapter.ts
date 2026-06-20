// server/src/lib/storage/r2StorageAdapter.ts
import type { StorageAdapter } from "./types";

export const r2StorageAdapter: StorageAdapter = {
  async saveProjectFile() {
    throw new Error("R2 storage adapter not implemented");
  },

  async storedFileExists() {
    throw new Error("R2 storage adapter not implemented");
  },

  async writeStoredTextFile() {
    throw new Error("R2 storage adapter not implemented");
  },

  async deleteStoredFile() {
    throw new Error("R2 storage adapter not implemented");
  },

  getStoredFilePath() {
    throw new Error("R2 storage adapter does not support file paths");
  },
};
