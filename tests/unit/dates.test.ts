import { describe, expect, it } from "vitest";
import { createI18n, translator } from "../../src/i18n";
import { formatDuration, monthsBetween, shortMonth } from "../../src/lib/dates";

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

	/**
	 * KNOWN BUG — dates.ts:14 reads getFullYear/getMonth, which are local, while
	 * the Date it is given is `__BUILD_TIME__`: UTC midnight (vite.config.ts).
	 * West of UTC that instant belongs to the previous month, so every live role
	 * in the prerendered HTML and the committed PDFs is a month short. The suite
	 * pins TZ=America/Sao_Paulo so this is deterministic.
	 */
	it.fails("monthsBetween reads a UTC-midnight instant as its UTC month", () => {
		expect(monthsBetween("2026-01", new Date(Date.UTC(2026, 7, 1)))).toBe(7);
	});

	/**
	 * KNOWN BUG — dates.ts:24-28 has no negative guard, and `%` keeps the sign,
	 * so a role whose `from` is in the future renders "-1 yr -1 mo". Reachable
	 * because cv-schema only orders `from` against a literal `to`, never `now`.
	 */
	it.fails("formatDuration floors a negative span at zero", async () => {
		const t = translator(await createI18n("en"), "en");
		expect(formatDuration(-1, t)).toBe("0 mo");
	});

	/**
	 * KNOWN BUG — dates.ts:5 destructures without validating, so a bare year
	 * yields "undefined/24". The YYYY-MM shape is enforced only by cv-schema,
	 * and only for files whose path matches comark.ts's dissectPath regex.
	 */
	it.fails("shortMonth rejects an ISO that carries no month", () => {
		expect(() => shortMonth("2024")).toThrow();
	});
});
