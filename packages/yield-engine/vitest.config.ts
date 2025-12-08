import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		testTimeout: 120000, // 2 minutes for integration tests
		hookTimeout: 30000,
	},
})

