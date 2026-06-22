// server/src/lib/storage/r2StorageAdapter.ts
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { r2Client } from "./r2Client";
import type { StorageAdapter } from "./types";

function sanitizeFilename(filename: string) {
  return filename
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-");
}

async function streamToBuffer(stream: unknown) {
  if (!stream || typeof stream !== "object") {
    return Buffer.from([]);
  }

  const chunks: Buffer[] = [];

  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

async function readStoredFileFromR2(storageKey: string) {
  const response = await r2Client.send(
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: storageKey,
    }),
  );

  return streamToBuffer(response.Body);
}

export const r2StorageAdapter: StorageAdapter = {
  async saveProjectFile({ projectId, file }) {
    const safeFilename = sanitizeFilename(file.name || "upload");
    const storageKey = [
      "projects",
      projectId,
      `${crypto.randomUUID()}-${safeFilename}`,
    ].join("/");

    const buffer = Buffer.from(await file.arrayBuffer());

    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: storageKey,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      }),
    );

    return storageKey;
  },

  async storedFileExists(storageKey) {
    try {
      await r2Client.send(
        new HeadObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: storageKey,
        }),
      );

      return true;
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "$metadata" in err &&
        typeof err.$metadata === "object" &&
        err.$metadata &&
        "httpStatusCode" in err.$metadata &&
        err.$metadata.httpStatusCode === 404
      ) {
        return false;
      }

      throw err;
    }
  },

  readStoredFile: readStoredFileFromR2,

  async readStoredTextFile(storageKey) {
    const buffer = await readStoredFileFromR2(storageKey);
    return buffer.toString("utf8");
  },

  async writeStoredTextFile(storageKey, content) {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: storageKey,
        Body: content,
        ContentType: "text/plain; charset=utf-8",
      }),
    );
  },

  async deleteStoredFile(storageKey) {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: storageKey,
      }),
    );

    return true;
  },
};
