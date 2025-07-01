import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'build', '.react-router'],
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['workers/services/**/*.ts', 'workers/app.ts', 'workers/routes/**/*.ts'],
      exclude: ['workers/services/**/*.test.ts', 'workers/services/**/*.spec.ts', 'workers/**/*.integration.test.ts'],
      reporter: ['text', 'json', 'html']
    }
  },
})