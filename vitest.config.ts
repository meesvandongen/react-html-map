import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./test/setup.ts"],
		include: ["test/**/*.test.{ts,tsx}"],
		coverage: {
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["src/**/*.d.ts"],
		},
	},
	resolve: {
		alias: {
			"@": "/src",
		},
	},
});
