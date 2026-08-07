import { describe, expect, it, vi } from "vitest";
import { DEFAULT_LOCALE, loadContent, LOCALES } from "./load";

describe("loadContent", () => {
	it("discovers one locale per content directory", () => {
		expect(LOCALES).toEqual(["de", "en", "pt"]);
	});

	it("falls back to English for a locale with no document", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const [fallback, english] = await Promise.all([
			loadContent("fr"),
			loadContent(DEFAULT_LOCALE),
		]);
		expect(fallback).toBe(english);
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining("no src/content/fr/site.md"),
		);
		warn.mockRestore();
	});
});
