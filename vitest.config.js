export default {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
  },
  resolve: {
    alias: {
      '@': '.',
    },
  },
}