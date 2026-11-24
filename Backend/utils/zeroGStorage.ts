/**
 * @deprecated Re-exports local content storage. 0G Storage has been removed.
 * Prefer importing from "./contentStorage" directly.
 */
export {
  uploadJSON,
  uploadFileBuffer,
  downloadFileBuffer,
  fetchJSON,
} from "./contentStorage";
export type { UploadResult } from "./contentStorage";
