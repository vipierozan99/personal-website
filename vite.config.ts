/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";
import { comark } from "./vite/comark.ts";
import { icuAst } from "./vite/icu-ast.ts";

export default defineConfig({
	plugins: [
		// Must run before react() so route files are transformed first.
		tanstackRouter({ target: "react", autoCodeSplitting: false }),
		react(),
		tailwindcss(),
		comark(),
		icuAst(),
	],
	resolve: {
		alias: [
			{
				/**
				 * `intl-messageformat` reaches its parser through this bare specifier,
				 * so redirecting it swaps in a stub whose `parse()` throws — dropping
				 * the parser, 84% of that package, from the bundle.
				 *
				 * Sound only because `icuAst()` compiles every catalog to AST, which
				 * the formatter takes verbatim. A message that is still a string when
				 * it reaches the formatter throws instead of rendering.
				 */
				// Anchored: a plain string would also match the replacement's own
				// subpath and rewrite it a second time.
				find: /^@formatjs\/icu-messageformat-parser$/,
				replacement: "@formatjs/icu-messageformat-parser/no-parser.js",
			},
		],
	},
	build: {
		// The prerender step reads this to find the hashed chunk of the content it
		// rendered, so it can preload it next to the app bundle instead of leaving
		// the browser to discover it one round trip later.
		manifest: true,
	},
	define: {
		/**
		 * Anchors the "now" a live CV role's duration is measured against. The
		 * client bundle and the SSR pass are separate `vite build` invocations,
		 * so this is rounded down to the start of the UTC day: both evaluate it
		 * to the same number and hydration sees identical text.
		 */
		__BUILD_TIME__: new Date().setUTCHours(0, 0, 0, 0),
	},
	/**
	 * Three tiers, split by what each can actually observe, one directory under
	 * tests/ each with its own setup.
	 *
	 * Both `extends` and `root` are load-bearing. Without the explicit root a
	 * project resolves it to the directory of a package this config imported —
	 * the playwright provider — and the route generator then scans
	 * `@vitest/browser-playwright/src/routes` and dies.
	 */
	test: {
		projects: [
			{
				extends: true,
				root: import.meta.dirname,
				test: {
					name: "unit",
					environment: "node",
					include: ["tests/unit/**/*.test.{ts,tsx}"],
					setupFiles: ["tests/unit/setup.ts"],
					/**
					 * Pinned, and deliberately west of UTC. `__BUILD_TIME__` is UTC
					 * midnight while `monthsBetween` reads local calendar fields, so a
					 * negative offset is what makes that disagreement reproducible
					 * rather than a property of whoever ran the suite.
					 */
					env: { TZ: "America/Sao_Paulo" },
				},
			},
			{
				extends: true,
				root: import.meta.dirname,
				test: {
					name: "dom",
					environment: "happy-dom",
					include: ["tests/dom/**/*.test.{ts,tsx}"],
					setupFiles: ["tests/dom/setup.ts"],
				},
			},
			{
				extends: true,
				root: import.meta.dirname,
				test: {
					name: "browser",
					include: ["tests/browser/**/*.test.{ts,tsx}"],
					setupFiles: ["tests/browser/setup.ts"],
					// The utilities under test are generated from the markup, so the
					// real stylesheet has to reach the page rather than be stubbed.
					css: true,
					browser: {
						enabled: true,
						provider: playwright(),
						headless: true,
						instances: [{ browser: "chromium" }],
					},
				},
			},
		],
	},
});
