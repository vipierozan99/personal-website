import { parse } from "@formatjs/icu-messageformat-parser";
import type { Plugin } from "vite";

const CATALOG = /\/src\/i18n\/[a-z-]+\.json$/;

/**
 * Parses the ICU catalogs to AST at build time.
 *
 * `IntlMessageFormat` takes either a string, which it parses, or an AST, which
 * it formats directly — so precompiling lets the parser be aliased out of the
 * bundle entirely (see `resolve.alias` in `vite.config.ts`). That is ~9.6 kB
 * gzipped, against ~60 B of extra catalog, and the parser is 84% of
 * `intl-messageformat`.
 *
 * The invariant this creates: with the parser gone, *every* message must be an
 * AST by the time it reaches the formatter. A string arriving at runtime throws
 * rather than rendering. Catalogs are the only source of messages here, and this
 * plugin compiles all of them — but a `defaultValue` passed at a call site would
 * be a string, so don't.
 *
 * The parser is pinned to the exact version nested under `intl-messageformat`,
 * because the AST is an internal format: a build-time parser newer than the
 * runtime formatter can emit nodes the formatter does not understand.
 */
export function icuAst(): Plugin {
	return {
		name: "icu-ast",
		// Ahead of Vite's own JSON handling, so `code` is still raw JSON text.
		enforce: "pre",

		transform(code, id) {
			if (!CATALOG.test(id)) return;

			const compile = (value: unknown): unknown => {
				if (typeof value === "string") return parse(value);
				if (value && typeof value === "object") {
					return Object.fromEntries(
						Object.entries(value).map(([key, child]) => [key, compile(child)]),
					);
				}
				throw new Error(`unexpected ${typeof value} in a message catalog`);
			};

			try {
				// Still JSON, not a module: Vite's own JSON plugin runs after this and
				// turns the result into one.
				return { code: JSON.stringify(compile(JSON.parse(code))), map: null };
			} catch (error) {
				this.error(`${id}\n  ${(error as Error).message}`);
			}
		},
	};
}
