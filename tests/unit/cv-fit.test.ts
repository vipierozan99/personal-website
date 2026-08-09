import { describe, expect, it } from "vitest";
// `?raw` rather than node:fs: the app tsconfig has no Node types, and importing
// prerender.js for real would run it.
import prerenderSource from "../../scripts/prerender.js?raw";
import { sheetFit } from "../../src/components/cv/fit";

/**
 * scripts/prerender.js carries a hand-written copy of this computation as an
 * inline script, so a direct /cv load is sized before first paint. Nothing but
 * a comment keeps the two in step, so the copy is extracted and run here
 * against the same inputs.
 */
const inlineFit = (() => {
	const literal = prerenderSource.match(
		/const FIT_SCRIPT = `([\s\S]*?)`;/,
	)?.[1];
	if (!literal) throw new Error("no FIT_SCRIPT in scripts/prerender.js");

	// The literal interpolates its constants, so it is evaluated as the
	// template it is before the script body can be pulled out of the markup.
	const markup = new Function(`return \`${literal}\`;`)() as string;
	const body = markup.match(/<script>([\s\S]*)<\/script>/)?.[1];
	if (!body) throw new Error("FIT_SCRIPT carries no script body");

	return (width: number, height: number, portrait: boolean) => {
		let applied: string | undefined;
		const documentStub = {
			documentElement: {
				style: {
					setProperty: (name: string, value: string) => {
						if (name === "--cv-fit") applied = value;
					},
				},
			},
		};
		const windowStub = {
			screen: { width, height },
			matchMedia: () => ({ matches: portrait, addEventListener: () => {} }),
		};
		new Function("window", "document", body)(windowStub, documentStub);
		if (applied === undefined) throw new Error("FIT_SCRIPT set no --cv-fit");
		return Number(applied);
	};
})();

const device = (width: number, height: number, portrait: boolean) =>
	portrait ? Math.min(width, height) : Math.max(width, height);

describe("sheetFit", () => {
	it("never enlarges a sheet on a wide screen", () => {
		expect(sheetFit(2560)).toBe(1);
	});

	it("scales a sheet down to a phone", () => {
		// 21cm is 793.7px at the CSS reference, plus a 1rem gutter each side.
		expect(sheetFit(390)).toBeCloseTo((390 - 32) / 793.7007874015748, 10);
	});

	it("is monotonic in the device width", () => {
		expect(sheetFit(320)).toBeLessThan(sheetFit(768));
	});

	/**
	 * KNOWN BUG — fit.ts has no lower clamp. A screen width of 0, which is what
	 * a headless or not-yet-laid-out browser reports, yields a negative scale
	 * and flips every sheet through the origin.
	 */
	it.fails("stays positive for a zero-width screen", () => {
		expect(sheetFit(0)).toBeGreaterThan(0);
	});
});

describe("the prerender copy of sheetFit", () => {
	it("matches sheetFit across the range of real devices", () => {
		const screens = [
			[320, 568],
			[390, 844],
			[414, 896],
			[768, 1024],
			[820, 1180],
			[1280, 800],
			[2560, 1440],
		] as const;

		for (const [width, height] of screens) {
			for (const portrait of [true, false]) {
				expect(inlineFit(width, height, portrait)).toBe(
					sheetFit(device(width, height, portrait)),
				);
			}
		}
	});

	it("picks the same screen edge per orientation", () => {
		// Portrait takes the short edge, landscape the long one — the copy must
		// agree, or a rotated phone gets a factor computed off the wrong axis.
		expect(inlineFit(390, 844, true)).toBe(sheetFit(390));
		expect(inlineFit(390, 844, false)).toBe(sheetFit(844));
	});
});
