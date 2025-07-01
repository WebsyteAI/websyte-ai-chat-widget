# Integration Testing Framework

## Overview

Comprehensive integration testing setup for the Websyte AI Chat Widget, enabling testing against real services or mocks for flexible CI/CD pipelines.

## Test Configuration

### Vitest Integration Config (`vitest.integration.config.ts`)
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/integration/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    include: ['test/integration/**/*.test.ts'],
    poolOptions: {
      threads: {
        singleThread: true, // Run tests sequentially
      },
    },
  },
});
```

## Test Factory Architecture

### API Test Factory (`test/integration/api-test-factory.ts`)
Creates real app instances with optional service mocking:

```typescript
interface MockOptions {
  openai?: boolean;  // Mock OpenAI API calls
  apify?: boolean;   // Mock Apify crawler calls
}

export async function createTestApp(options?: { 
  mocks?: MockOptions;
}): Promise<TestAppResult>
```

**Features:**
- Real database connections for authentic testing
- Service mocking for CI/CD environments
- Automatic cleanup after tests
- Session management for authenticated routes

### Test Utilities (`test/integration/test-utils.ts`)

#### Database Management
```typescript
export async function cleanupTestData(db: NeonHttpDatabase) {
  // Cleans up test data in reverse dependency order
  await db.delete(messages);
  await db.delete(widgetFiles);
  await db.delete(embeddings);
  await db.delete(widgets);
  await db.delete(sessions);
  await db.delete(users);
}
```

#### Session Creation
```typescript
export async function createTestSession(
  userId: string, 
  appUrl: string
): Promise<string>
```

## Test Structure

### Directory Organization
```
test/integration/
├── setup.ts                    # Global test setup
├── api-test-factory.ts         # App instance factory
├── test-utils.ts              # Common utilities
├── auth.test.ts               # Authentication flows
├── automation-api.test.ts     # Bearer token API
├── widget-basic.test.ts       # Basic widget CRUD
└── widget-extended.test.ts    # Advanced widget features
```

### Test Categories

#### 1. Authentication Tests (`auth.test.ts`)
- User login flows
- Session management
- Protected route access
- OAuth provider integration

#### 2. Automation API Tests (`automation-api.test.ts`)
- Bearer token authentication
- Widget listing with pagination
- Widget creation as system user
- Crawling workflow initiation
- Recommendation generation

#### 3. Widget Tests (`widget-basic.test.ts`, `widget-extended.test.ts`)
- CRUD operations
- Content management
- Vector search functionality
- Public/private access control
- Crawling integration

## Running Tests

### Commands
```bash
# Run all integration tests
pnpm test:integration

# Run with coverage
pnpm test:integration --coverage

# Run specific test file
pnpm test:integration auth.test.ts

# Run in watch mode
pnpm test:integration --watch
```

### Environment Variables
Required for integration tests:
```env
# Database
DATABASE_URL=your-test-database-url

# Auth
BETTER_AUTH_SECRET=test-secret
GOOGLE_CLIENT_ID=test-client-id
GOOGLE_CLIENT_SECRET=test-client-secret

# API Keys (can be mocked)
OPENAI_API_KEY=test-key
APIFY_API_TOKEN=test-token

# Test-specific
API_BEARER_TOKEN=test-bearer-token
```

## Writing Integration Tests

### Basic Test Structure
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestApp } from './api-test-factory';

describe('Feature Tests', () => {
  let app: TestAppResult;
  
  beforeAll(async () => {
    app = await createTestApp({ 
      mocks: { openai: true } // Mock external services
    });
  });
  
  afterAll(async () => {
    await app.cleanup();
  });
  
  it('should perform feature', async () => {
    const response = await app.client.api.endpoint.$post({
      json: { data: 'test' }
    });
    
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result).toHaveProperty('success', true);
  });
});
```

### Testing Authenticated Routes
```typescript
it('should access protected route', async () => {
  // Create test user
  const userId = await createTestUser(app.db);
  
  // Create session
  const cookie = await createTestSession(userId, app.url);
  
  // Make authenticated request
  const response = await app.client.api.protected.$get({
    headers: { Cookie: cookie }
  });
  
  expect(response.status).toBe(200);
});
```

### Testing with Mocks
```typescript
describe('With Mocked Services', () => {
  let app: TestAppResult;
  
  beforeAll(async () => {
    app = await createTestApp({ 
      mocks: { 
        openai: true,  // Mock OpenAI responses
        apify: true    // Mock crawler responses
      } 
    });
  });
  
  it('should handle mocked OpenAI', async () => {
    // OpenAI calls will return predictable mock responses
    const response = await app.client.api.chat.$post({
      json: { message: 'test' }
    });
    
    const result = await response.json();
    expect(result.response).toContain('mocked response');
  });
});
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Clean up test data after each test
- Use unique identifiers for test data

### 2. Service Mocking
- Mock external services in CI/CD
- Use real services for local development
- Ensure mocks match real service behavior

### 3. Error Testing
- Test error scenarios explicitly
- Verify error messages and status codes
- Test rate limiting and validation

### 4. Performance
- Keep tests focused and fast
- Use database transactions when possible
- Parallelize independent test suites

### 5. Debugging
- Use `console.log` for debugging (visible in test output)
- Inspect database state during tests
- Use VS Code debugger with breakpoints

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Integration Tests
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
    BETTER_AUTH_SECRET: test-secret
    OPENAI_API_KEY: test-key
    APIFY_API_TOKEN: test-token
  run: |
    pnpm test:integration --coverage
```

### Mock Strategy for CI
- Always mock external APIs in CI
- Use real database (separate test instance)
- Validate mock responses match production

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Check network connectivity
   - Ensure test database exists

2. **Port Conflicts**
   - Tests use random ports (50000-60000)
   - Kill any hanging processes
   - Check for other services on ports

3. **Timeout Errors**
   - Increase test timeout in config
   - Check for hanging async operations
   - Verify external service connectivity

4. **Mock Failures**
   - Ensure mock implementations match interfaces
   - Check for version mismatches
   - Verify mock data is valid

## Future Enhancements

- Snapshot testing for API responses
- Performance benchmarking
- Load testing integration
- Visual regression testing for widget UI
- Contract testing with external services