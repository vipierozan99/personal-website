import { describe, expect, it } from "vitest";
import { createI18n, translator } from "../i18n";
import { formatDuration, monthsBetween, shortMonth } from "./dates";

describe("dates", () => {
	it("shortMonth renders MM/YY", () => {
		expect(shortMonth("2024-10")).toBe("10/24");
	});

	it("monthsBetween spans years and accepts a Date", () => {
		expect(monthsBetween("2024-10", "2026-08")).toBe(22);
		expect(monthsBetween("2026-01", new Date(2026, 7, 1))).toBe(7);
	});

	it("formatDuration joins years and months through ICU plurals", async () => {
		const t = translator(await createI18n("en"), "en");
		expect(formatDuration(22, t)).toBe("1 yr 10 mo");
		expect(formatDuration(24, t)).toBe("2 yr");
		expect(formatDuration(0, t)).toBe("0 mo");
	});
});
