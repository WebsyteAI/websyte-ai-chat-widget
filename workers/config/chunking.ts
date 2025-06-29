/**
 * Chunking configuration constants used across the application
 * These values control how text is split into chunks for vector embeddings
 */
export const CHUNK_CONFIG = {
  DEFAULT_CHUNK_SIZE: 1000,      // Default words per chunk
  OVERLAP_SIZE: 100,             // Words overlapping between chunks
  MIN_CHUNK_SIZE: 100,           // Minimum chunk size (10% of default)
  CHUNK_REDUCTION_FACTOR: 0.8,   // Reduce by 20% when hitting token limit
  MAX_TOKENS_PER_CHUNK: 8000,    // Conservative limit for OpenAI embeddings (actual limit is 8191)
  TOKEN_ESTIMATE_DIVISOR: 3.5,   // Rough estimation: 1 token ≈ 3.5 characters
  PROGRESS_LOG_INTERVAL: 100,    // Log progress every N chunks
  LARGE_CHUNK_THRESHOLD: 10      // Threshold for final summary log
} as const;

export type ChunkConfig = typeof CHUNK_CONFIG;