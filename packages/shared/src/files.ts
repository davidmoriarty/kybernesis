export type FileViewerKind =
  | "text"
  | "image"
  | "pdf"
  | "downloadOnly"
  | "blocked";

const TEXT_EXTENSIONS = new Set([
  "css",
  "html",
  "js",
  "jsx",
  "json",
  "md",
  "php",
  "ts",
  "tsx",
  "txt",
  "yaml",
  "yml",
]);

const IMAGE_EXTENSIONS = new Set([
  "avif",
  "gif",
  "jpg",
  "jpeg",
  "png",
  "svg",
  "webp",
]);

const BLOCKED_EXTENSIONS = new Set([
  "app",
  "bat",
  "cmd",
  "com",
  "dll",
  "dmg",
  "exe",
  "jar",
  "msi",
  "pkg",
  "ps1",
  "scr",
  "sh",
  "vbs",
]);

export type FileLike = {
  name: string;
  mimeType?: string | null;
};

export function getFileExtension(filename: string) {
  const extension = filename.split(".").pop()?.trim().toLowerCase();

  if (!extension || extension === filename.toLowerCase()) {
    return null;
  }

  return extension;
}

export function getFileViewerKind(file: FileLike): FileViewerKind {
  const extension = getFileExtension(file.name);
  const mimeType = file.mimeType?.toLowerCase() ?? "";

  if (extension && BLOCKED_EXTENSIONS.has(extension)) {
    return "blocked";
  }

  if (extension && TEXT_EXTENSIONS.has(extension)) {
    return "text";
  }

  if (extension && IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }

  if (extension === "pdf" || mimeType === "application/pdf") {
    return "pdf";
  }

  if (mimeType.startsWith("text/")) {
    return "text";
  }

  if (mimeType.startsWith("image/")) {
    return "image";
  }

  return "downloadOnly";
}
