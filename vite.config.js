import { defineConfig } from 'vite';

// База нужна для деплоя на GitHub Pages в подпапку.
// Переопределяется переменной окружения BASE_PATH при сборке.
export default defineConfig({
  base: process.env.BASE_PATH || './',
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/core/**', 'src/services/**'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    }
  }
});
