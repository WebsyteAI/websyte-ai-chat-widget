# Test Suite for Websyte AI Chat Widget Services

This directory contains comprehensive tests for the worker services in the `workers/services/` directory.

## Test Framework

- **Vitest** - Fast unit test framework with TypeScript support
- **jsdom** - DOM environment for testing
- **vi** - Built-in mocking utilities

## Test Coverage

Current test coverage is **100% statements, 100% functions, 100% lines, 98% branches**.

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