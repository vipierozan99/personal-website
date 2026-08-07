/// <reference types="vite/client" />

declare module "*.md" {
	// Parsed to a Comark AST at build time by vite/comark.ts; narrow at the loader.
	const document: unknown;
	export default document;
}

/** Start of the UTC day the bundle was built; see `define` in vite.config.ts. */
declare const __BUILD_TIME__: number;
