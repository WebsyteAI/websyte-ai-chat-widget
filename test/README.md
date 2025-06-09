# Testing Guide

## Overview

This project includes comprehensive testing for both the backend worker services and the frontend ChatWidget component architecture.

## Test Structure

### Backend Worker Services
- **Location**: `workers/services/*.test.ts`
- **Coverage**: 93 tests with 100% statement, function, and line coverage
- **Framework**: Vitest with TypeScript support

### Frontend Component Architecture
- **Location**: `app/components/ChatWidget/hooks/*.ts`
- **Architecture**: Modular hooks-based architecture for enhanced testability
- **Testing Strategy**: Individual hook testing for isolated business logic

## Running Tests

### Run All Tests
```bash
pnpm test:run
```

### Watch Mode
```bash
pnpm test
```

### Coverage Report
```bash
pnpm test:coverage
```

### Interactive UI
```bash
pnpm test:ui
```

## Frontend Testing Strategy

### ChatWidget Modular Architecture

The ChatWidget has been refactored into testable hooks:

#### `useChatMessages` Hook
**Purpose**: Message state management
```typescript
// Example test
import { renderHook, act } from '@testing-library/react';
import { useChatMessages } from '../app/components/ChatWidget/hooks/useChatMessages';

test('should add message with correct structure', () => {
  const { result } = renderHook(() => useChatMessages());
  
  act(() => {
    result.current.addMessage({
      role: 'user',
      content: 'Test message'
    });
  });
  
  expect(result.current.messages).toHaveLength(1);
  expect(result.current.messages[0]).toMatchObject({
    role: 'user',
    content: 'Test message',
    id: expect.any(String),
    timestamp: expect.any(Date)
  });
});
```

#### `useAudioPlayer` Hook
**Purpose**: Audio playback controls and state
```typescript
// Example test
test('should handle play/pause correctly', () => {
  const { result } = renderHook(() => useAudioPlayer(180));
  
  expect(result.current.isPlaying).toBe(false);
  
  act(() => {
    result.current.handlePlayPause();
  });
  
  expect(result.current.isPlaying).toBe(true);
});
```

#### `useContentSummarization` Hook
**Purpose**: Content mode switching and DOM manipulation
```typescript
// Example test
test('should change content mode correctly', () => {
  const mockExtractPageContent = jest.fn();
  const { result } = renderHook(() => 
    useContentSummarization({
      baseUrl: 'http://test.com',
      extractPageContent: mockExtractPageContent
    })
  );
  
  act(() => {
    result.current.handleContentModeChange('short');
  });
  
  expect(result.current.currentContentMode).toBe('short');
});
```

## Backend Test Coverage

### Service Files Tested
1. **ChatService** (`chat.test.ts`)
   - 23 tests covering chat endpoint functionality
   - Message processing, context handling, error scenarios

2. **RecommendationsService** (`recommendations.test.ts`)
   - 17 tests covering recommendation generation
   - Content analysis, fallback responses, API integration

3. **SummarizeService** (`summarize.test.ts`)
   - 17 tests covering content summarization
   - Content validation, token limits, error handling

4. **OpenAIService** (`openai.test.ts`)
   - 17 tests covering OpenAI API integration
   - Request formatting, response handling, abort scenarios

5. **CommonUtilities** (`common.test.ts`)
   - 19 tests covering shared utility functions
   - ServiceValidation, ErrorHandler, FallbackResponses

### Test Categories

#### Happy Path Tests
- Valid requests with proper responses
- Successful API integrations
- Correct data transformations

#### Error Handling Tests
- Invalid request formats
- API failures and timeouts
- Edge cases and boundary conditions

#### Integration Tests
- Service interaction patterns
- End-to-end request/response flows
- Mock external dependencies

## Testing Best Practices

### Hook Testing
1. **Isolation**: Test each hook independently
2. **State Changes**: Use `act()` for state updates
3. **Async Operations**: Properly handle async hook operations
4. **Cleanup**: Ensure proper cleanup after tests

### Service Testing
1. **Mocking**: Mock external dependencies (OpenAI, fetch)
2. **Error Scenarios**: Test all error conditions
3. **Data Validation**: Verify input/output data structures
4. **Performance**: Test timeout and abort scenarios

### Future Testing Plans

#### Frontend Component Tests
- Add comprehensive hook tests for new modular architecture
- Integration tests for hook combinations
- UI interaction tests with React Testing Library

#### End-to-End Tests
- Widget embedding and initialization
- Cross-browser compatibility
- Performance testing

#### Accessibility Tests
- Screen reader compatibility
- Keyboard navigation
- WCAG compliance

## Test Configuration

### Vitest Setup
- **Configuration**: `vitest.config.ts`
- **Setup File**: `test/setup.ts`
- **Coverage**: Statement, branch, function, and line coverage
- **Reporters**: JSON, HTML, and text coverage reports

### Mock Infrastructure
- Comprehensive mocking for external APIs
- Consistent test data fixtures
- Isolated test environments

## Contributing Tests

When adding new features:

1. **Write Hook Tests First**: For new custom hooks, write tests before implementation
2. **Maintain Coverage**: Ensure new code maintains 100% coverage standards
3. **Test Edge Cases**: Include error scenarios and boundary conditions
4. **Document Test Intent**: Use descriptive test names and comments
5. **Update This Guide**: Keep testing documentation current with new patterns

## Debugging Tests

### Common Issues
- **Async Operations**: Use proper async/await or waitFor patterns
- **State Updates**: Wrap state changes in `act()`
- **Cleanup**: Ensure timers and subscriptions are cleaned up
- **Mocking**: Verify mocks are properly reset between tests

### Debugging Tools
- `pnpm test:ui` for interactive debugging
- Coverage reports to identify untested code paths
- Console logging in test mode for debugging
- VS Code debugger integration for step-through debugging