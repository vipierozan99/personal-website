import { buildContent, type SiteContent, type SiteDocument } from "./model";

/**
 * One lazy chunk per language. The `.md` files are parsed to an AST by the
 * `comark()` Vite plugin at build time and reach the browser as plain JSON, so
 * no parser ships — and the glob keeps each language out of the app bundle, so
 * a session only ever downloads the ones it is shown.
 */
const content = import.meta.glob("./site.*.md", {
	import: "default",
}) as Record<string, () => Promise<unknown>>;

const PREFIX = "./site.";
const SUFFIX = ".md";

const path = (locale: string) => `${PREFIX}${locale}${SUFFIX}`;

export const DEFAULT_LOCALE = "en";

export const LOCALES = Object.keys(content)
	.map((key) => key.slice(PREFIX.length, -SUFFIX.length))
	.sort();

function isLocale(value: string): boolean {
	return path(value) in content;
}

/**
 * Content already in memory. The dynamic import is itself cached by the module
 * registry, so this is not about avoiding a second fetch — it is about being
 * able to answer "is this language ready?" *synchronously*, which is what
 * decides whether switching to it can run inside one view transition.
 */
const loaded = new Map<string, SiteContent>();

export function cachedContent(locale: string): SiteContent | undefined {
	return loaded.get(locale);
}

export async function loadContent(locale: string): Promise<SiteContent> {
	const hit = loaded.get(locale);
	if (hit) return hit;

	const load = content[path(locale)];
	if (!load) {
		throw new Error(
			`no content for locale "${locale}" — known locales: ${LOCALES.join(", ")}`,
		);
	}

	const built = buildContent((await load()) as SiteDocument);
	loaded.set(locale, built);
	return built;
}

/**
 * Warms a locale so selecting it later is synchronous. Called on hover and
 * focus of a language control; a failure here is not worth surfacing, since
 * the real load will report it.
 */
export function prefetchContent(locale: string): void {
	if (loaded.has(locale) || !isLocale(locale)) return;
	void loadContent(locale).catch(() => {});
}
