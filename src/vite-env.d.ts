/// <reference types="vite/client" />

declare module "*.md" {
	// Parsed to a Comark AST at build time by vite/comark.ts; narrow at the loader.
	const document: unknown;
	export default document;
}
