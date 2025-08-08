import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.tsx"],
	format: ["cjs", "esm"],
	dts: true,
	sourcemap: true,
	clean: true,
	external: ["react"],
	outDir: "dist",
});
