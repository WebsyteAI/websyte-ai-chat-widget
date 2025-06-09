# Test Suite for Websyte AI Chat Widget Services

This directory contains comprehensive tests for the worker services in the `workers/services/` directory.

## Test Framework

- **Vitest** - Fast unit test framework with TypeScript support
- **jsdom** - DOM environment for testing
- **vi** - Built-in mocking utilities

## Test Coverage

Current test coverage is **100% statements, 100% functions, 100% lines, 98% branches**.

**Total Test Count**: 235 tests across 9 test files (93 worker services + 121 app library tests + 21 integration tests)

## Test Files

### `openai.test.ts`
Tests for the OpenAI service that handles API communication:
- ✅ Chat completion with various options
- ✅ Summary generation with content truncation
- ✅ Recommendations generation with JSON parsing
- ✅ Error handling (API errors, network errors, abort signals)
- ✅ Content truncation for large inputs

### `chat.test.ts`
Tests for the chat service that handles chat requests:
- ✅ HTTP method validation
- ✅ Request validation (message, context requirements)
- ✅ Message history management (truncation to last 10)
- ✅ System prompt generation with page context
- ✅ Error handling (abort errors, general errors)
- ✅ Content processing and context handling

### `recommendations.test.ts`
Tests for the recommendations service:
- ✅ HTTP method validation
- ✅ Content/title requirement validation
- ✅ OpenAI integration for generating recommendations
- ✅ Fallback responses on errors
- ✅ Abort signal handling

### `summarize.test.ts`
Tests for the summarize service:
- ✅ HTTP method validation
- ✅ Content validation (including whitespace-only content)
- ✅ OpenAI integration for summary generation
- ✅ Error handling and user-friendly error messages
- ✅ Special character and edge case handling

## App Library Tests

### `content-extractor.test.ts`
Tests for the content extraction system with caching:
- ✅ Cache-first content extraction and fallback behavior
- ✅ Retry mechanism with exponential backoff (3 attempts)
- ✅ DOM processing (script/style removal, text cleaning)
- ✅ Content validation (length and word count requirements)
- ✅ Cache utility methods (warming, clearing, statistics)
- ✅ Error handling (missing selectors, insufficient content)

### `content-cache.test.ts`
Tests for the content caching system:
- ✅ Basic cache operations (set, get, has, clear)
- ✅ TTL functionality and expiration handling
- ✅ LRU eviction when size limits exceeded
- ✅ Cache statistics tracking (hits, misses, hit rate)
- ✅ Configuration updates and logging functionality
- ✅ Edge cases (special characters, large content, concurrent access)

### `storage.test.ts`
Tests for the localStorage management system:
- ✅ Message operations (save, retrieve, filter by URL)
- ✅ Widget state management (save/load, partial updates)
- ✅ Storage limits (message history truncation)
- ✅ Error handling (JSON parsing, storage quota, corrupted data)
- ✅ Edge cases (concurrent access, missing data, large content)

### `utils.test.ts`
Tests for utility functions:
- ✅ Class name merging with clsx and tailwind-merge
- ✅ Conditional class handling and array inputs
- ✅ Tailwind class conflict resolution
- ✅ Real-world component class scenarios
- ✅ Edge cases (empty inputs, special characters, nested objects)

## Running Tests

```bash
# Run tests once
pnpm test:run

# Run tests in watch mode
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

## Test Setup

- **Global fetch mock** - All HTTP requests are mocked
- **Automatic mock reset** - Mocks are reset between tests
- **TypeScript support** - Full type checking in tests
- **Error logging verification** - Console error calls are verified

## Key Testing Patterns

### Mocking Hono Context
```typescript
const createMockContext = (method: string = 'POST', body: any = {}) => {
  // Mock request and context objects
}
```

### OpenAI Service Mocking
```typescript
const mockOpenAI = {
  chatCompletion: vi.fn(),
  generateSummary: vi.fn(),
  generateRecommendations: vi.fn()
} as any
```

### Abort Signal Testing
```typescript
const abortController = new AbortController()
// Test with abortController.signal
```

## Error Scenarios Covered

- Invalid HTTP methods (non-POST)
- Missing or invalid request data
- OpenAI API errors and rate limiting
- Network failures
- Request cancellation (abort signals)
- Malformed JSON responses
- Long content handling
- Special characters and edge cases

All services have robust error handling with appropriate HTTP status codes and user-friendly error messages.