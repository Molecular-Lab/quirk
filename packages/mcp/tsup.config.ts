import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm'],
	dts: true,
	sourcemap: true,
	clean: true,
	splitting: false,
	treeshake: true,
	target: 'es2022',
	outDir: 'dist',
	shims: true, // Add shims for Node.js __dirname, __filename, etc.
})
