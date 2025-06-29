/**
 * Chunking configuration constants for frontend display
 * Keep in sync with workers/config/chunking.ts
 */
export const CHUNK_CONFIG = {
  DEFAULT_CHUNK_SIZE: 1000,      // Default words per chunk
  OVERLAP_SIZE: 100,             // Words overlapping between chunks
} as const;