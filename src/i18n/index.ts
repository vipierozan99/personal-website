import { createInstance, type i18n, type TFunction } from "i18next";
import ICU from "i18next-icu";
import de from "./de.json";
import en from "./en.json";
import pt from "./pt.json";

/**
 * Catalogs are in ICU MessageFormat, which i18next does not speak natively —
 * hence the `i18next-icu` plugin. Note ICU's quoting rule when adding strings:
 * an apostrophe before `{`, `}` or `#` opens a literal section instead of
 * printing itself.
 */
const resources = {
	en: { translation: en },
	de: { translation: de },
	pt: { translation: pt },
};

type UILocale = keyof typeof resources;

const UI_LOCALES = Object.keys(resources) as UILocale[];

/**
 * The instance holding every locale's catalog.
 *
 * Resources are bundled rather than fetched and `initAsync` is off, so this
 * settles in one tick: the prerendered HTML and the browser's first render are
 * produced from identical strings. An async backend or a Suspense boundary
 * here would mean hydrating markup the client cannot yet reproduce.
 *
 * `lng` seeds the instance so it never contradicts the page it is rendering,
 * but it is not what strings are read through: every read goes via
 * `translator`, bound to the selected language held in React state. Keeping
 * the instance's own language a downstream mirror rather than an input is what
 * stops it becoming a second, mutable source of truth.
 */
export async function createI18n(locale: string): Promise<i18n> {
	assertLocale(locale);

	const instance = createInstance();
	await instance.use(ICU).init({
		lng: locale,
		fallbackLng: "en",
		resources,
		initAsync: false,
		// React escapes on render; escaping here too would double-encode.
		interpolation: { escapeValue: false },
	});
	return instance;
}

/**
 * i18next resolves an unknown locale to `fallbackLng` without complaint, which
 * in a prerender means silently shipping a page in the wrong language.
 */
function assertLocale(locale: string): void {
	if (!UI_LOCALES.includes(locale as UILocale)) {
		throw new Error(
			`no UI strings for locale "${locale}" — known locales: ${UI_LOCALES.join(", ")}`,
		);
	}
}

/** Strings bound to one locale, independent of the instance's own language. */
export function translator(instance: i18n, locale: string): TFunction {
	assertLocale(locale);
	return instance.getFixedT(locale);
}

/**
 * Points the instance's own language at the selected one. Nothing this app
 * renders reads it — `translator` is the only read path — but `i18n.language`,
 * `dir()` and a bare `i18n.t()` are all observable, and an instance that
 * disagreed with the page would be a trap for whatever touches it next.
 */
export function syncLanguage(instance: i18n, locale: string): void {
	assertLocale(locale);
	if (instance.language !== locale) void instance.changeLanguage(locale);
}
