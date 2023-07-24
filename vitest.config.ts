import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@orch/core': './packages/core/src',
      '@orch/react': './packages/react/src',
    },
  },
})
