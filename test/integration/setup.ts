import { beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";
import { config } from "dotenv";
import { resolve } from "path";

// Mock Cloudflare Workers runtime
vi.mock("cloudflare:workers", () => ({
  WorkflowEntrypoint: class WorkflowEntrypoint {},
  WorkflowEvent: class WorkflowEvent {},
  WorkflowStep: class WorkflowStep {},
}));

// Load test environment variables
beforeAll(() => {
  // Load .env.test file
  config({ path: resolve(process.cwd(), ".env.test") });
  
  // Set test environment
  process.env.NODE_ENV = "test";
  
  // Mock external services if needed
  if (process.env.MOCK_OPENAI === "true") {
    // Mock OpenAI responses will be handled in individual tests
  }
  
  if (process.env.MOCK_APIFY === "true") {
    // Mock Apify responses will be handled in individual tests
  }
});

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks();
});

// Global test timeout
beforeAll(() => {
  // Set a reasonable timeout for integration tests
  vi.setConfig({ testTimeout: 30000 }); // 30 seconds
});