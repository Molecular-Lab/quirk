import generouted from "@generouted/react-router/plugin"
import particleWasmPlugin from "@particle-network/vite-plugin-wasm"
import inject from "@rollup/plugin-inject"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
	define: {
		global: {},
	},
	plugins: [
		react(),
		tsconfigPaths(),
		generouted(),
		particleWasmPlugin(),
		nodePolyfills({
			// https://github.com/davidmyersdev/vite-plugin-node-polyfills?tab=readme-ov-file#all-polyfills
			include: ["process"],
			exclude: [],
			globals: {
				global: true,
				Buffer: true,
			},
			overrides: {
				zlib: "browserify-zlib",
			},
		}),
	],
	optimizeDeps: {
		esbuildOptions: {
			// Node.js global to browser globalThis
			define: {
				global: "globalThis",
			},
		},
	},
	build: {
		rollupOptions: {
			plugins: [
				inject({
					Buffer: ["buffer", "Buffer"],
				}),
			],
		},
	},
	// resolve: {
	// 	alias: {
	// 		buffer: "rollup-plugin-node-polyfills/polyfills/buffer-es6",
	// 	},
	// },
})
