// server/src/lib/storage/types.ts
export interface StorageAdapter {
  saveProjectFile(args: { projectId: string; file: File }): Promise<string>;

  storedFileExists(storageKey: string): Promise<boolean>;

  writeStoredTextFile(storageKey: string, content: string): Promise<void>;

  deleteStoredFile(storageKey: string): Promise<boolean>;

  readStoredFile(storageKey: string): Promise<Buffer>;

  readStoredTextFile(storageKey: string): Promise<string>;
}
