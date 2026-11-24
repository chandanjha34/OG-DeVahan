import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface UploadResult {
  rootHash: string;
  txHash: string;
}

const STORAGE_DIR = path.join(process.cwd(), "storage", "blobs");

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

function sha256(data: Buffer | string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function blobPath(rootHash: string): string {
  return path.join(STORAGE_DIR, rootHash);
}

/**
 * Upload JSON — content-addressed by SHA-256 (replaces 0G Storage).
 * Keeps the same { rootHash, txHash } shape for existing mint/service flows.
 */
export async function uploadJSON(
  jsonData: any,
  _fileName?: string
): Promise<UploadResult> {
  ensureStorageDir();
  const payload = Buffer.from(JSON.stringify(jsonData, null, 2), "utf8");
  const rootHash = sha256(payload);
  fs.writeFileSync(blobPath(rootHash), payload);
  return { rootHash, txHash: `local:${rootHash}` };
}

/**
 * Upload any file buffer — content-addressed by SHA-256.
 */
export async function uploadFileBuffer(
  fileBuffer: Buffer,
  _fileName: string
): Promise<UploadResult> {
  ensureStorageDir();
  const rootHash = sha256(fileBuffer);
  fs.writeFileSync(blobPath(rootHash), fileBuffer);
  return { rootHash, txHash: `local:${rootHash}` };
}

/**
 * Download file as Buffer by content hash.
 */
export async function downloadFileBuffer(rootHash: string): Promise<Buffer> {
  const filePath = blobPath(rootHash);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Blob not found for rootHash: ${rootHash}`);
  }
  return fs.readFileSync(filePath);
}

/**
 * Fetch JSON by content hash.
 */
export async function fetchJSON(rootHash: string): Promise<any> {
  const buffer = await downloadFileBuffer(rootHash);
  try {
    return JSON.parse(buffer.toString("utf8"));
  } catch {
    return buffer;
  }
}
