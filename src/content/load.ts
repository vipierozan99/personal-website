import type { CvDocument } from "./cv-model";
import { buildContent, type SiteContent, type SiteDocument } from "./model";

export const DEFAULT_LOCALE = "en";

export type Loader<T> = {
	/** Locales that actually have this document. */
	LOCALES: readonly string[];
	/** Synchronous — decides whether a switch can run inside one view transition. */
	cached(locale: string): T | undefined;
	load(locale: string): Promise<T>;
	/** Warm a locale on hover/focus; failures resurface on the real load. */
	prefetch(locale: string): void;
};

/**
 * One lazy chunk per language, from `src/content/<locale>/<name>`. The `.md`
 * files are parsed to an AST by the `comark()` Vite plugin at build time and
 * reach the browser as plain JSON, so no parser ships — and the glob keeps
 * each language out of the app bundle, so a session only ever downloads the
 * ones it is shown.
 */
function createLoader<T>(
	modules: Record<string, () => Promise<unknown>>,
	name: string,
	build: (module: unknown) => T,
): Loader<T> {
	const path = (locale: string) => `./${locale}/${name}`;

	const LOCALES = Object.keys(modules)
		.map((key) => key.slice("./".length, -`/${name}`.length))
		.sort();

	/** The dynamic import is cached by the module registry anyway; this map is
	 *  what answers "is this language ready?" synchronously. */
	const loaded = new Map<string, T>();

	/** Loads already under way, so concurrent callers share one build — the
	 *  result cache alone cannot dedupe them, it is written after the await. */
	const inflight = new Map<string, Promise<T>>();

	const load = (locale: string): Promise<T> => {
		const hit = loaded.get(locale);
		if (hit) return Promise.resolve(hit);

		const pending = inflight.get(locale);
		if (pending) return pending;

		const module = modules[path(locale)];
		if (!module) {
			// A locale that exists in the UI but has no document yet reads in
			// English rather than crashing — deliberately NOT cached under the
			// requested locale, so adding the file later just starts working.
			if (locale !== DEFAULT_LOCALE) {
				console.warn(
					`no src/content/${locale}/${name} — falling back to ${DEFAULT_LOCALE}`,
				);
				return load(DEFAULT_LOCALE);
			}
			return Promise.reject(
				new Error(
					`no ${name} for "${DEFAULT_LOCALE}" — known locales: ${LOCALES.join(", ")}`,
				),
			);
		}

		const promise = module()
			.then((loadedModule) => {
				const built = build(loadedModule);
				loaded.set(locale, built);
				return built;
			})
			.finally(() => inflight.delete(locale));
		inflight.set(locale, promise);
		return promise;
	};

	return {
		LOCALES,
		cached: (locale) => loaded.get(locale),
		load,
		prefetch: (locale) => {
			if (loaded.has(locale) || !(path(locale) in modules)) return;
			void load(locale).catch(() => {});
		},
	};
}

export const siteContent = createLoader<SiteContent>(
	import.meta.glob("./*/site.md", { import: "default" }),
	"site.md",
	(module) => buildContent(module as SiteDocument),
);

export const cvContent = createLoader<CvDocument>(
	import.meta.glob("./*/cv.md", { import: "default" }),
	"cv.md",
	// Sheets are built from the AST at render time (see components/cv); the
	// document itself is the model.
	(module) => module as CvDocument,
);
