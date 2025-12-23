import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm'],
	dts: false, // Disabled due to deep type recursion in @modelcontextprotocol/sdk v1.24.3
	sourcemap: true,
	clean: true,
	splitting: false,
	treeshake: true,
	target: 'es2022',
	outDir: 'dist',
	shims: true, // Add shims for Node.js __dirname, __filename, etc.
})
