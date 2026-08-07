import { describe, expect, it, vi } from "vitest";
import { cvContent, DEFAULT_LOCALE, siteContent } from "./load";

describe("loadContent", () => {
	it("discovers one locale per content directory", () => {
		expect(siteContent.LOCALES).toEqual(["de", "en", "pt"]);
		expect(cvContent.LOCALES).toEqual(["de", "en"]);
	});

	it("falls back to English for a locale with no document", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const [fallback, english] = await Promise.all([
			siteContent.load("fr"),
			siteContent.load(DEFAULT_LOCALE),
		]);
		expect(fallback).toBe(english);
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining("no src/content/fr/site.md"),
		);
		warn.mockRestore();
	});

	it("serves the English CV to locales without one", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const [fallback, english] = await Promise.all([
			cvContent.load("pt"),
			cvContent.load(DEFAULT_LOCALE),
		]);
		expect(fallback).toBe(english);
		expect(fallback.frontmatter.locale).toBe("en");
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining("no src/content/pt/cv.md"),
		);
		warn.mockRestore();
	});
});
