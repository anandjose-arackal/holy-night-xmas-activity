/**
 * Where models and pictures load from. Empty (default): this app's own public folder.
 * Set NEXT_PUBLIC_ASSET_URL to a storage address (S3 + CloudFront, Cloudflare R2, ...) holding the same
 * folders (models/, treasures/, bg/, stories/) to serve them from there, e.g. https://assets.example.org
 */
const BASE = process.env.NEXT_PUBLIC_ASSET_URL ?? "";

/**
 * Phones keep these files for a year without asking again (next.config.ts headers). After replacing any
 * model or picture, raise this number: every address changes, so every phone fetches the new files once.
 */
export const ASSET_VERSION = 1;

export const asset = (path: string) => `${BASE}${path}?v=${ASSET_VERSION}`;
