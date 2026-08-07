/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		// Must run before react() so route files are transformed first.
		tanstackRouter({ target: "react", autoCodeSplitting: false }),
		react(),
		tailwindcss(),
	],
	build: {
		// The prerender step reads this to find the hashed chunk of the content it
		// rendered, so it can preload it next to the app bundle instead of leaving
		// the browser to discover it one round trip later.
		manifest: true,
	},
	test: {
		environment: "node",
	},
});
