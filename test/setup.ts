import { beforeEach, vi } from 'vitest'

// Mock global fetch for all tests
global.fetch = vi.fn()

// Reset all mocks before each test
beforeEach(() => {
  vi.resetAllMocks()
})