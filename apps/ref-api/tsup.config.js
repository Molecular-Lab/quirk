/* eslint-disable no-undef */
import { defineConfig } from "tsup"

import fs from "fs"
import path from "path"

// Automatically resolve all imported shared packages from the current app's package.json
const resolvePackages = () => {
	const packageJsonPath = path.resolve(__dirname, "package.json")
	if (!fs.existsSync(packageJsonPath)) {
		throw new VError(`Cannot find package.json at ${packageJsonPath}`)
	}

	// Filter dependencies with "workspace:*" or "*" versions
	return Object.entries(JSON.parse(fs.readFileSync(packageJsonPath, "utf8")).dependencies || {})
		.filter(([_, version]) => version.startsWith("workspace:") || version === "*")
		.map(([name]) => name)
}

export default defineConfig({
	entry: ["src/server.ts"],
	bundle: true,
	splitting: true,
	sourcemap: true,
	clean: true,
	outDir: "dist",
	format: "cjs",
	noExternal: [...resolvePackages()],
})
