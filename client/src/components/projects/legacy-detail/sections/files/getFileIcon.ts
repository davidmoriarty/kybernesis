// client/src/components/projects/detail/sections/files/getFileIcon.ts

import {
  File,
  FileArchive,
  FileCode,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

function getFileExtension(filename: string) {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.pop()?.toUpperCase() ?? "FILE") : "FILE";
}

export function getFileIcon(filename: string) {
  const extension = getFileExtension(filename);

  switch (extension) {
    case "JPG":
    case "JPEG":
    case "PNG":
    case "GIF":
    case "WEBP":
    case "SVG":
      return FileImage;

    case "JS":
    case "JSX":
    case "TS":
    case "TSX":
    case "HTML":
    case "CSS":
    case "SCSS":
      return FileCode;

    case "JSON":
      return FileJson;

    case "CSV":
    case "XLS":
    case "XLSX":
      return FileSpreadsheet;

    case "TXT":
    case "MD":
    case "PDF":
    case "DOC":
    case "DOCX":
      return FileText;

    case "ZIP":
    case "RAR":
    case "7Z":
    case "TAR":
    case "GZ":
      return FileArchive;

    default:
      return File;
  }
}
