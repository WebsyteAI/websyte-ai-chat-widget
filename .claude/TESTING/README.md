# Testing Documentation

This directory contains comprehensive testing documentation for the Websyte AI Chat Widget project.

## 📚 Documentation Index

### Core Testing Guides
- [**UNIT-TESTS.md**](./UNIT-TESTS.md) - Unit testing strategies and best practices
- [**INTEGRATION-TESTS.md**](./INTEGRATION-TESTS.md) - Integration testing framework and patterns
- [**E2E-TESTS.md**](./E2E-TESTS.md) - End-to-end testing with Playwright
- [**PERFORMANCE-TESTS.md**](./PERFORMANCE-TESTS.md) - Performance testing and benchmarks

### Specialized Testing
- [**API-TESTING.md**](./API-TESTING.md) - API endpoint testing strategies
- [**COMPONENT-TESTING.md**](./COMPONENT-TESTING.md) - React component testing
- [**MOCK-STRATEGIES.md**](./MOCK-STRATEGIES.md) - Mocking patterns and utilities

## 🧪 Testing Overview

### Test Coverage Goals
- **Unit Tests**: 100% coverage for business logic
- **Integration Tests**: All API endpoints and service interactions
- **E2E Tests**: Critical user journeys
- **Performance Tests**: Key operations under load

### Testing Stack
- **Test Runner**: Vitest
- **Component Testing**: React Testing Library
- **E2E Testing**: Playwright
- **API Testing**: Supertest with Vitest
- **Mocking**: Vitest mocks and MSW

## 🚀 Quick Commands

```bash
# Run all tests
pnpm test

# Run unit tests
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test path/to/test.spec.ts

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e
```

## 📋 Testing Principles

### 1. Test Pyramid
```
         /\
        /E2E\
       /------\
      /  Integ \
     /----------\
    /    Unit    \
   /--------------\
```

### 2. Test Structure (AAA Pattern)
```typescript
test('should do something', () => {
  // Arrange
  const input = setupTestData();
  
  // Act
  const result = functionUnderTest(input);
  
  // Assert
  expect(result).toBe(expectedValue);
});
```

### 3. Test Isolation
- Each test should be independent
- No shared state between tests
- Clean up after each test
- Mock external dependencies

## 🎯 What to Test

### Unit Tests
- Pure functions
- Business logic
- Data transformations
- Error handling
- Edge cases

### Integration Tests
- API endpoints
- Database operations
- Service interactions
- Authentication flows
- File operations

### E2E Tests
- User registration/login
- Chat conversations
- Widget embedding
- Document uploads
- Critical paths

## 🔧 Testing Environment

### Environment Variables
```bash
# .env.test
NODE_ENV=test
DATABASE_URL=postgresql://test_db
OPENAI_API_KEY=test_key
VITEST_CLOUD_CI=true
```

### Test Database
- Separate test database
- Migrations run before tests
- Database cleaned between tests
- Seed data for consistent tests

## 📊 Coverage Requirements

### Minimum Coverage Thresholds
```json
{
  "branches": 80,
  "functions": 80,
  "lines": 90,
  "statements": 90
}
```

### Coverage Reports
- HTML reports in `coverage/`
- Console output after test runs
- CI/CD integration for PR checks

## 🐛 Debugging Tests

### Debug Single Test
```bash
# Run with Node debugger
node --inspect-brk ./node_modules/.bin/vitest run path/to/test.spec.ts

# VSCode debugging
# Use "Debug Test" lens above test functions
```

### Common Issues
1. **Async Issues**: Use `await` properly
2. **Cleanup**: Reset mocks and state
3. **Timeouts**: Adjust for slow operations
4. **Flaky Tests**: Fix race conditions

## 📈 Testing Best Practices

### Do's ✅
- Write tests first (TDD)
- Test behavior, not implementation
- Keep tests simple and focused
- Use descriptive test names
- Mock external dependencies
- Test error scenarios

### Don'ts ❌
- Don't test framework code
- Don't make tests dependent
- Don't use production data
- Don't ignore flaky tests
- Don't test private methods
- Don't over-mock

## 🔄 Continuous Integration

### CI Pipeline
1. Lint code
2. Type check
3. Run unit tests
4. Run integration tests
5. Generate coverage report
6. Run E2E tests (on merge)

### Pre-commit Hooks
```bash
# .husky/pre-commit
pnpm lint
pnpm test:unit
```

## 📝 Writing New Tests

### Test File Naming
- Unit: `*.test.ts`
- Integration: `*.integration.test.ts`
- E2E: `*.e2e.test.ts`

### Test Organization
```
test/
├── unit/
│   ├── services/
│   ├── utils/
│   └── components/
├── integration/
│   ├── api/
│   └── workflows/
└── e2e/
    ├── chat.e2e.test.ts
    └── widget.e2e.test.ts
```

---

For specific testing guidance:
- [Unit Testing Guide](./UNIT-TESTS.md)
- [Integration Testing Guide](./INTEGRATION-TESTS.md)
- [API Testing Guide](./API-TESTING.md)