import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Include test files from __tests__ directory
    include: ['__tests__/**/*.test.ts'],

    // Exclude node_modules and dist
    exclude: ['node_modules', 'dist'],

    // Enable globals for describe, it, expect without imports
    globals: true,

    // Use Node environment for file system operations
    environment: 'node',

    // Coverage configuration
    coverage: {
      // Use v8 for coverage (faster than istanbul)
      provider: 'v8',

      // Source files to measure coverage for
      include: ['src/**/*.ts'],

      // Exclude test files and type definitions
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts', // Re-export files typically don't need coverage
      ],

      // Coverage thresholds - aim for 80%
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70, // Slightly lower for branches as some edge cases are hard to test
        statements: 80,
      },

      // Report formats
      reporter: ['text', 'text-summary', 'lcov', 'html'],

      // Output directory for coverage reports
      reportsDirectory: './coverage',
    },

    // TypeScript support via native esbuild
    typecheck: {
      enabled: false, // Separate typecheck script handles this
    },

    // Test timeout (10 seconds for file I/O tests)
    testTimeout: 10000,

    // Run tests in sequence for audit tests that use file system
    sequence: {
      shuffle: false,
    },
  },
});
