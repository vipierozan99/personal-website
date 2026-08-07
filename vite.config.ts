/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
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
	test: {
		environment: "node",
	},
});
