import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/tests/**/*.test.js'],
    globals: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    setupFiles: ['./tests/setup.js']
  }
}); 