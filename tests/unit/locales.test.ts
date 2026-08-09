import { describe, expect, it } from "vitest";
import { cvContent, DEFAULT_LOCALE, siteContent } from "../../src/content/load";
import { createI18n } from "../../src/i18n";
import { Route } from "../../src/routes/__root";

/**
 * Three lists decide which languages exist, and none of them derives from
 * another: site content comes from a glob over src/content, UI strings from the
 * catalogs in src/i18n, and the switchable languages from a hand-written union
 * in routes/__root. A locale present in one and absent from another is a button
 * that does nothing, or an assertLocale throw during render.
 */
const validate = Route.options.validateSearch as (
	search: Record<string, unknown>,
) => { lang?: string };

const switchable = (locale: string) =>
	validate({ lang: locale }).lang === locale;

describe("locale agreement", () => {
	it("has UI strings for every site locale", async () => {
		for (const locale of siteContent.LOCALES) {
			await expect(createI18n(locale)).resolves.toBeDefined();
		}
	});

	it("has site content for every CV locale", () => {
		for (const locale of cvContent.LOCALES) {
			expect(siteContent.LOCALES).toContain(locale);
		}
	});

	it("makes every non-default site locale reachable through ?lang", () => {
		for (const locale of siteContent.LOCALES) {
			if (locale === DEFAULT_LOCALE) continue;
			expect(switchable(locale)).toBe(true);
		}
	});

	it("normalizes the default locale to an absent param", () => {
		expect(switchable(DEFAULT_LOCALE)).toBe(false);
	});

	it("knows the default locale in both content sets", () => {
		expect(siteContent.LOCALES).toContain(DEFAULT_LOCALE);
		expect(cvContent.LOCALES).toContain(DEFAULT_LOCALE);
	});
});
